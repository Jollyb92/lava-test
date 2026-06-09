import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { detailPages, COLORS } from './data.js';
import OnboardingChecklist from './OnboardingChecklist.jsx';
import SlidePanel from './SlidePanel.jsx';

const CHECKLIST_TRIGGER = 'Digital Onboarding Checklist — tracked by HR';

function TopicLabel({ text }) {
  const sep = text.indexOf(' — ');
  if (sep === -1) return <span className="topic-title">{text}</span>;
  return (
    <>
      <span className="topic-title">{text.slice(0, sep)}</span>
      <span className="topic-sub">{text.slice(sep + 3)}</span>
    </>
  );
}

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(null);

  const page = detailPages[id];

  if (!page) {
    return (
      <div className="detail-page fade-in">
        <div className="detail-top-bar">
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Back to the Map
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
  const numColor    = accentColor;
  const slideOpen   = selectedSlide !== null;
  const panelOpen   = checklistOpen || slideOpen;

  const bodyClass = [
    'detail-body',
    checklistOpen ? 'detail-body--panel' : '',
    slideOpen     ? 'detail-body--slide' : '',
  ].filter(Boolean).join(' ');

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
        {page.isoTag && <div className="iso-tag">{page.isoTag}</div>}
      </div>

      {/* Body */}
      <div className={bodyClass}>
        <div className="accent-bar" style={{ background: accentColor }} />

        <div className="detail-content">
          <div className="breadcrumb">
            LAVA Office Manual Berlin 2026 &rsaquo; <span>{page.breadcrumb}</span>
          </div>

          <div className="detail-title">{page.title}</div>
          {page.subtitle && <div className="detail-subtitle">{page.subtitle}</div>}

          <ul className="topics-list">
            {page.topics.map((topic, i) => (
              <li key={i} className={`topic-card${selectedSlide === i ? ' topic-card--active' : ''}`}
                style={selectedSlide === i ? { borderLeftColor: accentColor } : {}}>
                <div
                  className="topic-num"
                  style={{ background: numColor, color: page.textColor === '#1a1a1a' ? '#1a1a1a' : '#fff' }}
                >
                  {i + 1}
                </div>

                {topic === CHECKLIST_TRIGGER ? (
                  <button
                    className="topic-checklist-btn"
                    onClick={() => { setChecklistOpen(o => !o); setSelectedSlide(null); }}
                  >
                    <span className="topic-text"><TopicLabel text={topic} /></span>
                    <span className={`topic-checklist-badge${checklistOpen ? ' topic-checklist-badge--open' : ''}`}>
                      {checklistOpen ? 'Close' : 'Open checklist'}
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d={checklistOpen ? 'M2 6L5 3L8 6' : 'M2 4L5 7L8 4'}
                          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </button>
                ) : (
                  <button
                    className="topic-slide-btn"
                    onClick={() => {
                      setSelectedSlide(prev => prev === i ? null : i);
                      setChecklistOpen(false);
                    }}
                  >
                    <span className="topic-text"><TopicLabel text={topic} /></span>
                    <span
                      className="topic-slide-badge"
                      style={selectedSlide === i ? { background: accentColor, color: accentColor === '#B3F400' ? '#1a1a1a' : '#fff' } : {}}
                    >
                      {selectedSlide === i ? 'Close' : 'View'}
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d={selectedSlide === i ? 'M2 6L5 3L8 6' : 'M2 4L5 7L8 4'}
                          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </button>
                )}
              </li>
            ))}
          </ul>

          {page.linkedSources && <div className="linked-sources">{page.linkedSources}</div>}
        </div>

        {/* Checklist panel (B.1) */}
        {checklistOpen && (
          <OnboardingChecklist onClose={() => setChecklistOpen(false)} />
        )}

        {/* Generic slide panel for any topic */}
        {slideOpen && (
          <SlidePanel
            topic={page.topics[selectedSlide]}
            topicIndex={selectedSlide}
            totalTopics={page.topics.length}
            pageTitle={page.title}
            pageId={id}
            accentColor={accentColor}
            onSelect={setSelectedSlide}
            onClose={() => setSelectedSlide(null)}
          />
        )}
      </div>

      <div className="page-footer">LAVA Berlin 2026 — Office Manual v4 — Draft</div>
    </div>
  );
}
