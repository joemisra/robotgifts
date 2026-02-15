# Document Timeline — Epstein Files

A split-view app for navigating document collections on a vertical timeline. Text-only. Designed for the ~3M Epstein court documents; starts with 1000 sample entries.

## Layout

- **Left**: Vertical timeline, chronological. Warning badges for explicit content or unredacted victim info.
- **Right**: Document viewer with full text.

## Run

```bash
npm install
npm run generate-data   # creates public/data/documents.json (1000 samples)
npm run dev
```

Open http://localhost:5173

## Data

Sample data is placeholder. To use real documents, see **DATA_IMPORT.md** for:

- Schema and field descriptions
- Where to look (Reddit r/Epstein, PACER, FOIA, etc.)
- Conversion scripts for PDF/CSV
- Scaling tips for millions of documents

## Build

```bash
npm run build
npm run preview   # serve dist
```
