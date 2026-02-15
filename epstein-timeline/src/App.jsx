import { useState, useEffect, useMemo } from 'react';
import { Timeline } from './Timeline';
import { DocumentViewer } from './DocumentViewer';
import './App.css';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [yearFilter, setYearFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const filteredDocs = useMemo(() => {
    if (!yearFilter) return documents;
    return documents.filter((d) => d.date.startsWith(yearFilter));
  }, [documents, yearFilter]);

  useEffect(() => {
    fetch('/data/documents.json')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load documents');
        return r.json();
      })
      .then((data) => {
        setDocuments(data);
        if (data.length > 0) {
          setSelected((s) => s || data[0]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (filteredDocs.length > 0 && selected && !filteredDocs.some((d) => d.id === selected.id)) {
      setSelected(filteredDocs[0]);
    }
  }, [yearFilter, filteredDocs, selected]);

  if (error) {
    return (
      <div className="app-error">
        <h1>Could not load documents</h1>
        <p>{error}</p>
        <p>Run <code>node scripts/generate-sample-data.js</code> to create sample data.</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Timeline
        documents={filteredDocs}
        allDocuments={documents}
        selectedId={selected?.id}
        onSelect={setSelected}
        yearFilter={yearFilter}
        onYearFilterChange={setYearFilter}
        isLoading={isLoading}
      />
      <DocumentViewer document={selected} />
    </div>
  );
}
