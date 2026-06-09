import { useNavigate, useParams } from 'react-router-dom';
import { detailPages, COLORS } from './data.js';

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const page = detailPages[id];

  if (!page) {
    return (
      <div className="detail-page fade-in">
        <div className="detail-top-bar">
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back to Diagram
          </button>
        </div>
        <div style={{ padding: '60px 56px', color: '#999' }}>
          Section not found: <strong>{id}</strong>
        </div>
        <div className="page-footer">LAVA Berlin 2026 — Office Manual v4 — Draft</div>
      </div>
    );
  }

  const accentColor = page.color || COLORS.center;
  const numColor = accentColor;

  return (
    <div className="detail-page fade-in">
      {/* Top bar */}
      <div className="detail-top-bar">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <span className="top-bar-logo">LAVA Office Manual Berlin 2026</span>
        {page.isoTag && (
          <div className="iso-tag">{page.isoTag}</div>
        )}
      </div>

      {/* Body */}
      <div className="detail-body">
        <div className="accent-bar" style={{ background: accentColor }} />
        <div className="detail-content">
          <div className="breadcrumb">
            LAVA Office Manual Berlin 2026 &rsaquo; <span>{page.breadcrumb}</span>
          </div>

          <div className="detail-title">{page.title}</div>
          {page.subtitle && (
            <div className="detail-subtitle">{page.subtitle}</div>
          )}

          <ul className="topics-list">
            {page.topics.map((topic, i) => (
              <li key={i} className="topic-card">
                <div
                  className="topic-num"
                  style={{ background: numColor, color: page.textColor === '#1a1a1a' ? '#1a1a1a' : '#fff' }}
                >
                  {i + 1}
                </div>
                <div className="topic-text">{topic}</div>
              </li>
            ))}
          </ul>

          {page.linkedSources && (
            <div className="linked-sources">{page.linkedSources}</div>
          )}
        </div>
      </div>

      <div className="page-footer">LAVA Berlin 2026 — Office Manual v4 — Draft</div>
    </div>
  );
}
