import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tocData, detailPages, COLORS } from './data.js';
import { SearchButton } from './GlobalSearch.jsx';
import { useScrollRestore } from './useScrollRestore.js';

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

export default function TocPage({ onSearchOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useScrollRestore();

  useEffect(() => {
    const hash = location.hash.slice(1);
    if (!hash || !scrollRef.current) return;
    const target = scrollRef.current.querySelector(`#${hash}`);
    if (target) target.scrollIntoView({ block: 'start' });
  }, [location.hash]);

  return (
    <div className="detail-page fade-in">
      <div className="detail-top-bar">
        <button className="back-btn" onClick={() => navigate('/')}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to the Map
        </button>
        <span className="top-bar-logo">Operating LAVA</span>
        <SearchButton onClick={onSearchOpen} />
      </div>

      <div className="detail-body">
        <div className="accent-bar" style={{ background: COLORS.center }} />
        <div className="toc-content" ref={scrollRef}>
          <div className="breadcrumb">Operating LAVA &rsaquo; <span>Table of Contents</span></div>
          <div className="toc-title">Table of Contents</div>
          <div className="toc-meta">Operating LAVA 1.01</div>

          {tocData.parts.map((part, pi) => {
            const partLetter = part.label.match(/^Part ([A-G])/)?.[1]?.toLowerCase();
            return (
            <div className="toc-part" key={pi} id={partLetter ? `part-${partLetter}` : undefined}>
              <div className="toc-part-label">{part.label}</div>
              {part.sections.length === 0 && (
                <div style={{ fontSize: 13, color: '#bbb', paddingLeft: 10, paddingBottom: 4 }}>
                  — Coming soon —
                </div>
              )}
              {part.sections.map((sec, si) => {
                const page = detailPages[sec.id];
                const dotColor = page?.color || partColors[pi] || '#ccc';
                const target = sec.id === 'toc' ? '/toc'
                  : sec.id === 'glossary' ? '/glossary'
                  : sec.id === 'involved' ? '/involved'
                  : `/detail/${sec.id}`;
                return (
                  <div
                    className="toc-row"
                    key={si}
                    onClick={() => navigate(target)}
                  >
                    <div className="toc-dot" style={{ background: dotColor }} />
                    <span>{sec.label}</span>
                  </div>
                );
              })}
            </div>
            );
          })}
        </div>
      </div>

      <div className="page-footer">Operating LAVA 1.01</div>
    </div>
  );
}
