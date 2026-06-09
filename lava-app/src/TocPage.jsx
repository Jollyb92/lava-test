import { useNavigate } from 'react-router-dom';
import { tocData, detailPages, COLORS } from './data.js';

const partColors = [
  COLORS.cultural,
  COLORS.guides,
  COLORS.live,
  COLORS.safety,
  COLORS.project,
  COLORS.ppm,
  COLORS.qems,
  COLORS.dark,
];

export default function TocPage() {
  const navigate = useNavigate();

  return (
    <div className="detail-page fade-in">
      <div className="detail-top-bar">
        <button className="back-btn" onClick={() => navigate('/')}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Diagram
        </button>
        <span className="top-bar-logo">LAVA Office Manual Berlin 2026</span>
      </div>

      <div className="detail-body">
        <div className="accent-bar" style={{ background: COLORS.center }} />
        <div className="toc-content">
          <div className="breadcrumb">LAVA Office Manual Berlin 2026 &rsaquo; <span>Table of Contents</span></div>
          <div className="toc-title">Table of Contents</div>
          <div className="toc-meta">Office Manual Berlin 2026 — v3.2 · Draft · Annual review</div>

          {tocData.parts.map((part, pi) => (
            <div className="toc-part" key={pi}>
              <div className="toc-part-label">{part.label}</div>
              {part.sections.length === 0 && (
                <div style={{ fontSize: 13, color: '#bbb', paddingLeft: 10, paddingBottom: 4 }}>
                  — Coming soon —
                </div>
              )}
              {part.sections.map((sec, si) => {
                const page = detailPages[sec.id];
                const dotColor = page?.color || partColors[pi] || '#ccc';
                return (
                  <div
                    className="toc-row"
                    key={si}
                    onClick={() => navigate(`/detail/${sec.id}`)}
                  >
                    <div className="toc-dot" style={{ background: dotColor }} />
                    <span>{sec.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="page-footer">LAVA Berlin 2026 — Office Manual v4 — Draft</div>
    </div>
  );
}
