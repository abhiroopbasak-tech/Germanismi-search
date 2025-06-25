# Germanismi Search Interface

A lightweight, browser-based search engine for exploring data exported from Excel (in TSV format).  
This tool allows users to filter articles by multiple fields and supports advanced search features like wildcards and phrase matching.

---

## 📁 Project Structure

project-root/
├── index.html # Main HTML file
├── style.css # Styling for the interface
├── search.js # Core logic: data loading, searching, rendering
└── data/
└── germanismi.tsv # Source TSV file exported from Excel
---

## 🔍 Features

- **TSV data loading**: Parses Excel-exported TSV files with headers.
- **Search by multiple fields**:
  - `Titolo articolo`: Free text, supports wildcards and quoted phrases.
  - `Volume`, `Fascicolo`, `Data pubbl.`: Dropdowns with exact matching.
  - `Nr. col. inizio`, `Nr. col. fine`: Dropdowns with numerically sorted values.
- **Wildcard support**: Use `*` and `?` in text queries.
- **Phrase matching**: Use `"quotes"` to find exact phrases.
- **Multi-field filtering**: Results must match **all** non-empty fields (AND logic).
- **Sorted dropdowns**: Dropdown options are alphabetically or numerically sorted.
- **Instant table rendering**: Display results in a styled, scrollable table.

---

## 📦 Usage

1. Place your TSV file inside the `data/` directory. Ensure the first row contains headers.
2. Open `index.html` in your browser.
3. Fill in one or more search fields.
4. Click **Search** to view matching results.

---

## 🛠️ Customization

- Replace the `germanismi.tsv` file with your own TSV file, ensuring headers match the field names.
- Modify `search.js` to:
  - Add new searchable fields.
  - Change scoring or filtering logic.
  - Alter result display formatting.

---

## ✅ Supported Fields

| Field               | Type     | Description                                      |
|---------------------|----------|--------------------------------------------------|
| `Titolo articolo`   | Text     | Supports words, wildcards (`*`, `?`), phrases    |
| `Volume`            | Dropdown | Exact match only                                 |
| `Fascicolo`         | Dropdown | Handles entries like `1`, `3-4`, etc.            |
| `Data pubbl.`       | Dropdown | Exact string match (e.g., `1985`, `1990-91`)     |
| `Nr. col. inizio`   | Dropdown | Numeric sort; dropdown based on column numbers   |
| `Nr. col. fine`     | Dropdown | Numeric sort; dropdown based on column numbers   |

---

## 👤 Author

**Abhiroop Basak**  


---

## 🔒 License

**Do not distribute, copy, or reuse** without the author's explicit permission.
