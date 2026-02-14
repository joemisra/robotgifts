/**
 * Generates sample timeline data for the Epstein files app.
 * Replace this data with real documents when you obtain them.
 * 
 * Data sources to explore:
 * - Reddit: r/Epstein, search for "dataset", "JSON", "parsed", "LLM"
 * - Court records: PACER, Florida Southern District
 * - FOIA releases
 * - Journalist compilations (some have structured data)
 * 
 * Schema: { id, date, title, summary, content, warnings[], source, people[] }
 * warnings: "explicit" | "unredacted_victim" | "damning" 
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DOC_TYPES = [
  'Email', 'Memo', 'Flight manifest', 'Calendar entry', 'Phone log',
  'Visitor list', 'Schedule', 'Financial record', 'Correspondence',
  'Meeting notes', 'Travel itinerary', 'Guest list'
];

const SOURCES = [
  'Court filing', 'Deposition', 'Grand jury', 'FBI document',
  'Civil suit exhibit', 'Flight log', 'Subpoena response'
];

function randomDate(startYear, endYear) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start));
}

function formatDate(d) {
  return d.toISOString().split('T')[0];
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDocument(i) {
  const docType = pick(DOC_TYPES);
  const date = randomDate(1992, 2019);
  const hasExplicit = Math.random() < 0.08;
  const hasUnredacted = Math.random() < 0.12;
  const hasDamning = Math.random() < 0.15;
  const warnings = [];
  if (hasExplicit) warnings.push('explicit');
  if (hasUnredacted) warnings.push('unredacted_victim');
  if (hasDamning) warnings.push('damning');

  const title = `${docType} — ${formatDate(date)}`;
  const summary = `${docType}. Dated ${formatDate(date)}. ${pick(SOURCES)}.`;
  const content = [
    `[Document ${String(i + 1).padStart(4, '0')}]`,
    `${docType}`,
    `Date: ${formatDate(date)}`,
    `Source: ${pick(SOURCES)}`,
    '',
    'Content excerpt:',
    'Lorem ipsum placeholder text. Replace with actual document content when you obtain the files.',
    'This is sample data for UI development. Real documents would contain the actual correspondence,',
    'flight manifests, schedules, and other records released through court proceedings.',
    '',
    '[End of sample document]'
  ].join('\n');

  return {
    id: `doc-${String(i + 1).padStart(4, '0')}`,
    date: formatDate(date),
    title,
    summary,
    content,
    warnings,
    source: pick(SOURCES),
    people: []
  };
}

function main() {
  const count = 1000;
  const docs = [];
  for (let i = 0; i < count; i++) {
    docs.push(generateDocument(i));
  }
  docs.sort((a, b) => a.date.localeCompare(b.date));

  const outPath = path.join(__dirname, '../public/data/documents.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(docs, null, 0), 'utf8');
  console.log(`Generated ${count} documents -> ${outPath}`);
}

main();
