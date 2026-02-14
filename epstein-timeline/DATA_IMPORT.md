# Importing Real Document Data

This app is designed to load document data from `/public/data/documents.json`. The sample data (1000 placeholder documents) can be replaced with real data when you obtain it.

## Data Schema

Each document must have:

```json
{
  "id": "unique-id",
  "date": "YYYY-MM-DD",
  "title": "Document title",
  "summary": "Brief summary or excerpt",
  "content": "Full text content (plain text only)",
  "warnings": ["explicit", "unredacted_victim"],
  "source": "Court filing",
  "people": ["Name1", "Name2"]
}
```

- **warnings** (optional): `"explicit"` for graphic/explicit descriptions, `"unredacted_victim"` for victim info that should have been redacted, `"damning"` for clearly damning info including testimony
- **people** (optional): Names mentioned; useful for filtering later

## Finding the Data

### Reddit

- **r/Epstein** — search for: `dataset`, `JSON`, `parsed`, `LLM`, `OCR`, `pdf to text`
- Community members often share links to processed datasets, OCR'd documents, or LLM-extracted summaries
- Sort by "New" — people post datasets as they process them

### Court Sources

- **PACER** (pacer.uscourts.gov) — federal court records; requires account
- **Florida Southern District** — original Epstein case jurisdiction
- **Second Circuit** — appeal and related civil suits

### Other

- FOIA releases (MuckRock, etc.)
- Journalist compilations — some publish structured data
- GitHub — search "epstein documents" for parsers/scrapers

## Conversion Scripts

If you obtain:

- **PDFs** — use `pdftotext` (poppler-utils) or a Node library like `pdf-parse`
- **CSV/TSV** — write a quick script to map columns to the schema
- **Raw text files** — batch process with filename → date extraction

Example (Node) to merge multiple JSON files:

```javascript
import fs from 'fs';
const files = fs.readdirSync('./raw').filter(f => f.endsWith('.json'));
const docs = files.flatMap(f => JSON.parse(fs.readFileSync(f, 'utf8')));
docs.sort((a, b) => a.date.localeCompare(b.date));
fs.writeFileSync('./public/data/documents.json', JSON.stringify(docs));
```

## Scaling to 3M Documents

For millions of documents:

1. **Chunk the data** — split into multiple JSON files by year or batch (e.g. `1992.json`, `1993.json`)
2. **Lazy load** — modify `App.jsx` to fetch only the visible date range or current "page"
3. **Virtual scrolling** — use `react-window` or similar so only ~50 items render at a time
4. **Index by date** — build an index file with `{ start, end, file }` for quick range lookups

The current UI handles 1000 documents smoothly. Above ~10k, consider the optimizations above.
