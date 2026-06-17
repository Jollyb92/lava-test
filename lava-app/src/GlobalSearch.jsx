import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { detailPages, glossaryData, COLORS } from './data.js';

// ── Build search index once ───────────────────────────────────────────────────
function buildIndex() {
  const entries = [];

  for (const [id, page] of Object.entries(detailPages)) {
    const color  = page.color  || COLORS.center;
    const tColor = page.textColor === '#1a1a1a' ? '#1a1a1a' : '#fff';
    const base   = { id, pageTitle: page.title, breadcrumb: page.breadcrumb, color, tColor };

    // Page title itself
    entries.push({ ...base, text: page.title, type: 'page', nav: pageNav(id) });

    // Topics
    page.topics?.forEach((topic, i) => {
      const clean = topic.replace(/ — .*/, '');
      entries.push({ ...base, text: topic, type: 'topic', nav: pageNav(id, i), topicHint: clean });
    });

    // Chapter-based pages
    page.chapters?.forEach(ch => {
      entries.push({ ...base, text: ch.title, type: 'chapter', nav: pageNav(id) });
      ch.subchapters?.forEach(sub => {
        entries.push({ ...base, text: sub, type: 'subchapter', nav: pageNav(id) });
      });
    });
  }

  // Glossary
  const allTerms = Object.values(glossaryData).flat();
  allTerms.forEach(({ term, def }) => {
    entries.push({
      id: 'glossary', pageTitle: 'Glossary', breadcrumb: 'Front Matter > Glossary',
      color: COLORS.center, tColor: '#1a1a1a',
      text: `${term} — ${def}`, type: 'glossary', nav: '/glossary',
    });
  });

  return entries;
}

function pageNav(id, topicIndex) {
  if (id === 'toc')      return '/toc';
  if (id === 'glossary') return '/glossary';
  if (id === 'involved') return '/involved';
  const base = `/detail/${id}`;
  return topicIndex !== undefined ? `${base}?slide=${topicIndex}` : base;
}

const INDEX = buildIndex();

const TYPE_LABEL = { page: 'Page', topic: 'Topic', chapter: 'Chapter', subchapter: 'Sub-chapter', glossary: 'Glossary' };

// ── Component ─────────────────────────────────────────────────────────────────
export default function GlobalSearch({ open, onClose }) {
  const navigate = useNavigate();
  const [query,   setQuery]   = useState('');
  const [cursor,  setCursor]  = useState(0);
  const inputRef  = useRef(null);
  const listRef   = useRef(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return INDEX.filter(e =>
      e.text.toLowerCase().includes(q) ||
      e.pageTitle.toLowerCase().includes(q)
    ).slice(0, 40);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  // Reset cursor when results change
  useEffect(() => { setCursor(0); }, [results]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector('.gs-item--active');
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  function go(item) {
    onClose();
    navigate(item.nav);
  }

  function handleKey(e) {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    if (e.key === 'Enter' && results[cursor]) { go(results[cursor]); }
  }

  if (!open) return null;

  return (
    <div className="gs-backdrop" onClick={onClose}>
      <div className="gs-modal" onClick={e => e.stopPropagation()}>

        {/* Search input */}
        <div className="gs-inputrow">
          <svg className="gs-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="6.5" cy="6.5" r="5" stroke="#9CA3AF" strokeWidth="1.6"/>
            <path d="M10.5 10.5L14 14" stroke="#9CA3AF" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
          <input
            ref={inputRef}
            className="gs-input"
            type="text"
            placeholder="Search topics, chapters, glossary…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKey}
          />
          {query && (
            <button className="gs-clear" onClick={() => { setQuery(''); inputRef.current?.focus(); }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="#9CA3AF" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
          )}
          <kbd className="gs-esc" onClick={onClose}>Esc</kbd>
        </div>

        {/* Results */}
        {query.trim() === '' ? (
          <div className="gs-empty">
            <div className="gs-empty-icon">⌕</div>
            <div className="gs-empty-text">Search across all manuals, chapters and topics</div>
            <div className="gs-empty-hint">Try: "onboarding", "safety", "invoices", "ISO"</div>
          </div>
        ) : results.length === 0 ? (
          <div className="gs-empty">
            <div className="gs-empty-icon">∅</div>
            <div className="gs-empty-text">No results for "<strong>{query}</strong>"</div>
          </div>
        ) : (
          <ul className="gs-list" ref={listRef}>
            {results.map((item, i) => (
              <li key={i}
                className={`gs-item${i === cursor ? ' gs-item--active' : ''}`}
                onMouseEnter={() => setCursor(i)}
                onClick={() => go(item)}
              >
                <div className="gs-badge" style={{ background: item.color, color: item.tColor }}>
                  {item.pageTitle.split(' ').slice(0, 2).join(' ')}
                </div>
                <div className="gs-item-body">
                  <div className="gs-item-text">
                    <Highlight text={item.text} query={query} />
                  </div>
                  <div className="gs-item-meta">
                    <span className="gs-type-chip">{TYPE_LABEL[item.type]}</span>
                    <span className="gs-breadcrumb">{item.breadcrumb}</span>
                  </div>
                </div>
                <svg className="gs-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10L10 2M10 2H5.5M10 2V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </li>
            ))}
          </ul>
        )}

        {/* Footer */}
        <div className="gs-footer">
          <span><kbd>↑↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>Esc</kbd> close</span>
          <span style={{ marginLeft: 'auto' }}>{results.length > 0 && `${results.length} result${results.length !== 1 ? 's' : ''}`}</span>
        </div>
      </div>
    </div>
  );
}

function Highlight({ text, query }) {
  const q   = query.trim().toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return <span>{text}</span>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="gs-mark">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

// ── Trigger button used in every top bar ─────────────────────────────────────
export function SearchButton({ onClick }) {
  return (
    <button className="gs-trigger" onClick={onClick} title="Search (Ctrl+K)">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <circle cx="5.5" cy="5.5" r="4" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M9 9L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      Search
      <kbd className="gs-trigger-kbd">Ctrl K</kbd>
    </button>
  );
}
