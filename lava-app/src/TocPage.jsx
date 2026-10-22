import { Fragment, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tocData, detailPages, glossaryData, involvedPartiesData, COLORS } from './data.js';
import { SearchButton } from './GlobalSearch.jsx';
import { SubchapterLabel, ServerLinks, CHECKLIST_TRIGGER } from './DetailPage.jsx';
import SlidePanel from './SlidePanel.jsx';
import OnboardingChecklist from './OnboardingChecklist.jsx';
import { useScrollRestore } from './useScrollRestore.js';

// Same chapter bubbles as the manual pages, in the Operating LAVA bubble colour
const accentColor = COLORS.center;
const accentText  = COLORS.dark;

// "Part A — Who We Are" → num "A", title "Who We Are"
function chapterOf(part) {
  const m = part.label.match(/^Part ([A-G]) — (.+)$/);
  if (m) return { num: m[1], title: m[2], anchor: `part-${m[1].toLowerCase()}` };
  return { num: '0', title: part.label };
}

const chapters = tocData.parts.map(chapterOf);

// /toc#part-b (from the map's Part bubbles) opens that part;
// /toc?sec=b3&topic=1 (from search) also opens that section's topic
function stateForLocation({ hash, search }) {
  const params = new URLSearchParams(search);
  const secId = params.get('sec');
  for (const [part, p] of tocData.parts.entries()) {
    const sec = p.sections.findIndex(s => s.id === secId);
    if (sec !== -1) return { open: part, selected: { part, sec, topic: Number(params.get('topic')) || 0 } };
  }
  const i = chapters.findIndex(ch => ch.anchor === hash.slice(1));
  return { open: i === -1 ? null : i, selected: null };
}

// Glossary and Involved Parties as one-topic text pages for the side panel
const GLOSSARY_GROUPS = [
  { label: 'Manual Family',      key: 'manualFamily' },
  { label: 'Management Systems', key: 'managementSystems' },
  { label: 'Software & IT',      key: 'softwareIT' },
  { label: 'Locations',          key: 'locations' },
  { label: 'German Terms',       key: 'germanTerms' },
];

const SIDE_PAGES = {
  glossary: {
    topics: ['Glossary — Abbreviations, terms and German words used in the manual family'],
    slideData: [{ type: 'text', blocks: GLOSSARY_GROUPS.flatMap(({ label, key }) => [
      { t: 'h', text: label },
      { t: 'kv', items: glossaryData[key].map(({ term, def }) => ({ k: term, v: def })) },
    ]) }],
  },
  involved: {
    topics: ['Involved Parties — Who owns, drafts and reviews each document'],
    slideData: [{ type: 'text', blocks: [
      { t: 'kv', items: involvedPartiesData.map(({ manual, colorKey, role }) => ({ k: manual, v: role, color: COLORS[colorKey] })) },
    ] }],
  },
};

// Sections with topics open beside the contents; the full manuals
// (chapter pages) keep their own page.
function inlinePage(id) {
  if (SIDE_PAGES[id]) return SIDE_PAGES[id];
  const page = detailPages[id];
  return page?.topics?.length ? page : null;
}

function targetOf(id) {
  return `/detail/${id}`;
}

export default function TocPage({ onSearchOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const scrollRef = useScrollRestore();
  const [initial] = useState(() => stateForLocation(location));
  const [openIndex, setOpenIndex] = useState(initial.open);
  // { part, sec, topic } of the section shown on the right
  const [selected, setSelected] = useState(initial.selected);
  const locKey = location.search + location.hash;
  const [prevLocKey, setPrevLocKey] = useState(locKey);
  if (locKey !== prevLocKey) {
    const next = stateForLocation(location);
    setPrevLocKey(locKey);
    setOpenIndex(next.open);
    setSelected(next.selected);
  }

  const selSec  = selected && tocData.parts[selected.part].sections[selected.sec];
  const selPage = selSec && inlinePage(selSec.id);
  const selTopic = selPage?.topics[selected.topic];

  function openSection(pi, si) {
    const sec = tocData.parts[pi].sections[si];
    if (!inlinePage(sec.id)) { navigate(targetOf(sec.id)); return; }
    setSelected(prev => prev?.part === pi && prev?.sec === si ? null : { part: pi, sec: si, topic: 0 });
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

      <div className={`detail-body${selPage ? ' detail-body--slide' : ''}`}>
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
                      {part.sections.map((sec, j) => {
                        const inline = !!inlinePage(sec.id);
                        const isActive = selected?.part === i && selected?.sec === j;
                        const topics = isActive && selPage.topics.length > 1 ? selPage.topics : null;
                        return (
                          <Fragment key={j}>
                          <li className={`subch-pill subch-pill--btn${isActive ? ' subch-pill--active' : ''}`}>
                            <button
                              className="subch-pill-btn"
                              style={isActive ? { borderColor: accentColor, background: `${accentColor}30` } : {}}
                              onClick={() => openSection(i, j)}
                            >
                              <SubchapterLabel text={sec.label} />
                              <span className="subch-pill-view">
                                {!inline ? 'Open' : isActive ? 'Close' : 'View'}
                                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                  <path d={!inline ? 'M3 2L6 4.5L3 7' : isActive ? 'M2 6L5 3L8 6' : 'M2 4L5 7L8 4'}
                                    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </span>
                            </button>
                          </li>
                          {topics && (
                            <li className="toc-topics" style={{ borderLeftColor: accentColor }}>
                              {topics.map((topic, k) => (
                                <button key={k}
                                  className={`toc-topic${selected.topic === k ? ' toc-topic--active' : ''}`}
                                  style={selected.topic === k ? { background: `${accentColor}30` } : {}}
                                  onClick={() => setSelected({ ...selected, topic: k })}
                                >
                                  <span className="toc-topic-num">{k + 1}</span>
                                  <SubchapterLabel text={topic} />
                                </button>
                              ))}
                            </li>
                          )}
                          </Fragment>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>

          {selPage && <ServerLinks links={selPage.topicServerLinks?.[selected.topic]} />}
        </div>

        {selTopic === CHECKLIST_TRIGGER ? (
          <OnboardingChecklist onClose={() => setSelected(null)} />
        ) : selPage && (
          <SlidePanel
            key={selSec.id}
            topic={selTopic}
            topicIndex={selected.topic}
            totalTopics={selPage.topics.length}
            pageTitle={selSec.label}
            pageId={selSec.id}
            accentColor={accentColor}
            slideData={selPage.slideData?.[selected.topic] ?? null}
            onSelect={topic => setSelected({ ...selected, topic })}
            onClose={() => setSelected(null)}
          />
        )}
      </div>

      <div className="page-footer">Operating LAVA 1.01</div>
    </div>
  );
}
