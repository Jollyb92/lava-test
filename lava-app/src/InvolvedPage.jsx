import { useNavigate } from 'react-router-dom';
import { involvedPartiesData, COLORS } from './data.js';

export default function InvolvedPage() {
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
        <div className="iso-tag">ISO 9001 §5 — Leadership</div>
      </div>

      <div className="detail-body">
        <div className="accent-bar" style={{ background: COLORS.center }} />
        <div className="special-content">
          <div className="breadcrumb">LAVA Office Manual Berlin 2026 &rsaquo; <span>Involved Parties</span></div>
          <div className="special-title">Involved Parties</div>
          <div className="special-meta">Who owns, drafts, and reviews each document in the manual family.</div>

          <div className="involved-grid">
            <div className="involved-row" style={{ background: '#f5f5f5', fontWeight: 700, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888' }}>
              <div>Document</div>
              <div>Ownership &amp; Review</div>
            </div>
            {involvedPartiesData.map(({ manual, role }) => (
              <div className="involved-row" key={manual}>
                <div className="involved-manual">{manual}</div>
                <div className="involved-role">{role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="page-footer">LAVA Berlin 2026 — Office Manual v4 — Draft</div>
    </div>
  );
}
