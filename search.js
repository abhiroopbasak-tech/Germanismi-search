// search.js

let data = [];

// Load and parse TSV data from the Excel-exported file
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

function populateDropdowns(data) {
  const dropdownFields = {
    'volumeSearch': 'Volume',
    'fascicoloSearch': 'Fascicolo',
    'dataSearch': 'Data pubbl.',
    'colStartSearch': 'Nr. col. inizio',
    'colEndSearch': 'Nr. col. fine'
  };

  const forceNumericFields = ['Nr. col. inizio', 'Nr. col. fine'];

  for (const [elementId, field] of Object.entries(dropdownFields)) {
    let uniqueValues = [...new Set(data.map(row => row[field]).filter(Boolean))];

    if (forceNumericFields.includes(field)) {
      uniqueValues = uniqueValues
        .filter(v => /^\d+$/.test(v))
        .map(v => parseInt(v))
        .sort((a, b) => a - b)
        .map(v => String(v));
    } else {
      uniqueValues.sort();
    }

    const dropdown = document.getElementById(elementId);
    dropdown.innerHTML = '<option value="">-- Any --</option>' +
      uniqueValues.map(v => `<option value="${v}">${v}</option>`).join('');
  }
}

function wildcardToRegExp(pattern) {
  const escaped = pattern.replace(/[-[\]{}()+.,\\^$|#]/g, "\\$&")
                         .replace(/\*/g, ".*")
                         .replace(/\?/g, ".?");
  return new RegExp(escaped, "i");
}

function phraseMatch(text, phrase) {
  return text.toLowerCase().includes(phrase.toLowerCase());
}

function matchesField(query, value, field) {
  if (!query) return true;
  value = String(value || '');

  // Dropdown-like exact fields
  if (['Volume', 'Fascicolo', 'Data pubbl.', 'Nr. col. inizio', 'Nr. col. fine'].includes(field)) {
    const parts = value.split(/[-/;,]/).map(p => p.trim());
    return query === value || parts.includes(query);
  }

  // Free-text field: Titolo articolo
  const phraseMatchPattern = /\"(.*?)\"/g;
  const phrases = [...query.matchAll(phraseMatchPattern)].map(match => match[1]);
  const remainingQuery = query.replace(phraseMatchPattern, '').trim();
  const words = remainingQuery.split(/\s+/).filter(Boolean);

  for (const phrase of phrases) {
    if (!phraseMatch(value, phrase)) return false;
  }

  for (const word of words) {
    if (!wildcardToRegExp(word).test(value)) return false;
  }

  return true;
}

function searchDatabase(queries, fields) {
  const allBlank = Object.values(queries).every(v => !v);
  if (allBlank) return data;

  const results = [];

  data.forEach(row => {
    const isMatch = fields.every(field => matchesField(queries[field], row[field], field));
    if (isMatch) {
      results.push(row);
    }
  });

  return results;
}

function renderTable(rows, headers) {
  const container = document.getElementById('results');
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
    'Nr. col. fine': document.getElementById('colEndSearch').value
  };

  const results = searchDatabase(queries, Object.keys(queries));
  renderTable(results, Object.keys(data[0] || {}));
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchBtn').addEventListener('click', runSearch);
  loadData();
});
