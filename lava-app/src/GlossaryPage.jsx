import { useNavigate } from 'react-router-dom';
import { glossaryData, COLORS } from './data.js';

const GROUPS = [
  { label: 'Manual Family',      key: 'manualFamily' },
  { label: 'Management Systems', key: 'managementSystems' },
  { label: 'Software & IT',      key: 'softwareIT' },
  { label: 'Locations',          key: 'locations' },
  { label: 'German Terms',       key: 'germanTerms' },
];

export default function GlossaryPage() {
  const navigate = useNavigate();

  return (
    <div className="detail-page fade-in">
      <div className="detail-top-bar">
        <button className="back-btn" onClick={() => navigate('/')}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to the Map
        </button>
        <span className="top-bar-logo">LAVA Office Manual Berlin 2026</span>
        <div className="iso-tag">ISO 9001 §7.5 — Documented Information</div>
      </div>

      <div className="detail-body">
        <div className="accent-bar" style={{ background: COLORS.center }} />
        <div className="special-content">
          <div className="breadcrumb">LAVA Office Manual Berlin 2026 &rsaquo; <span>Glossary</span></div>
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

      <div className="page-footer">LAVA Berlin 2026 — Office Manual v4 — Draft</div>
    </div>
  );
}
