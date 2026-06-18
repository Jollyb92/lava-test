import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useScrollRestore } from './useScrollRestore.js';
import { detailPages, COLORS } from './data.js';
import OnboardingChecklist from './OnboardingChecklist.jsx';
import SlidePanel from './SlidePanel.jsx';
import { SearchButton } from './GlobalSearch.jsx';

const CHECKLIST_TRIGGER = 'Digital Onboarding Checklist';

const MANUAL_IDS = new Set([
  'cultural', 'design', 'bidding', 'communication',
  'qems', 'ppm', 'worksafety', 'guides', 'live', 'project',
]);

const FRONT_MATTER_IDS = new Set(['doc-control', 'intro']);

const CHAPTER_IDS = new Set([
  'toc', 'doc-control', 'intro', 'ecosystem',
  'a1', 'a2',
  'b1', 'b2', 'b3', 'b4', 'b5', 'b6',
  'c1', 'c2', 'c3',
  'd1', 'd2', 'd3',
  'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8',
  'f1', 'g1',
]);

function linkCategory(id) {
  if (MANUAL_IDS.has(id)) return 'manuals';
  if (CHAPTER_IDS.has(id)) return 'chapters';
  return 'others';
}

function LinkedNav({ links, navigate }) {
  const manuals  = links.filter(l => linkCategory(l.id) === 'manuals');
  const chapters = links.filter(l => linkCategory(l.id) === 'chapters');
  const others   = links.filter(l => linkCategory(l.id) === 'others');

  const groups = [
    { key: 'manuals',  label: 'Manuals',  items: manuals },
    { key: 'chapters', label: 'Chapters', items: chapters },
    { key: 'others',   label: 'Others',   items: others },
  ].filter(g => g.items.length > 0);

  if (groups.length === 0) return null;

  return (
    <div className="linked-nav">
      <span className="linked-nav-label">See also</span>
      {groups.map(group => (
        <div key={group.key} className="linked-nav-group">
          <span className="linked-nav-group-label">{group.label}</span>
          <div className="linked-nav-chips">
            {group.items.map(link => (
              <button
                key={link.id}
                className="linked-nav-chip"
                onClick={() => navigate(`/detail/${link.id}`)}
              >
                {link.label}
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M2 7L7 2M7 2H3.5M7 2V5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

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

function SubchapterLabel({ text }) {
  const sep = text.indexOf(' — ');
  if (sep === -1) return <span className="subch-title">{text}</span>;
  return (
    <>
      <span className="subch-title">{text.slice(0, sep)}</span>
      <span className="subch-sub"> — {text.slice(sep + 3)}</span>
    </>
  );
}

function ChaptersView({ chapters, accentColor, onLinksChange }) {
  const [openIndex, setOpenIndex] = useState(null);

  function toggle(i, ch) {
    const next = openIndex === i ? null : i;
    setOpenIndex(next);
    onLinksChange(next !== null && ch.links?.length ? ch.links : null);
  }

  return (
    <ul className="chapters-list">
      {chapters.map((ch, i) => {
        const isOpen = openIndex === i;
        return (
          <li key={i} className={`chapter-bubble${isOpen ? ' chapter-bubble--open' : ''}`}
            style={isOpen ? { borderColor: accentColor } : {}}>
            <button
              className="chapter-bubble-btn"
              onClick={() => toggle(i, ch)}
              style={isOpen ? { background: accentColor, color: accentColor === '#B3F400' ? '#1a1a1a' : '#fff' } : {}}
            >
              <span className="chapter-bubble-num"
                style={isOpen ? { background: 'rgba(0,0,0,0.18)', color: 'inherit' } : { background: accentColor, color: accentColor === '#B3F400' ? '#1a1a1a' : '#fff' }}>
                {i + 1}
              </span>
              <span className="chapter-bubble-title">{ch.title}</span>
              <svg className="chapter-bubble-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d={isOpen ? 'M2 8L6 4L10 8' : 'M2 4L6 8L10 4'}
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            {isOpen && (
              <ul className="subchapter-pills">
                {ch.subchapters.map((sub, j) => (
                  <li key={j} className="subch-pill">
                    <SubchapterLabel text={sub} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function renderSlideBlocksHtml(blocks, accentColor) {
  return (blocks || []).map(block => {
    if (block.t === 'h')
      return `<div class="ph">${block.text}</div>`;
    if (block.t === 'para')
      return `<p class="pp">${block.text}</p>`;
    if (block.t === 'note')
      return `<div class="pn">${block.text}</div>`;
    if (block.t === 'bullets')
      return `<ul class="pbl">${block.items.map(it => `<li>${it}</li>`).join('')}</ul>`;
    if (block.t === 'kv')
      return `<dl class="pkv">${block.items.map(it => `<dt>${it.k}</dt><dd>${it.v}</dd>`).join('')}</dl>`;
    return '';
  }).join('');
}

function buildSectionPrintHtml(page) {
  const accent = page.color || '#1a1a1a';
  const topics = page.topics || [];
  const slides = page.slideData || [];

  const topicHtml = topics.map((topic, i) => {
    const slide = slides[i];
    let content = '';
    if (slide?.type === 'text') {
      content = renderSlideBlocksHtml(slide.blocks, accent);
    } else if (slide?.type === 'table') {
      const header = slide.columns.map(c => `<th>${c}</th>`).join('');
      const rows = slide.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
      content = `<table class="ptbl"><thead><tr>${header}</tr></thead><tbody>${rows}</tbody></table>`;
    } else if (slide) {
      content = `<p class="pp" style="color:#9CA3AF;font-style:italic;">[Interactive content — view in app]</p>`;
    }
    return `
      <div class="ptopic">
        <div class="ptopic-num" style="background:${accent}">${i + 1}</div>
        <div class="ptopic-body">
          <div class="ptopic-title">${topic}</div>
          ${content}
        </div>
      </div>`;
  }).join('');

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>${page.title} — LAVA Berlin 2026</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #111; padding: 28px 40px; }
  .phdr { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 3px solid ${accent}; margin-bottom: 8px; }
  .phdr-left { display: flex; flex-direction: column; gap: 4px; }
  .phdr-title { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
  .phdr-bc { font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: .04em; }
  .phdr-iso { font-size: 9px; color: #888; font-style: italic; }
  .phdr-meta { text-align: right; font-size: 9px; color: #888; }
  .ptopic { display: flex; gap: 14px; margin-top: 18px; page-break-inside: avoid; }
  .ptopic-num { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #fff; flex-shrink: 0; margin-top: 2px; }
  .ptopic-body { flex: 1; border-bottom: 1px solid #E5E7EB; padding-bottom: 14px; }
  .ptopic-title { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
  .pp { font-size: 11px; color: #374151; line-height: 1.6; margin-bottom: 7px; }
  .ph { font-size: 12px; font-weight: 700; color: ${accent}; margin-bottom: 6px; }
  .pn { background: ${accent}18; border-left: 3px solid ${accent}; padding: 8px 12px; font-size: 10.5px; color: #374151; font-style: italic; margin-bottom: 7px; }
  .pbl { list-style: none; margin-bottom: 7px; display: flex; flex-direction: column; gap: 4px; }
  .pbl li::before { content: '·'; color: ${accent}; font-weight: 800; margin-right: 6px; }
  .pbl li { font-size: 11px; color: #374151; display: flex; }
  .pkv dt { font-size: 9.5px; font-weight: 700; text-transform: uppercase; color: ${accent}; }
  .pkv dd { font-size: 11px; color: #374151; margin-bottom: 5px; }
  .ptbl { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 7px; }
  .ptbl th { background: ${accent}; color: #fff; padding: 6px 10px; text-align: left; font-weight: 700; }
  .ptbl td { padding: 5px 10px; border-bottom: 1px solid #E5E7EB; }
  .ptbl tr:nth-child(even) td { background: #F9FAFB; }
  .pfooter { margin-top: 28px; padding-top: 10px; border-top: 1px solid #E5E7EB; font-size: 9px; color: #9CA3AF; display: flex; justify-content: space-between; }
  @page { margin: 14mm; }
</style></head><body>
<div class="phdr">
  <div class="phdr-left">
    <div class="phdr-bc">LAVA Office Manual Berlin 2026 › ${page.breadcrumb || page.title}</div>
    <div class="phdr-title">${page.title}</div>
    ${page.isoTag ? `<div class="phdr-iso">${page.isoTag}</div>` : ''}
  </div>
  <div class="phdr-meta">LAVA Berlin 2026<br/>Office Manual v4 — Draft<br/>Printed: ${new Date().toLocaleDateString('en-GB')}</div>
</div>
${topicHtml}
<div class="pfooter">
  <span>LAVA Berlin 2026 — Office Manual v4 — Draft</span>
  <span>${page.title}</span>
</div>
</body></html>`;
}

export default function DetailPage({ onSearchOpen }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [chapterLinks, setChapterLinks] = useState(null);
  const scrollRef = useScrollRestore();

  // Reset per-item link overrides when navigating to a different page
  // Also auto-open slide from ?slide= param (from global search)
  useEffect(() => {
    setChapterLinks(null);
    setChecklistOpen(false);
    const slide = searchParams.get('slide');
    setSelectedSlide(slide !== null ? parseInt(slide, 10) : null);
  }, [id, searchParams]);

  const page = detailPages[id];

  function handlePrintSection() {
    const html = buildSectionPrintHtml(page);
    const w = window.open('', '_blank', 'width=900,height=700');
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  }

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

  // Active links: per-topic > per-chapter > page-level
  const topicSpecific = selectedSlide !== null ? (page.topicLinks?.[selectedSlide] ?? null) : null;
  const activeLinks = (topicSpecific?.length ? topicSpecific : null) || chapterLinks || page.links || null;

  const bodyClass = [
    'detail-body',
    checklistOpen ? 'detail-body--panel' : '',
    slideOpen     ? 'detail-body--slide' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="detail-page fade-in">
      {/* Top bar */}
      <div className="detail-top-bar">
        <button className="back-btn" onClick={() => FRONT_MATTER_IDS.has(id) ? navigate('/toc') : navigate(-1)}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <span className="top-bar-logo">LAVA Office Manual Berlin 2026</span>
        <SearchButton onClick={onSearchOpen} />
        {page.topics && (
          <button className="print-section-btn" onClick={handlePrintSection} title="Print section as PDF">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <rect x="2" y="1" width="9" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="2" y="7.5" width="9" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M2 5.5H11V8.5H2V5.5Z" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="9" cy="7" r="0.6" fill="currentColor"/>
            </svg>
            Print PDF
          </button>
        )}
        {page.isoTag && <div className="iso-tag">{page.isoTag}</div>}
      </div>

      {/* Body */}
      <div className={bodyClass}>
        <div className="accent-bar" style={{ background: accentColor }} />

        <div className="detail-content" ref={scrollRef}>
          <div className="breadcrumb">
            LAVA Office Manual Berlin 2026 &rsaquo; <span>{page.breadcrumb}</span>
          </div>

          <div className="detail-title">{page.title}</div>
          {page.subtitle && <div className="detail-subtitle">{page.subtitle}</div>}

          {page.chapters ? (
            <ChaptersView chapters={page.chapters} accentColor={accentColor} onLinksChange={setChapterLinks} />
          ) : (
            <ul className="topics-list">
              {page.topics.map((topic, i) => (
                <li key={i} className={`topic-card${selectedSlide === i ? ' topic-card--active' : ''}`}
                  style={selectedSlide === i ? { borderLeftColor: accentColor } : {}}>
                  <div
                    className="topic-num"
                    style={{
                      background: page.topicColors?.[i] ?? numColor,
                      color: (page.topicColors?.[i] ?? numColor) === '#B3F400' ? '#1a1a1a' : '#fff',
                    }}
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
                        setChapterLinks(null);
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
          )}

          {activeLinks && activeLinks.length > 0 && (
            <LinkedNav links={activeLinks} navigate={navigate} />
          )}
        </div>

        {/* Checklist panel (B.1) */}
        {checklistOpen && (
          <OnboardingChecklist onClose={() => setChecklistOpen(false)} />
        )}

        {/* Generic slide panel for any topic (not used for chapter-based pages) */}
        {slideOpen && page.topics && (
          <SlidePanel
            topic={page.topics[selectedSlide]}
            topicIndex={selectedSlide}
            totalTopics={page.topics.length}
            pageTitle={page.title}
            pageId={id}
            accentColor={accentColor}
            slideData={page.slideData?.[selectedSlide] ?? null}
            onSelect={setSelectedSlide}
            onClose={() => setSelectedSlide(null)}
          />
        )}
      </div>

      <div className="page-footer">LAVA Berlin 2026 — Office Manual v4 — Draft</div>
    </div>
  );
}
