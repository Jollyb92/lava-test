import { useNavigate } from 'react-router-dom';
import { glossaryData, COLORS } from './data.js';
import { SearchButton } from './GlobalSearch.jsx';
import { useScrollRestore } from './useScrollRestore.js';

const GROUPS = [
  { label: 'Manual Family',      key: 'manualFamily' },
  { label: 'Management Systems', key: 'managementSystems' },
  { label: 'Software & IT',      key: 'softwareIT' },
  { label: 'Locations',          key: 'locations' },
  { label: 'German Terms',       key: 'germanTerms' },
];

export default function GlossaryPage({ onSearchOpen }) {
  const navigate = useNavigate();
  const scrollRef = useScrollRestore();

  return (
    <div className="detail-page fade-in">
      <div className="detail-top-bar">
        <button className="back-btn" onClick={() => navigate('/toc')}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <span className="top-bar-logo">LAVA Office Manual 2026</span>
        <SearchButton onClick={onSearchOpen} />
        <div className="iso-tag">ISO 9001 §7.5 — Documented Information</div>
      </div>

      <div className="detail-body">
        <div className="accent-bar" style={{ background: COLORS.center }} />
        <div className="special-content" ref={scrollRef}>
          <div className="breadcrumb">LAVA Office Manual 2026 &rsaquo; <span>Glossary</span></div>
          <div className="special-title">Glossary</div>
          <div className="special-meta">Abbreviations, terms, and German words used in the manual family.</div>

          {GROUPS.map(({ label, key }) => (
            <div className="gloss-group" key={key}>
              <div className="gloss-group-label">{label}</div>
              {glossaryData[key].map(({ term, def }) => (
                <div className="gloss-row" key={term}>
                  <div className="gloss-term">{term}</div>
                  <div className="gloss-def">{def}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="page-footer">LAVA 2026 — Office Manual V1.01</div>
    </div>
  );
}
