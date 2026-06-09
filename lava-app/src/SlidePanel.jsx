function ChevronIcon({ dir }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d={dir === 'left' ? 'M9 2L4 7L9 12' : 'M5 2L10 7L5 12'}
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 3.5C1 2.67 1.67 2 2.5 2H5.5L7 3.5H11.5C12.33 3.5 13 4.17 13 5V10.5C13 11.33 12.33 12 11.5 12H2.5C1.67 12 1 11.33 1 10.5V3.5Z"
        stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  );
}

export default function SlidePanel({
  topic,
  topicIndex,
  totalTopics,
  pageTitle,
  pageId,
  accentColor,
  onSelect,
  onClose,
}) {
  const folderPath = `file:///L:/BER%20PROJECTS/Office%20Manual/${pageId.toUpperCase()}/`;
  const folderLabel = `L:\\BER PROJECTS\\Office Manual\\${pageId.toUpperCase()}\\`;

  function handleFolderClick(e) {
    e.preventDefault();
    const opened = window.open(folderPath, '_blank');
    if (!opened) {
      navigator.clipboard?.writeText(folderLabel).catch(() => {});
      alert(`Server path:\n${folderLabel}\n\n(Path copied to clipboard)`);
    }
  }

  return (
    <div className="sp-panel">
      {/* Top bar: nav + close */}
      <div className="sp-topbar">
        <button className="sp-navbtn" onClick={() => onSelect(Math.max(0, topicIndex - 1))}
          disabled={topicIndex === 0} title="Previous">
          <ChevronIcon dir="left" />
        </button>
        <span className="sp-nav-label">{topicIndex + 1} / {totalTopics}</span>
        <button className="sp-navbtn" onClick={() => onSelect(Math.min(totalTopics - 1, topicIndex + 1))}
          disabled={topicIndex === totalTopics - 1} title="Next">
          <ChevronIcon dir="right" />
        </button>
        <div className="sp-topbar-title">{topic}</div>
        <button className="sp-close" onClick={onClose} title="Close">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Slide body: fills all remaining height */}
      <div className="sp-body">

        {/* Slide header band */}
        <div className="sp-header" style={{ background: accentColor }}>
          <span className="sp-header-section">{pageTitle}</span>
          <span className="sp-header-sep">›</span>
          <span className="sp-header-topic">{topic}</span>
        </div>

        {/* Central placeholder area */}
        <div className="sp-placeholder">
          <div className="sp-placeholder-inner">
            <img
              src="/lava-logo.svg"
              alt="LAVA"
              className="sp-logo-img"
            />
            <div className="sp-placeholder-label">Placeholder — image or diagram</div>
            <div className="sp-placeholder-hint">
              Content for <em>{topic}</em> will be placed here
            </div>
          </div>
        </div>

        {/* Footer: branding + folder link */}
        <div className="sp-footer">
          <span className="sp-brand">
            <strong>LAVA</strong> Office Manual Berlin 2026
          </span>
          <a
            className="sp-folder-btn"
            href={folderPath}
            onClick={handleFolderClick}
            title={folderLabel}
          >
            <FolderIcon />
            Open folder
          </a>
        </div>
      </div>
    </div>
  );
}
