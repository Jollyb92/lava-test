import { useState } from 'react';

function ChevronIcon({ dir }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d={dir === 'left' ? 'M9 2L4 7L9 12' : 'M5 2L10 7L5 12'}
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 3.5C1 2.67 1.67 2 2.5 2H5.5L7 3.5H11.5C12.33 3.5 13 4.17 13 5V10.5C13 11.33 12.33 12 11.5 12H2.5C1.67 12 1 11.33 1 10.5V3.5Z"
        stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  );
}

const LINK_ICONS = {
  calendar: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="4" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M7 2V6M15 2V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M2 9H20" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="6" y="12" width="3" height="3" rx="0.5" fill="currentColor"/>
      <rect x="10" y="12" width="3" height="3" rx="0.5" fill="currentColor"/>
    </svg>
  ),
  coins: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="13" cy="13" r="7" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.6" fill="white"/>
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M9 6.5V11.5M7 8H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  datev: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M6 9H10M6 12H14M6 15H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M15 9H16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
  computer: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="3" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M7 19H15M11 16V19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
};

function LinksSlide({ data, accentColor }) {
  function handleClick(item, e) {
    if (!item.url || item.url === '#') {
      e.preventDefault();
      alert(`Link for "${item.label}" is not yet configured.\nPlease contact HR or IT to get the correct URL.`);
      return;
    }
    if (item.external) {
      e.preventDefault();
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <div className="sp-links-wrap">
      <div className="sp-links-intro">Quick access to HR &amp; IT digital forms and systems</div>
      <div className="sp-links-grid">
        {data.items.map((item, i) => (
          <a
            key={i}
            className={`sp-link-card${!item.url || item.url === '#' ? ' sp-link-card--placeholder' : ''}`}
            href={item.url || '#'}
            target={item.external ? '_blank' : undefined}
            rel={item.external ? 'noopener noreferrer' : undefined}
            onClick={(e) => handleClick(item, e)}
          >
            <div className="sp-link-icon" style={{ color: accentColor, background: `${accentColor}18` }}>
              {LINK_ICONS[item.icon]}
            </div>
            <div className="sp-link-body">
              <div className="sp-link-label">{item.label}</div>
              <div className="sp-link-desc">{item.desc}</div>
            </div>
            <div className="sp-link-arrow">
              {!item.url || item.url === '#' ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="#D1D5DB" strokeWidth="1.3"/>
                  <path d="M6 4V6.5M6 8V8.2" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10L10 2M10 2H5.5M10 2V6.5" stroke={accentColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </a>
        ))}
      </div>
      <div className="sp-links-note">
        Links marked with <span style={{ color: '#9CA3AF' }}>○</span> are not yet configured — contact HR or IT to request access.
      </div>
    </div>
  );
}

function ChecklistSlide({ data, accentColor }) {
  const total = data.sections.reduce((n, s) => n + s.steps.length, 0);
  const [checked, setChecked] = useState(new Set());

  function toggle(key) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const allDone = checked.size === total;

  return (
    <div className="spcl-wrap">
      {/* Progress bar */}
      <div className="spcl-progress-row">
        <div className="spcl-progress-track">
          <div className="spcl-progress-fill" style={{ width: `${Math.round((checked.size / total) * 100)}%`, background: allDone ? '#22C55E' : accentColor }} />
        </div>
        <span className="spcl-progress-label" style={{ color: allDone ? '#22C55E' : '#6B7280' }}>
          {checked.size}/{total}{allDone ? ' ✓' : ''}
        </span>
        {checked.size > 0 && (
          <button className="spcl-reset" onClick={() => setChecked(new Set())}>Reset</button>
        )}
      </div>

      {data.sections.map((section, si) => {
        const sectionKeys = section.steps.map((_, i) => `${si}-${i}`);
        const doneSec = sectionKeys.filter(k => checked.has(k)).length;
        const allSecDone = doneSec === section.steps.length;

        return (
          <div key={si} className="spcl-section" style={{ borderLeft: `3px solid ${section.color}` }}>
            <div className="spcl-section-head">
              <div className="spcl-section-dot" style={{ background: section.color }} />
              <span className="spcl-section-title">{section.title}</span>
              <span className="spcl-section-badge"
                style={{ background: allSecDone ? section.color : `${section.color}22`, color: allSecDone ? '#fff' : section.color }}>
                {doneSec}/{section.steps.length}
              </span>
            </div>

            {section.steps.map((step, i) => {
              const key = `${si}-${i}`;
              const done = checked.has(key);
              return (
                <div key={key} className={`spcl-item${done ? ' spcl-item--done' : ''}`} onClick={() => toggle(key)}>
                  <div className="spcl-num" style={{ background: done ? section.color : `${section.color}22`, color: done ? '#fff' : section.color }}>
                    {done ? (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.2 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className="spcl-step">{step}</span>
                </div>
              );
            })}
          </div>
        );
      })}

      {allDone && (
        <div className="spcl-done-banner">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="#22C55E" strokeWidth="1.5"/>
            <path d="M4.5 8.5L6.5 10.5L11.5 5.5" stroke="#22C55E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          All steps complete
        </div>
      )}
    </div>
  );
}

const FORM_ICONS = {
  calendar: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M6 2V5M14 2V5M2 8H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><rect x="5" y="11" width="3" height="3" rx="0.5" fill="currentColor"/><rect x="9" y="11" width="3" height="3" rx="0.5" fill="currentColor"/></svg>,
  swap:     <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 6H16M16 6L13 3M16 6L13 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 14H4M4 14L7 11M4 14L7 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  health:   <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 17C10 17 3 12.5 3 7.5C3 5.57 4.57 4 6.5 4C7.76 4 8.87 4.65 9.5 5.64C10.13 4.65 11.24 4 12.5 4C14.43 4 16 5.57 16 7.5C16 12.5 10 17 10 17Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 8.5H12M10 6.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>,
  clock:    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6V10.5L13 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
};

function FormSlide({ data, accentColor }) {
  const [values,    setValues]    = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [fileName,  setFileName]  = useState({});

  function set(id, val) { setValues(v => ({ ...v, [id]: val })); }
  function setFile(id, file) {
    setFileName(f => ({ ...f, [id]: file?.name || '' }));
    set(id, file?.name || '');
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  function handlePrint() {
    const today = new Date().toLocaleDateString('en-GB');
    const fieldRows = data.fields.map(f => {
      const val = f.type === 'upload' ? (fileName[f.id] ? `[File: ${fileName[f.id]}]` : '') : (values[f.id] || '');
      return `<tr>
        <td class="fl">${f.label}${f.required ? ' <span class="req">*</span>' : ''}</td>
        <td class="fv">${val || '<span class="empty">—</span>'}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>${data.title} — LAVA Berlin</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: #111; padding: 28px 40px; }
  .doc-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 2px solid #111; margin-bottom: 18px; }
  .doc-title { font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: .07em; }
  .doc-sub { font-size: 9px; color: #888; margin-top: 3px; }
  .doc-meta { text-align: right; font-size: 9px; color: #888; }
  .form-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  .form-table tr { border-bottom: 1px solid #eee; }
  .form-table tr:last-child { border-bottom: none; }
  td.fl { width: 38%; padding: 10px 12px 10px 0; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: #555; vertical-align: top; padding-top: 11px; }
  td.fv { padding: 8px 0; font-size: 11px; color: #111; border-bottom: 1px solid #ccc; min-height: 24px; }
  .empty { color: #ccc; }
  .req { color: #e33; }
  .sign-section { margin-top: 28px; padding-top: 16px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; gap: 40px; }
  .sign-field { flex: 1; }
  .sign-label { font-size: 9px; color: #888; text-transform: uppercase; letter-spacing: .04em; margin-bottom: 18px; }
  .sign-line { border-bottom: 1px solid #999; padding-bottom: 2px; }
  @page { margin: 14mm; }
</style></head><body>
<div class="doc-header">
  <div>
    <div class="doc-title">${data.title}</div>
    <div class="doc-sub">${data.subtitle}</div>
  </div>
  <div class="doc-meta">
    LAVA Berlin 2026<br/>
    HR &amp; Personnel Management<br/>
    Date: ${today}
  </div>
</div>
<table class="form-table">${fieldRows}</table>
<div class="sign-section">
  <div class="sign-field">
    <div class="sign-label">Employee signature</div>
    <div class="sign-line">&nbsp;</div>
  </div>
  <div class="sign-field">
    <div class="sign-label">HR / Lead approval</div>
    <div class="sign-line">&nbsp;</div>
  </div>
  <div class="sign-field">
    <div class="sign-label">Date</div>
    <div class="sign-line">&nbsp;</div>
  </div>
</div>
</body></html>`;

    const w = window.open('', '_blank', 'width=820,height=680');
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  }

  const isLight = accentColor === '#B3F400';
  const btnStyle = { background: accentColor, color: isLight ? '#1a1a1a' : '#fff' };

  if (submitted) {
    return (
      <div className="spf-success">
        <div className="spf-success-icon" style={{ color: accentColor }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="19" stroke={accentColor} strokeWidth="2"/>
            <path d="M11 21L17 27L29 14" stroke={accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="spf-success-title">Submitted</div>
        <div className="spf-success-msg">{data.confirmMessage}</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <button className="spf-btn-pdf spf-btn-pdf--lg" type="button" onClick={handlePrint}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="2" y="1" width="8" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="2" y="7" width="8" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M2 5H10V8H2V5Z" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="8.5" cy="6.5" r="0.6" fill="currentColor"/>
            </svg>
            Export PDF
          </button>
          <button className="spf-reset-btn" style={btnStyle} onClick={() => { setSubmitted(false); setValues({}); setFileName({}); }}>
            Submit another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="spf-wrap">
      <div className="spf-header">
        <div className="spf-header-icon" style={{ color: accentColor, background: `${accentColor}18` }}>
          {FORM_ICONS[data.icon]}
        </div>
        <div>
          <div className="spf-title">{data.title}</div>
          <div className="spf-subtitle">{data.subtitle}</div>
        </div>
      </div>

      <form className="spf-form" onSubmit={handleSubmit}>
        <div className="spf-fields">
          {data.fields.map(field => (
            <div key={field.id} className={`spf-field${field.type === 'textarea' || field.type === 'upload' ? ' spf-field--full' : ''}`}>
              <label className="spf-label">
                {field.label}
                {field.required && <span className="spf-req">*</span>}
              </label>

              {field.type === 'text' && (
                <input className="spf-input" type="text" placeholder={field.placeholder || ''}
                  value={values[field.id] || ''} onChange={e => set(field.id, e.target.value)} required={field.required} />
              )}
              {field.type === 'date' && (
                <input className="spf-input spf-input--date" type="date"
                  value={values[field.id] || ''} onChange={e => set(field.id, e.target.value)} required={field.required} />
              )}
              {field.type === 'select' && (
                <select className="spf-input spf-select" value={values[field.id] || ''} onChange={e => set(field.id, e.target.value)} required={field.required}>
                  <option value="">Select…</option>
                  {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
              {field.type === 'textarea' && (
                <textarea className="spf-textarea" placeholder={field.placeholder || ''} rows={3}
                  value={values[field.id] || ''} onChange={e => set(field.id, e.target.value)} />
              )}
              {field.type === 'upload' && (
                <label className="spf-upload">
                  <input type="file" className="spf-file-input" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setFile(field.id, e.target.files?.[0])} />
                  <div className="spf-upload-inner" style={fileName[field.id] ? { borderColor: accentColor } : {}}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 13V4M10 4L7 7M10 4L13 7" stroke={fileName[field.id] ? accentColor : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 14V15.5C4 16.33 4.67 17 5.5 17H14.5C15.33 17 16 16.33 16 15.5V14" stroke={fileName[field.id] ? accentColor : '#9CA3AF'} strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <span className="spf-upload-label" style={{ color: fileName[field.id] ? accentColor : undefined }}>
                      {fileName[field.id] || (field.placeholder || 'Click to upload')}
                    </span>
                  </div>
                </label>
              )}
            </div>
          ))}
        </div>

        <div className="spf-footer">
          <p className="spf-disclaimer">Placeholder — connect to HR system for live submission.</p>
          <button className="spf-btn-pdf" type="button" onClick={handlePrint}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <rect x="2" y="1" width="8" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
              <rect x="2" y="7" width="8" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M2 5H10V8H2V5Z" stroke="currentColor" strokeWidth="1.2"/>
              <circle cx="8.5" cy="6.5" r="0.6" fill="currentColor"/>
            </svg>
            PDF
          </button>
          <button className="spf-submit" type="submit" style={btnStyle}>
            {data.submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function TableSlide({ data, accentColor }) {
  return (
    <div className="sp-table-wrap">
      <table className="sp-table">
        <thead>
          <tr>
            {data.columns.map((col, i) => (
              <th key={i} style={{ background: accentColor, color: accentColor === '#B3F400' ? '#1a1a1a' : '#fff' }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'sp-table-row-even' : 'sp-table-row-odd'}>
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? 'sp-table-process' : ''}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function SlidePanel({
  topic,
  topicIndex,
  totalTopics,
  pageTitle,
  pageId,
  accentColor,
  slideData,
  onSelect,
  onClose,
}) {
  const folderPath = `file:///L:/BER%20PROJECTS/Office%20Manual/${pageId.toUpperCase()}/`;
  const folderLabel = `L:\\BER PROJECTS\\Office Manual\\${pageId.toUpperCase()}\\`;

  function handleFolderClick(e) {
    e.preventDefault();
    const opened = window.open(folderPath, '_blank');
    if (!opened) {
      navigator.clipboard?.writeText(folderLabel).catch(() => {});
      alert(`Server path:\n${folderLabel}\n\n(Path copied to clipboard)`);
    }
  }

  return (
    <div className="sp-panel">
      {/* Top bar: nav + close */}
      <div className="sp-topbar">
        <button className="sp-navbtn" onClick={() => onSelect(Math.max(0, topicIndex - 1))}
          disabled={topicIndex === 0} title="Previous">
          <ChevronIcon dir="left" />
        </button>
        <span className="sp-nav-label">{topicIndex + 1} / {totalTopics}</span>
        <button className="sp-navbtn" onClick={() => onSelect(Math.min(totalTopics - 1, topicIndex + 1))}
          disabled={topicIndex === totalTopics - 1} title="Next">
          <ChevronIcon dir="right" />
        </button>
        <div className="sp-topbar-title">{topic}</div>
        <button className="sp-close" onClick={onClose} title="Close">
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <path d="M1 1L10 10M10 1L1 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Slide body: fills all remaining height */}
      <div className="sp-body">

        {/* Slide header band */}
        <div className="sp-header" style={{ background: accentColor }}>
          <span className="sp-header-section">{pageTitle}</span>
          <span className="sp-header-sep">›</span>
          <span className="sp-header-topic">{topic}</span>
        </div>

        {/* Content area */}
        {slideData?.type === 'table' ? (
          <TableSlide data={slideData} accentColor={accentColor} />
        ) : slideData?.type === 'links' ? (
          <LinksSlide data={slideData} accentColor={accentColor} />
        ) : slideData?.type === 'form' ? (
          <FormSlide data={slideData} accentColor={accentColor} />
        ) : slideData?.type === 'checklist' ? (
          <ChecklistSlide data={slideData} accentColor={accentColor} />
        ) : (
          <div className="sp-placeholder">
            <div className="sp-placeholder-inner">
              <img
                src="/lava-logo.svg"
                alt="LAVA"
                className="sp-logo-img"
              />
              <div className="sp-placeholder-label">Placeholder — image or diagram</div>
              <div className="sp-placeholder-hint">
                Content for <em>{topic}</em> will be placed here
              </div>
            </div>
          </div>
        )}

        {/* Footer: branding + folder link */}
        <div className="sp-footer">
          <span className="sp-brand">
            <strong>LAVA</strong> Office Manual Berlin 2026
          </span>
          <a
            className="sp-folder-btn"
            href={folderPath}
            onClick={handleFolderClick}
            title={folderLabel}
          >
            <FolderIcon />
            Open folder
          </a>
        </div>
      </div>
    </div>
  );
}
