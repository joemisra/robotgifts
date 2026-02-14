import { useRef, useEffect, useMemo } from 'react';
import './Timeline.css';

const WARNING_LABELS = {
  explicit: 'Explicit content',
  unredacted_victim: 'Unredacted victim info'
};

export function Timeline({ documents, allDocuments, selectedId, onSelect, yearFilter, onYearFilterChange, isLoading }) {
  const listRef = useRef();
  const selectedRef = useRef();

  const years = useMemo(() => {
    const set = new Set();
    (allDocuments || documents).forEach((d) => {
      const y = d.date?.slice(0, 4);
      if (y) set.add(y);
    });
    return [...set].sort();
  }, [allDocuments, documents]);

  useEffect(() => {
    if (selectedId && selectedRef.current && listRef.current) {
      selectedRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedId]);

  if (isLoading) {
    return (
      <aside className="timeline">
        <div className="timeline-loading">Loading documents…</div>
      </aside>
    );
  }

  return (
    <aside className="timeline">
      <header className="timeline-header">
        <h2>Timeline</h2>
        <span className="timeline-count">{documents.length.toLocaleString()}{allDocuments ? ` of ${allDocuments.length.toLocaleString()}` : ''} documents</span>
        {years.length > 0 && (
          <select
            className="timeline-year-filter"
            value={yearFilter || ''}
            onChange={(e) => onYearFilterChange?.(e.target.value)}
          >
            <option value="">All years</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}
      </header>
      <div ref={listRef} className="timeline-list">
        {filteredDocs.map((doc) => (
          <button
            key={doc.id}
            ref={doc.id === selectedId ? selectedRef : null}
            className={`timeline-item ${doc.id === selectedId ? 'selected' : ''}`}
            onClick={() => onSelect(doc)}
          >
            <span className="timeline-item-date">{doc.date}</span>
            <span className="timeline-item-title">{doc.title}</span>
            <span className="timeline-item-source">{doc.source}</span>
            {doc.warnings?.length > 0 && (
              <span className="timeline-item-warnings">
                {doc.warnings.map((w) => (
                  <span key={w} className={`timeline-warning timeline-warning-${w}`} title={WARNING_LABELS[w]}>
                    {w === 'explicit' ? '⚠' : '🔒'}
                  </span>
                ))}
              </span>
            )}
          </button>
        ))}
      </div>
    </aside>
  );
}
