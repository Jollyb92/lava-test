import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tocData, COLORS } from './data.js';
import { SearchButton } from './GlobalSearch.jsx';
import { SubchapterLabel } from './DetailPage.jsx';
import { useScrollRestore } from './useScrollRestore.js';

// Same chapter bubbles as the manual pages, in the Operating LAVA bubble colour
const accentColor = COLORS.center;
const accentText  = COLORS.dark;

// "Part A — Who We Are" → num "A", title "Who We Are"
function chapterOf(part) {
  const m = part.label.match(/^Part ([A-G]) — (.+)$/);
  if (m) return { num: m[1], title: m[2], anchor: `part-${m[1].toLowerCase()}` };
  return { num: part.label === 'Front Matter' ? '0' : 'S', title: part.label };
}

const chapters = tocData.parts.map(chapterOf);

// /toc#part-b (from the map's Part bubbles) opens that part
function indexForHash(hash) {
  const i = chapters.findIndex(ch => ch.anchor === hash.slice(1));
  return i === -1 ? null : i;
}

function targetOf(id) {
  if (id === 'toc') return '/toc';
  if (id === 'glossary') return '/glossary';
  if (id === 'involved') return '/involved';
  return `/detail/${id}`;
}

export default function TocPage({ onSearchOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useScrollRestore();
  const [openIndex, setOpenIndex] = useState(() => indexForHash(location.hash));
  const [prevHash, setPrevHash] = useState(location.hash);
  if (location.hash !== prevHash) {
    setPrevHash(location.hash);
    setOpenIndex(indexForHash(location.hash));
  }

  useEffect(() => {
    if (openIndex === null) return;
    const el = scrollRef.current?.querySelector(`[data-chapter-index="${openIndex}"]`);
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [openIndex, scrollRef]);

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
        <div className="accent-bar" style={{ background: accentColor }} />
        <div className="detail-content" ref={scrollRef}>
          <div className="breadcrumb">Operating LAVA &rsaquo; <span>Table of Contents</span></div>
          <div className="detail-title">Table of Contents</div>
          <div className="detail-subtitle">Operating LAVA 1.01</div>

          <ul className="chapters-list">
            {tocData.parts.map((part, i) => {
              const ch = chapters[i];
              const isOpen = openIndex === i;
              return (
                <li key={i} id={ch.anchor} data-chapter-index={i}
                  className={`chapter-bubble${isOpen ? ' chapter-bubble--open' : ''}`}
                  style={isOpen ? { borderColor: accentColor } : {}}>
                  <button
                    className="chapter-bubble-btn"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    style={isOpen ? { background: accentColor, color: accentText } : {}}
                  >
                    <span className="chapter-bubble-num"
                      style={isOpen ? { background: 'rgba(0,0,0,0.18)', color: 'inherit' } : { background: accentColor, color: accentText }}>
                      {ch.num}
                    </span>
                    <span className="chapter-bubble-title">{ch.title}</span>
                    <svg className="chapter-bubble-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d={isOpen ? 'M2 8L6 4L10 8' : 'M2 4L6 8L10 4'}
                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {isOpen && (
                    <ul className="subchapter-pills">
                      {part.sections.length === 0 && (
                        <li className="subch-pill">— Coming soon —</li>
                      )}
                      {part.sections.map((sec, j) => (
                        <li key={j} className="subch-pill subch-pill--btn">
                          <button className="subch-pill-btn" onClick={() => navigate(targetOf(sec.id))}>
                            <SubchapterLabel text={sec.label} />
                            <span className="subch-pill-view">
                              Open
                              <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                <path d="M3 2L6 4.5L3 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="page-footer">Operating LAVA 1.01</div>
    </div>
  );
}
