import './DocumentViewer.css';

const WARNING_LABELS = {
  explicit: 'Explicit content',
  unredacted_victim: 'Unredacted victim info',
  damning: 'Damning info / testimony'
};

export function DocumentViewer({ document }) {
  if (!document) {
    return (
      <main className="document-viewer document-viewer-empty">
        <p>Select a document from the timeline</p>
      </main>
    );
  }

  return (
    <main className="document-viewer">
      <header className="document-header">
        <div className="document-meta">
          <span className="document-date">{document.date}</span>
          <span className="document-source">{document.source}</span>
        </div>
        <h1 className="document-title">{document.title}</h1>
        {document.warnings?.length > 0 && (
          <div className="document-warnings">
            {document.warnings.map((w) => (
              <span key={w} className={`document-warning document-warning-${w}`}>
                {WARNING_LABELS[w]}
              </span>
            ))}
          </div>
        )}
      </header>
      <article className="document-content">
        <pre>{document.content}</pre>
      </article>
    </main>
  );
}
