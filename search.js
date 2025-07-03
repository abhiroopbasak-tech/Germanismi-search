let data = [];
volume = 1;
page = 1;


async function loadData() {
  const response = await fetch('data/germanismi.tsv');
  const text = await response.text();

  const lines = text.split(/\r?\n/);
  const headers = lines[0].split('\t');
  data = lines.slice(1).map(line => {
    const values = line.split('\t');
    const row = {};
    headers.forEach((h, i) => row[h.trim()] = values[i] ? values[i].trim() : '');
    return row;
  });

  populateDropdowns(data);
  renderTable(data, headers);
}

function expandRanges(values) {
  const expanded = new Set();

  values.forEach(value => {
    if (!value) return;
    const parts = value.split(/[-–]/).map(p => p.trim());
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const start = parseInt(parts[0], 10);
      const end = parseInt(parts[1], 10);
      for (let i = start; i <= end; i++) expanded.add(i.toString());
    } else {
      expanded.add(value);
    }
  });

  return Array.from(expanded).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function populateDropdowns(data) {
  const dropdownMap = {
    'volumeSearch': 'Volume',
    'fascicoloSearch': 'Fascicolo',
    'dataSearch': 'Data pubbl.',
    'colStartSearch': 'Nr. col. inizio',
    'colEndSearch': 'Nr. col. fine',
  };

  for (const [elementId, field] of Object.entries(dropdownMap)) {
    const rawValues = data.map(row => row[field]).filter(Boolean);
    const values = expandRanges(rawValues);
    const dropdown = document.getElementById(elementId);
    if (dropdown) {
      dropdown.innerHTML = '<option value="">-- Any --</option>' +
        values.map(v => `<option value="${v}">${v}</option>`).join('');
    }
  }

  // Populate 4 separate author dropdowns
  ['Autore1', 'Autore2', 'Autore3', 'Autore4'].forEach(field => {
    const dropdown = document.getElementById(field.toLowerCase() + 'Search');
    if (dropdown) {
      const authors = Array.from(new Set(data.map(row => row[field]).filter(Boolean))).sort();
      dropdown.innerHTML = '<option value="">-- Any --</option>' +
        authors.map(v => `<option value="${v}">${v}</option>`).join('');
    }
  });
}

function expandFieldValue(fieldValue) {
  if (!fieldValue) return [];
  const parts = fieldValue.split(/[-–]/).map(p => p.trim());
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    const start = parseInt(parts[0], 10);
    const end = parseInt(parts[1], 10);
    return Array.from({ length: end - start + 1 }, (_, i) => (start + i).toString());
  }
  return [fieldValue];
}

function matchesDropdownField(rowValue, query) {
  const expanded = expandFieldValue(rowValue);
  return expanded.includes(query);
}

function searchDatabase(queries, fields) {
  const allBlank = Object.values(queries).every(v => !v);
  if (allBlank) return data;

  return data.filter(row => {
    return fields.every(field => {
      const query = queries[field];
      if (!query) return true;

      const value = String(row[field] || '');

      if (['Volume', 'Fascicolo', 'Data pubbl.', 'Nr. col. inizio', 'Nr. col. fine'].includes(field)) {
        return matchesDropdownField(value, query);
      }

      // For each AutoreX, match exact value
      if (['Autore1', 'Autore2', 'Autore3', 'Autore4'].includes(field)) {
        return row[field] === query;
      }

      // Text search on Titolo articolo
      const phraseMatchPattern = /\"(.*?)\"/g;
      const phrases = [...query.matchAll(phraseMatchPattern)].map(match => match[1]);
      const remainingQuery = query.replace(phraseMatchPattern, '').trim();
      const words = remainingQuery.split(/\s+/).filter(Boolean);

      let matchScore = 0;
      for (const word of words) {
        const regex = new RegExp(word.replace(/\*/g, '.*'), 'i');
        if (regex.test(value)) matchScore += 1;
      }

      for (const phrase of phrases) {
        if (value.toLowerCase().includes(phrase.toLowerCase())) matchScore += 5;
      }

      return matchScore > 0;
    });
  });
}

function renderTable(rows, headers) {
  const container = document.getElementById('results');
  if (!rows.length) {
    container.innerHTML = '<p>No results found.</p>';
    return;
  }

  const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
  const tbody = rows.map(row => `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`).join('');
  container.innerHTML = `<table class="styled-table">${thead}<tbody>${tbody}</tbody></table>`;
}

async function runSearch() {
  if (data.length === 0) await loadData();

  const queries = {
    'Titolo articolo': document.getElementById('titleSearch').value,
    'Volume': document.getElementById('volumeSearch').value,
    'Fascicolo': document.getElementById('fascicoloSearch').value,
    'Data pubbl.': document.getElementById('dataSearch').value,
    'Nr. col. inizio': document.getElementById('colStartSearch').value,
    'Nr. col. fine': document.getElementById('colEndSearch').value,
    'Autore1': document.getElementById('autore1Search')?.value,
    'Autore2': document.getElementById('autore2Search')?.value,
    'Autore3': document.getElementById('autore3Search')?.value,
    'Autore4': document.getElementById('autore4Search')?.value,
  };

  const results = searchDatabase(queries, Object.keys(queries));
  renderTable(results, Object.keys(data[0] || {}));
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchBtn').addEventListener('click', runSearch);
  loadData();
});
function renderTable(rows, headers) {
  const container = document.getElementById('results');
  if (!rows.length) {
    container.innerHTML = '<p>No results found.</p>';
    return;
  }

  const thead = `
    <thead>
      <tr>
        <th>🔗</th>
        ${headers.map(h => `<th>${h}</th>`).join('')}
      </tr>
    </thead>
  `;

  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
         class="bi bi-box-arrow-up-right" viewBox="0 0 16 16">
      <path fill-rule="evenodd"
            d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 
               1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 
               .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
      <path fill-rule="evenodd"
            d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 
               9.146a.5.5 0 1 0 .708.708L15 
               1.707V5.5a.5.5 0 0 0 1 0z"/>
    </svg>
  `;

  const tbody = rows.map(row => {
    const volumeText = row['Volume'] || '';
    const pageText = row['Nr. col. inizio'] || '';

    // Extract numeric volume (e.g., "1" from "1 - GERM")
    let volume = (volumeText.match(/^(\d+)/) || [])[1];
    // Extract numeric page (e.g., "23" from "23-24")
    let page = (pageText.match(/^(\d+)/) || [])[1];

    // Fallback defaults
    if (!volume || isNaN(volume)) volume = '1';
    if (!page || isNaN(page)) page = '1';

    const url = `https://stampa.lei-digitale.it/volumes/?sector=germanismi&volume=${volume}&page=${page}`;
    const linkCell = `<td><a href="${url}" target="_blank" title="Open article">${svgIcon}</a></td>`;
    const dataCells = headers.map(h => `<td>${row[h] || ''}</td>`).join('');
    return `<tr>${linkCell}${dataCells}</tr>`;
  }).join('');

  container.innerHTML = `<table class="styled-table">${thead}<tbody>${tbody}</tbody></table>`;
}
