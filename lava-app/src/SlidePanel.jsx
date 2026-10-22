import { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { resolvePdfPath, resolveFallbackPath, PDF_OPTIONS } from './pdfResolver.js';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

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
<title>${data.title} — LAVA</title>
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
    LAVA 2026<br/>
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

function OfficeMapSlide({ data }) {
  const [hov, setHov] = useState(null);

  const ZONE_COLORS  = { window:'#3B82F6', left:'#F59E0B', center:'#8B5CF6', hub:'#22C55E' };
  const ZONE_LABELS  = { window:'Window Row', left:'Left Wall', center:'Center Island', hub:'Hub · Hot Desks' };

  const DW = 72, DH = 44, CR = 11;

  // All desk positions are fixed to this floor-plan layout (SVG viewBox 530×390)
  const LAYOUT = {
    A1:{x:32, y:45, cs:'below'}, A2:{x:120,y:45, cs:'below'},
    A3:{x:208,y:45, cs:'below'}, A4:{x:296,y:45, cs:'below'},
    B1:{x:20, y:150,cs:'right'}, B2:{x:20, y:220,cs:'right'},
    C1:{x:168,y:143,cs:'above'}, C2:{x:256,y:143,cs:'above'},
    C3:{x:168,y:217,cs:'below'}, C4:{x:256,y:217,cs:'below'},
    H1:{x:86, y:318,cs:'above'}, H2:{x:176,y:318,cs:'above'}, H3:{x:266,y:318,cs:'above'},
  };

  const byId = {};
  data.desks.forEach(d => { byId[d.id] = d; });

  function chairPos({ x, y, cs }) {
    if (cs === 'below') return [x + DW/2, y + DH + CR + 2];
    if (cs === 'above') return [x + DW/2, y - CR - 2];
    if (cs === 'right') return [x + DW + CR + 2, y + DH/2];
    return [x - CR - 2, y + DH/2];
  }

  const hovDesk = hov ? byId[hov] : null;

  return (
    <div className="spom-wrap">
      <svg viewBox="0 0 530 390" className="spom-svg"
        style={{ fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif" }}>

        {/* ── Floor ── */}
        <rect x={15} y={15} width={500} height={360} fill="#F9FAFB" />

        {/* ── Kitchen fill & label ── */}
        <rect x={385} y={15} width={130} height={85} fill="#F3F4F6" />
        <text x={450} y={54} textAnchor="middle" fontSize={8} fill="#9CA3AF" fontWeight="700">KITCHEN</text>
        <rect x={416} y={60} width={22} height={18} rx={2} fill="none" stroke="#D1D5DB" strokeWidth={1.2}/>
        <rect x={444} y={60} width={22} height={18} rx={2} fill="none" stroke="#D1D5DB" strokeWidth={1.2}/>
        <circle cx={421} cy={71} r={4} fill="none" stroke="#D1D5DB" strokeWidth={1}/>
        <circle cx={449} cy={71} r={4} fill="none" stroke="#D1D5DB" strokeWidth={1}/>

        {/* ── Meeting table ── */}
        <ellipse cx={447} cy={232} rx={46} ry={66} fill="#E5E7EB" stroke="#D1D5DB" strokeWidth={1.5}/>
        <text x={447} y={229} textAnchor="middle" fontSize={7.5} fill="#9CA3AF" fontWeight="700">MEETING</text>
        <text x={447} y={240} textAnchor="middle" fontSize={7.5} fill="#9CA3AF" fontWeight="700">TABLE</text>
        {[[447,158],[498,180],[498,284],[447,306],[396,284],[396,180]].map(([cx,cy],i)=>(
          <circle key={i} cx={cx} cy={cy} r={9} fill="#E5E7EB" stroke="#D1D5DB" strokeWidth={1.2}/>
        ))}

        {/* ── Zone labels ── */}
        <text x={218} y={32} textAnchor="middle" fontSize={7} fill="#3B82F6" fontWeight="700" opacity={0.55}>WINDOW ROW</text>
        <text x={218} y={131} textAnchor="middle" fontSize={7} fill="#8B5CF6" fontWeight="700" opacity={0.55}>CENTER ISLAND</text>
        <text x={218} y={307} textAnchor="middle" fontSize={7} fill="#22C55E" fontWeight="700" opacity={0.55}>HUB — HOT DESKS</text>

        {/* ── Outer walls ── */}
        {/* Top wall with window punches */}
        <line x1={15} y1={19} x2={30}  y2={19} stroke="#374151" strokeWidth={8}/>
        <rect x={30}  y={11} width={80} height={16} fill="#F9FAFB"/>
        <rect x={30}  y={12} width={80} height={14} fill="#BFDBFE" rx={1}/>
        <line x1={110} y1={19} x2={118} y2={19} stroke="#374151" strokeWidth={8}/>
        <rect x={118} y={11} width={72} height={16} fill="#F9FAFB"/>
        <rect x={118} y={12} width={72} height={14} fill="#BFDBFE" rx={1}/>
        <line x1={190} y1={19} x2={206} y2={19} stroke="#374151" strokeWidth={8}/>
        <rect x={206} y={11} width={78} height={16} fill="#F9FAFB"/>
        <rect x={206} y={12} width={78} height={14} fill="#BFDBFE" rx={1}/>
        <line x1={284} y1={19} x2={383} y2={19} stroke="#374151" strokeWidth={8}/>
        {/* Left & right walls */}
        <line x1={19} y1={15} x2={19}  y2={375} stroke="#374151" strokeWidth={8}/>
        <line x1={511} y1={15} x2={511} y2={375} stroke="#374151" strokeWidth={8}/>
        {/* Bottom wall with door gap */}
        <line x1={15}  y1={371} x2={42}  y2={371} stroke="#374151" strokeWidth={8}/>
        <line x1={102} y1={371} x2={515} y2={371} stroke="#374151" strokeWidth={8}/>

        {/* ── Door ── */}
        <rect x={42} y={363} width={60} height={16} fill="#F9FAFB"/>
        <line x1={42} y1={371} x2={42}  y2={311} stroke="#9CA3AF" strokeWidth={1.8}/>
        <path d="M 102 371 A 60 60 0 0 0 42 311" fill="none" stroke="#D1D5DB" strokeWidth={1} strokeDasharray="3,2"/>
        <text x={72} y={388} textAnchor="middle" fontSize={7} fill="#9CA3AF">ENTRANCE</text>

        {/* ── Kitchen internal walls ── */}
        <line x1={385} y1={15}  x2={385} y2={100} stroke="#374151" strokeWidth={5}/>
        <line x1={385} y1={100} x2={515} y2={100} stroke="#374151" strokeWidth={5}/>

        {/* ── Desks ── */}
        {Object.entries(LAYOUT).map(([id, l]) => {
          const desk = byId[id];
          if (!desk) return null;
          const color = ZONE_COLORS[desk.zone] || '#6B7280';
          const isHov  = hov === id;
          const isHot  = desk.name === 'Hot Desk';
          const [cx, cy] = chairPos(l);
          return (
            <g key={id} style={{ cursor:'pointer' }}
              onMouseEnter={() => setHov(id)} onMouseLeave={() => setHov(null)}>
              {/* Chair */}
              <circle cx={cx} cy={cy} r={CR}
                fill={isHot ? '#DCFCE7' : `${color}22`}
                stroke={isHot ? '#22C55E88' : `${color}88`} strokeWidth={1.3}/>
              {/* Desk body */}
              <rect x={l.x} y={l.y} width={DW} height={DH} rx={3}
                fill={isHov ? `${color}28` : (isHot ? '#F0FDF4' : `${color}14`)}
                stroke={isHov ? color : (isHot ? '#22C55E99' : `${color}AA`)}
                strokeWidth={isHov ? 2 : 1.5}/>
              {/* ID badge */}
              <rect x={l.x+3} y={l.y+3} width={18} height={11} rx={2} fill={isHot ? '#22C55E' : color}/>
              <text x={l.x+12} y={l.y+12} textAnchor="middle" fontSize={7} fill="#fff" fontWeight="800">{id}</text>
              {/* Name */}
              <text x={l.x+DW/2} y={l.y+DH/2+6} textAnchor="middle"
                fontSize={isHot ? 7.5 : 8.5} fontWeight={isHov ? '700' : '600'}
                fill={isHot ? '#15803D' : '#1F2937'} fontStyle={isHot ? 'italic' : 'normal'}>
                {isHot ? 'open' : desk.name}
              </text>
            </g>
          );
        })}

        {/* ── Compass ── */}
        <text x={506} y={388} textAnchor="middle" fontSize={7} fill="#9CA3AF">↑ N</text>
      </svg>

      {/* Legend */}
      <div className="spom-legend">
        {Object.entries(ZONE_COLORS).map(([zone, color]) => (
          <div key={zone} className="spom-legend-item">
            <div className="spom-legend-dot" style={{ background: color }}/>
            <span>{ZONE_LABELS[zone]}</span>
          </div>
        ))}
      </div>

      {/* Hover info bar */}
      {hovDesk ? (
        <div className="spom-info">
          <strong>{hovDesk.id}</strong>
          <span>{hovDesk.name === 'Hot Desk' ? 'Available hot desk' : hovDesk.name}</span>
          <span className="spom-info-zone" style={{ color: ZONE_COLORS[hovDesk.zone] }}>
            {ZONE_LABELS[hovDesk.zone]}
          </span>
        </div>
      ) : (
        <div className="spom-hint">Hover a desk to see details</div>
      )}
    </div>
  );
}

const CAT_ICONS = {
  equipment: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><rect x="1" y="4" width="13" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M4 4V3C4 2.45 4.45 2 5 2H10C10.55 2 11 2.45 11 3V4" stroke="currentColor" strokeWidth="1.3"/><circle cx="7.5" cy="8" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>,
  book:      <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 2H10C10.55 2 11 2.45 11 3V12C11 12.55 10.55 13 10 13H3C2.45 13 2 12.55 2 12V3C2 2.45 2.45 2 3 2Z" stroke="currentColor" strokeWidth="1.3"/><path d="M5 5H9M5 7.5H9M5 10H7.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M11 4H12C12.55 4 13 4.45 13 5V13" stroke="currentColor" strokeWidth="1.3"/></svg>,
  materials: <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 11L7.5 3L13 11H2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5 11V13M10 11V13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  key:       <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="5.5" cy="6" r="3" stroke="currentColor" strokeWidth="1.3"/><path d="M8 8.5L13 13M10.5 11L12 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
};

function CheckoutSlide({ data, accentColor }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubcat, setActiveSubcat]     = useState(null);
  const [checkouts, setCheckouts]           = useState({});
  const [selected, setSelected]             = useState(new Set());
  const [form, setForm]                     = useState(null); // { keys:[], catColor }
  const [formName, setFormName]             = useState('');
  const [formReturn, setFormReturn]         = useState('');
  const [search, setSearch]                 = useState('');
  const [showHistory, setShowHistory]       = useState(false);
  const [history, setHistory]               = useState([]);

  const today = new Date().toISOString().split('T')[0];

  const allItems = data.categories.flatMap(cat => {
    if (cat.subcategories) {
      return cat.subcategories.flatMap(sub =>
        sub.items.map(item => ({ key: `${cat.id}::${item}`, item, cat, subcat: sub.label }))
      );
    }
    return (cat.items || []).map(item => ({ key: `${cat.id}::${item}`, item, cat, subcat: null }));
  });

  const activeCat = data.categories.find(c => c.id === activeCategory);

  function switchCategory(id) {
    setActiveCategory(id);
    setActiveSubcat(null);
    setSearch('');
  }

  const filtered = allItems.filter(({ cat, item, subcat }) => {
    const matchCat    = activeCategory === 'all' || cat.id === activeCategory;
    const matchSub    = !activeSubcat || subcat === activeSubcat;
    const matchSearch = !search.trim() || item.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSub && matchSearch;
  });

  const showGrouped   = activeCat?.subcategories && !search.trim() && !activeSubcat;
  const groupedDisplay = showGrouped
    ? activeCat.subcategories.map(sub => ({
        sub,
        items: allItems.filter(i => i.cat.id === activeCat.id && i.subcat === sub.label)
      }))
    : null;

  const checkedOutCount = Object.keys(checkouts).length;
  const availSelected   = [...selected].filter(k => !checkouts[k]);

  // ── selection ──────────────────────────────────────────────
  function toggleSelect(key) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function selectAllVisible() {
    const availKeys = filtered.filter(i => !checkouts[i.key]).map(i => i.key);
    setSelected(prev => {
      const next = new Set(prev);
      availKeys.forEach(k => next.add(k));
      return next;
    });
  }

  function clearSelection() { setSelected(new Set()); }

  // ── checkout ────────────────────────────────────────────────
  function openSingle(key, cat) {
    setForm({ keys: [key], catColor: cat.color });
    setFormName(''); setFormReturn('');
  }

  function openBatch() {
    if (availSelected.length === 0) return;
    const firstCat = data.categories.find(c => availSelected[0].startsWith(c.id + '::'));
    setForm({ keys: availSelected, catColor: firstCat?.color || accentColor });
    setFormName(''); setFormReturn('');
  }

  function confirmCheckout() {
    if (!formName.trim()) return;
    const entry = { name: formName.trim(), checkoutDate: today, returnDate: formReturn || null };
    setCheckouts(prev => {
      const next = { ...prev };
      form.keys.forEach(k => { next[k] = entry; });
      return next;
    });
    setSelected(prev => {
      const next = new Set(prev);
      form.keys.forEach(k => next.delete(k));
      return next;
    });
    setForm(null);
  }

  function doReturn(key) {
    const co = checkouts[key];
    const [, item] = key.split('::');
    const cat = data.categories.find(c => key.startsWith(c.id + '::'));
    setHistory(prev => [...prev, {
      item, catLabel: cat?.label || '', name: co.name,
      checkedOut: co.checkoutDate, returned: today
    }]);
    setCheckouts(prev => { const n = { ...prev }; delete n[key]; return n; });
    setSelected(prev => { const n = new Set(prev); n.delete(key); return n; });
  }

  function formatDate(d) {
    if (!d) return '—';
    const [y, m, day] = d.split('-');
    return `${day}.${m}.${y}`;
  }

  const isLight = accentColor === '#B3F400';

  function renderItem({ key, item, cat, subcat }) {
    const co     = checkouts[key];
    const isOut  = Boolean(co);
    const isSel  = selected.has(key);
    return (
      <div key={key}
        className={`spco-item${isOut ? ' spco-item--out' : ''}${isSel ? ' spco-item--selected' : ''}`}
        onClick={!isOut ? () => toggleSelect(key) : undefined}
        style={{ cursor: isOut ? 'default' : 'pointer' }}>

        {/* Checkbox */}
        {!isOut && (
          <div className={`spco-cb${isSel ? ' spco-cb--on' : ''}`}
            style={isSel ? { background: cat.color, borderColor: cat.color } : {}}>
            {isSel && (
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                <path d="M1 3L3 5L7 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        )}
        {isOut && <div className="spco-cb spco-cb--disabled" />}

        <div className="spco-item-left">
          <div className="spco-item-info">
            <div className="spco-item-name">{item}</div>
            <div className="spco-item-cat" style={{ color: isOut ? '#9CA3AF' : cat.color }}>
              {CAT_ICONS[cat.icon]}
              {subcat || cat.label}
              {isOut && co.returnDate && (
                <span className="spco-item-due"> · due {formatDate(co.returnDate)}</span>
              )}
            </div>
          </div>
        </div>

        {/* Borrower tag */}
        {isOut && (
          <div className="spco-tag">
            <div className="spco-tag-avatar">
              {co.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="spco-tag-body">
              <span className="spco-tag-name">{co.name}</span>
              <span className="spco-tag-date">{formatDate(co.checkoutDate)}</span>
            </div>
          </div>
        )}

        <div className="spco-item-action" onClick={e => e.stopPropagation()}>
          {isOut ? (
            <button className="spco-btn spco-btn--return" onClick={() => doReturn(key)}>Return</button>
          ) : (
            <button className="spco-btn spco-btn--checkout"
              style={{ background: cat.color }}
              onClick={() => openSingle(key, cat)}>
              Check out
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="spco-wrap">
      {/* Stats */}
      <div className="spco-stats">
        <span className="spco-stat">
          <span className="spco-stat-num" style={{ color: accentColor }}>{checkedOutCount}</span>
          checked out
        </span>
        <span className="spco-stat">
          <span className="spco-stat-num">{allItems.length - checkedOutCount}</span>
          available
        </span>
        <button className="spco-history-btn" onClick={() => setShowHistory(v => !v)}>
          {showHistory ? 'Hide history' : `History (${history.length})`}
        </button>
      </div>

      {showHistory && (
        <div className="spco-history">
          {history.length === 0
            ? <div className="spco-history-empty">No returns yet this session.</div>
            : history.slice().reverse().map((h, i) => (
              <div key={i} className="spco-history-row">
                <span className="spco-history-item">{h.item}</span>
                <span className="spco-history-meta">{h.name} · returned {formatDate(h.returned)}</span>
              </div>
            ))
          }
        </div>
      )}

      {/* Search */}
      <div className="spco-search-row">
        <div className="spco-search">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="5" cy="5" r="3.5" stroke="#9CA3AF" strokeWidth="1.3"/>
            <path d="M8 8L10.5 10.5" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input className="spco-search-input" placeholder="Search items…"
            value={search} onChange={e => { setSearch(e.target.value); setActiveSubcat(null); }} />
          {search && <button className="spco-search-clear" onClick={() => setSearch('')}>✕</button>}
        </div>
      </div>

      {/* Category tabs */}
      <div className="spco-tabs">
        <button className={`spco-tab${activeCategory === 'all' ? ' spco-tab--active' : ''}`}
          style={activeCategory === 'all' ? { background: accentColor, color: isLight ? '#1a1a1a' : '#fff', borderColor: accentColor } : {}}
          onClick={() => switchCategory('all')}>All</button>
        {data.categories.map(cat => (
          <button key={cat.id}
            className={`spco-tab${activeCategory === cat.id ? ' spco-tab--active' : ''}`}
            style={activeCategory === cat.id ? { background: cat.color, color: '#fff', borderColor: cat.color } : {}}
            onClick={() => switchCategory(cat.id)}>
            <span className="spco-tab-icon" style={{ color: activeCategory === cat.id ? '#fff' : cat.color }}>
              {CAT_ICONS[cat.icon]}
            </span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Subcategory pills */}
      {activeCat?.subcategories && !search.trim() && (
        <div className="spco-subcats">
          <button className={`spco-subcat${!activeSubcat ? ' spco-subcat--active' : ''}`}
            style={!activeSubcat ? { borderColor: activeCat.color, color: activeCat.color, background: `${activeCat.color}12` } : {}}
            onClick={() => setActiveSubcat(null)}>All</button>
          {activeCat.subcategories.map(sub => (
            <button key={sub.label}
              className={`spco-subcat${activeSubcat === sub.label ? ' spco-subcat--active' : ''}`}
              style={activeSubcat === sub.label ? { borderColor: activeCat.color, color: activeCat.color, background: `${activeCat.color}12` } : {}}
              onClick={() => setActiveSubcat(sub.label)}>
              {sub.label}
              <span className="spco-subcat-count">{sub.items.length}</span>
            </button>
          ))}
        </div>
      )}

      {/* Select-all hint row */}
      <div className="spco-sel-row">
        <button className="spco-sel-all" onClick={selectAllVisible}>
          Select all visible
        </button>
        {selected.size > 0 && (
          <button className="spco-sel-clear" onClick={clearSelection}>
            Clear ({selected.size})
          </button>
        )}
      </div>

      {/* Item list */}
      <div className="spco-list">
        {groupedDisplay ? (
          groupedDisplay.map(({ sub, items }) => (
            <div key={sub.label} className="spco-group">
              <div className="spco-group-header">
                <span className="spco-group-label" style={{ color: activeCat.color }}>{sub.label}</span>
                <span className="spco-group-count">{items.length} items</span>
              </div>
              {items.map(renderItem)}
            </div>
          ))
        ) : (
          <>
            {filtered.length === 0 && <div className="spco-empty">No items match your search.</div>}
            {filtered.map(renderItem)}
          </>
        )}
      </div>

      {/* Batch action bar */}
      {availSelected.length > 0 && (
        <div className="spco-batch-bar">
          <div className="spco-batch-info">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M3.5 7L5.5 9L10.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <strong>{availSelected.length}</strong> item{availSelected.length > 1 ? 's' : ''} selected
          </div>
          <button className="spco-batch-btn"
            style={{ background: accentColor, color: isLight ? '#1a1a1a' : '#fff' }}
            onClick={openBatch}>
            Check out all
          </button>
        </div>
      )}

      {/* Checkout form overlay */}
      {form && (
        <div className="spco-overlay">
          <div className="spco-form">
            <div className="spco-form-title">
              {form.keys.length > 1 ? `Check out ${form.keys.length} items` : 'Check out'}
            </div>
            <div className="spco-form-items">
              {form.keys.length <= 4
                ? form.keys.map(k => (
                    <div key={k} className="spco-form-item">{k.split('::')[1]}</div>
                  ))
                : <>
                    {form.keys.slice(0, 3).map(k => (
                      <div key={k} className="spco-form-item">{k.split('::')[1]}</div>
                    ))}
                    <div className="spco-form-item spco-form-item--more">
                      +{form.keys.length - 3} more items
                    </div>
                  </>
              }
            </div>
            <label className="spco-form-label">Your name *</label>
            <input className="spco-form-input" placeholder="Full name…"
              value={formName} onChange={e => setFormName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmCheckout(); if (e.key === 'Escape') setForm(null); }}
              autoFocus />
            <label className="spco-form-label">Expected return date</label>
            <input className="spco-form-input spco-form-input--date" type="date"
              min={today} value={formReturn} onChange={e => setFormReturn(e.target.value)} />
            <div className="spco-form-actions">
              <button className="spco-form-cancel" onClick={() => setForm(null)}>Cancel</button>
              <button className="spco-form-confirm"
                style={{ background: form.catColor, color: '#fff' }}
                onClick={confirmCheckout} disabled={!formName.trim()}>
                Confirm {form.keys.length > 1 ? `(${form.keys.length})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LockerMapSlide({ data, accentColor }) {
  const { rows, cols, freePositions } = data;
  const initFreeSet = new Set(freePositions);

  // booked: Map of idx → name (user-booked free lockers)
  const [booked, setBooked] = useState(new Map());
  // selecting: which free locker is being booked
  const [selecting, setSelecting] = useState(null);
  const [nameInput, setNameInput] = useState('');

  // build cells: label occupied lockers Name 1..N, free stay free
  let occ = 1;
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      const isFree = initFreeSet.has(idx);
      cells.push({ idx, label: isFree ? null : `Name ${occ++}`, free: isFree });
    }
  }

  const totalFree = freePositions.length;
  const bookedCount = booked.size;

  function handleFreeClick(idx) {
    if (booked.has(idx)) return; // already booked, no action
    setSelecting(idx);
    setNameInput('');
  }

  function confirmBooking() {
    const name = nameInput.trim();
    if (!name) return;
    setBooked(prev => new Map(prev).set(selecting, name));
    setSelecting(null);
    setNameInput('');
  }

  function cancelBooking() {
    setSelecting(null);
    setNameInput('');
  }

  function releaseLocker(idx) {
    setBooked(prev => { const m = new Map(prev); m.delete(idx); return m; });
  }

  return (
    <div className="splm-wrap">
      <div className="splm-stats">
        <span className="splm-stat splm-stat--occ">
          <span className="splm-swatch splm-swatch--occ" />
          {cells.length - totalFree + bookedCount} occupied
        </span>
        <span className="splm-stat splm-stat--free">
          <span className="splm-swatch splm-swatch--free" />
          {totalFree - bookedCount} available
        </span>
      </div>

      <div className="splm-grid-scroll"><div className="splm-grid" style={{ '--cols': cols }}>
        {cells.map(cell => {
          const bookedName = booked.get(cell.idx);
          const isSelecting = selecting === cell.idx;

          if (!cell.free) {
            return (
              <div key={cell.idx} className="splm-cell splm-cell--occ" title={cell.label}>
                <span>{cell.label}</span>
              </div>
            );
          }
          if (bookedName) {
            return (
              <div key={cell.idx} className="splm-cell splm-cell--booked" title={`Booked by ${bookedName}`}
                onClick={() => releaseLocker(cell.idx)}>
                <span>{bookedName}</span>
                <span className="splm-cell-release">✕</span>
              </div>
            );
          }
          return (
            <div key={cell.idx}
              className={`splm-cell splm-cell--free${isSelecting ? ' splm-cell--selecting' : ''}`}
              title="Click to book"
              onClick={() => handleFreeClick(cell.idx)}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                <path d="M1 4.5L3 6.5L7 2" stroke="#166534" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          );
        })}
      </div></div>

      {selecting !== null && (
        <div className="splm-booking">
          <div className="splm-booking-label">Book locker #{selecting + 1}</div>
          <input
            className="splm-booking-input"
            placeholder="Your name…"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') confirmBooking(); if (e.key === 'Escape') cancelBooking(); }}
            autoFocus
          />
          <div className="splm-booking-actions">
            <button className="splm-booking-cancel" onClick={cancelBooking}>Cancel</button>
            <button className="splm-booking-confirm"
              style={{ background: accentColor, color: accentColor === '#B3F400' ? '#1a1a1a' : '#fff' }}
              onClick={confirmBooking} disabled={!nameInput.trim()}>
              Book
            </button>
          </div>
        </div>
      )}

      <div className="splm-note">Click green to book · Click booked to release</div>
    </div>
  );
}

function EvalMatrixSlide({ data }) {
  const [openCat, setOpenCat] = useState(null);

  return (
    <div className="spev-wrap">
      {/* Categories */}
      {data.categories.map((cat, ci) => {
        const isOpen = openCat === ci;
        return (
          <div key={ci} className="spev-cat">
            <button
              className={`spev-cat-header${isOpen ? ' spev-cat-header--open' : ''}`}
              style={{ borderLeftColor: cat.color, background: isOpen ? `${cat.color}14` : '#fafafa' }}
              onClick={() => setOpenCat(isOpen ? null : ci)}
            >
              <span className="spev-cat-dot" style={{ background: cat.color }} />
              <span className="spev-cat-label">{cat.label}</span>
              <span className="spev-cat-count">{cat.criteria.length}</span>
              <svg className="spev-chevron" width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d={isOpen ? 'M1.5 7L5.5 3L9.5 7' : 'M1.5 4L5.5 8L9.5 4'}
                  stroke={cat.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {isOpen && (
              <div className="spev-criteria">
                {cat.criteria.map((crit, ki) => (
                  <div key={ki} className="spev-criterion">
                    <div className="spev-crit-name" style={{ borderLeftColor: cat.color }}>
                      {crit.name}
                    </div>
                    <div className="spev-crit-plus">
                      <span className="spev-sign spev-sign--plus">+</span>
                      <span>{crit.plus}</span>
                    </div>
                    <div className="spev-crit-minus">
                      <span className="spev-sign spev-sign--minus">−</span>
                      <span>{crit.minus}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}

function ServerLinkBlock({ label, path, accentColor }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    copyToClipboard(path).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <div className="sptx-server-link-wrap">
      <span className="sptx-server-link-label">Server Link</span>
      <button className="sptx-server-link-btn" onClick={handleCopy} style={{ borderColor: accentColor }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M1.5 4.5C1.5 3.4 2.4 2.5 3.5 2.5H6.5L8 4H13C14.1 4 15 4.9 15 6V12C15 13.1 14.1 14 13 14H3C1.9 14 1 13.1 1 12V4.5Z"
            stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" fill="currentColor" fillOpacity="0.08"/>
        </svg>
        {label}
        {copied && <span className="sptx-server-link-copied">Path copied!</span>}
      </button>
    </div>
  );
}

function TextSlide({ data, accentColor }) {
  return (
    <div className="sptx-wrap">
      {(data.blocks || []).map((block, i) => {
        if (block.t === 'h')
          return <div key={i} className="sptx-h" style={{ color: accentColor }}>{block.text}</div>;
        if (block.t === 'para')
          return <p key={i} className="sptx-para">{block.text}</p>;
        if (block.t === 'bullets')
          return (
            <ul key={i} className="sptx-bullets">
              {block.items.map((item, j) => (
                <li key={j} className="sptx-bullet-item">
                  <span className="sptx-dot" style={{ background: accentColor }} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          );
        if (block.t === 'kv')
          return (
            <dl key={i} className="sptx-kv">
              {block.items.map((item, j) => (
                <div key={j} className="sptx-kv-row">
                  <dt className="sptx-kv-key" style={{ color: accentColor }}>{item.k}</dt>
                  <dd className="sptx-kv-val">{item.v}</dd>
                </div>
              ))}
            </dl>
          );
        if (block.t === 'note')
          return (
            <div key={i} className="sptx-note" style={{ borderLeftColor: accentColor, background: `${accentColor}18` }}>
              {block.text}
            </div>
          );
        if (block.t === 'cta')
          return (
            <a key={i} href={block.url} target="_blank" rel="noopener noreferrer" className="sptx-cta" style={{ background: accentColor, color: accentColor === '#B3F400' ? '#1a1a1a' : '#fff' }}>
              {block.label}
              <span className="sptx-cta-arrow">↗</span>
            </a>
          );
        if (block.t === 'server-link')
          return <ServerLinkBlock key={i} label={block.label} path={block.path} accentColor={accentColor} />;
        return null;
      })}
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

function PdfScrollSlide({ data }) {
  const [numPages, setNumPages] = useState(null);
  const [baseWidth, setBaseWidth] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [useFallback, setUseFallback] = useState(false);
  const outerRef = useRef(null);
  const wrapRef = useRef(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, sl: 0, st: 0 });

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setBaseWidth(Math.floor(entry.contentRect.width - 32));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const clampZoom = (z) => Math.min(4, Math.max(0.5, z));

  const onWheel = (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom(z => clampZoom(z - e.deltaY * 0.001));
  };

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    const el = wrapRef.current;
    panStart.current = { x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop };
    e.preventDefault();
  };
  const onMouseMove = (e) => {
    if (!isPanning.current) return;
    const el = wrapRef.current;
    el.scrollLeft = panStart.current.sl - (e.clientX - panStart.current.x);
    el.scrollTop  = panStart.current.st - (e.clientY - panStart.current.y);
  };
  const onMouseUp = () => { isPanning.current = false; };

  const src = useFallback ? resolveFallbackPath(data.pdfPath) : resolvePdfPath(data.pdfPath);
  const pageWidth = baseWidth > 0 ? Math.round(baseWidth * zoom) : 0;
  const startPage = data.startPage ?? 1;

  return (
    <div ref={outerRef} className="sppdf-outer">
      <div
        ref={wrapRef}
        className="sppdf-wrap"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        style={{ cursor: isPanning.current ? 'grabbing' : 'grab' }}
      >
        <Document
          file={src}
          options={PDF_OPTIONS}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          onLoadError={() => {
            if (!useFallback && resolveFallbackPath(data.pdfPath)) setUseFallback(true);
          }}
          loading={<div className="sppdf-msg">Loading PDF…</div>}
          error={<div className="sppdf-msg sppdf-msg--err">Could not load PDF.<br/>Make sure the file server is reachable.</div>}
        >
          {numPages && pageWidth > 0 && (() => {
            const end = Math.min(data.endPage ?? numPages, numPages);
            const pages = [];
            for (let p = startPage; p <= end; p++) {
              pages.push(
                <div key={p} className="sppdf-page">
                  <Page
                    pageNumber={p}
                    width={pageWidth}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                  />
                </div>
              );
            }
            return pages;
          })()}
        </Document>
      </div>
      <div className="sp-zoom-controls">
        <button className="sp-zoom-btn" onClick={() => setZoom(z => clampZoom(z - 0.15))} title="Zoom out">−</button>
        <span className="sp-zoom-label">{Math.round(zoom * 100)}%</span>
        <button className="sp-zoom-btn" onClick={() => setZoom(z => clampZoom(z + 0.15))} title="Zoom in">+</button>
        <button className="sp-zoom-btn sp-zoom-reset" onClick={() => setZoom(1)} title="Reset zoom">⟳</button>
        {numPages && (
          <span className="sppdf-page-count">
            {data.startPage
              ? `pp. ${startPage}–${Math.min(data.endPage ?? numPages, numPages)}`
              : `${numPages} pages`}
          </span>
        )}
      </div>
    </div>
  );
}

function PdfPageSlide({ data, allSlideData, topicIndex, onSelect, pdfPath, pagesPath, pagePad }) {
  const scrollRef = useRef(null);
  const progScroll = useRef(false);
  const [pageSize, setPageSize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [useFallback, setUseFallback] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const dragRef = useRef(false);
  const lastPosRef = useRef({ x: 0, y: 0 });

  // Reset when the PDF file changes so the load event re-triggers the scroll
  useEffect(() => { if (pdfPath) setPdfLoaded(false); }, [pdfPath, useFallback]);

  const pages = (allSlideData ?? [data]).filter(s => s?.type === 'pdf-page');
  const basePath = pagesPath ?? '/MANUALS/SAFETY%20MANUAL/safety-pages/';
  const digits = pagePad ?? 2;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const el = scrollRef.current?.children[topicIndex];
      if (!el) return;
      progScroll.current = true;
      el.scrollIntoView({ behavior: 'instant', inline: 'start', block: 'nearest' });
      requestAnimationFrame(() => { progScroll.current = false; });
    });
    return () => cancelAnimationFrame(frame);
  // pdfLoaded triggers a re-scroll after react-pdf's Document mounts the scroll container
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicIndex, pdfLoaded]);

  // Reset pan when switching pages
  useEffect(() => { setPan({ x: 0, y: 0 }); }, [topicIndex]);

  function handleScroll() {
    if (progScroll.current || zoom > 1) return;
    const c = scrollRef.current;
    if (!c) return;
    const idx = Math.round(c.scrollLeft / c.clientWidth);
    if (idx !== topicIndex) onSelect(idx);
  }

  function handlePointerDown(e) {
    if (zoom <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    dragRef.current = true;
  }
  function handlePointerMove(e) {
    if (!dragRef.current) return;
    const dx = e.clientX - lastPosRef.current.x;
    const dy = e.clientY - lastPosRef.current.y;
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    setPan(p => ({ x: p.x + dx, y: p.y + dy }));
  }
  function handlePointerUp() { dragRef.current = false; }

  function zoomIn()  { setZoom(z => Math.min(4, +(z + 0.25).toFixed(2))); }
  function zoomOut() { setZoom(z => { const next = Math.max(0.5, +(z - 0.25).toFixed(2)); if (next <= 1) setPan({ x: 0, y: 0 }); return next; }); }
  function zoomReset() { setZoom(1); setPan({ x: 0, y: 0 }); }

  // Measure the wrap container so PDF page fills it without scrolling
  const wrapRef = useRef(null);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setPageSize({ w: Math.floor(width - 64), h: Math.floor(height - 64) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (pdfPath) {
    const pdfSrc = useFallback ? resolveFallbackPath(pdfPath) : resolvePdfPath(pdfPath);
    return (
      <div ref={wrapRef} className="sp-pdf-outer">
        <Document
          file={pdfSrc}
          options={PDF_OPTIONS}
          loading={<div className="sp-pdf-loading">Loading PDF…</div>}
          error={<div className="sp-pdf-loading">Failed to load PDF.</div>}
          onLoadSuccess={() => setPdfLoaded(true)}
          onLoadError={() => {
            if (!useFallback && resolveFallbackPath(pdfPath)) setUseFallback(true);
          }}
        >
          <div className="sp-pdf-wrap" ref={scrollRef} onScroll={handleScroll}>
            {pages.map((slide, i) => (
              <div
                key={i}
                className="sp-pdf-page"
                style={{ cursor: zoom > 1 ? 'grab' : 'default' }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <div style={{
                  transform: `translate(${pan.x}px, ${pan.y}px)`,
                  willChange: 'transform',
                }}>
                  {pageSize.h > 0 && (
                    <Page
                      pageNumber={slide.page}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      height={Math.round(pageSize.h * zoom)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Document>
        <div className="sp-zoom-controls">
          <button className="sp-zoom-btn" onClick={zoomOut}>−</button>
          <span className="sp-zoom-label">{Math.round(zoom * 100)}%</span>
          <button className="sp-zoom-btn" onClick={zoomIn}>+</button>
          {zoom !== 1 && (
            <button className="sp-zoom-btn sp-zoom-reset" onClick={zoomReset} title="Reset">↺</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="sp-pdf-wrap" ref={scrollRef} onScroll={handleScroll}>
      {pages.map((slide, i) => {
        const n = String(slide.page).padStart(digits, '0');
        return (
          <div key={i} className="sp-pdf-page">
            <img
              src={`${basePath}page-${n}.png`}
              alt={`Page ${slide.page}`}
              className="sp-pdf-canvas"
            />
          </div>
        );
      })}
    </div>
  );
}

const OFFICE_VARIANT_PAGES = new Set(['c1', 'c2', 'c3', 'd1', 'd2', 'd3']);

const OFFICE_TABS = [
  { id: 'berlin-sa24', label: 'Berlin SA24' },
  { id: 'berlin-s161', label: 'Berlin S161' },
  { id: 'stuttgart',   label: 'Stuttgart'   },
];

export default function SlidePanel({
  topic,
  topicIndex,
  totalTopics,
  pageTitle,
  pageId,
  accentColor,
  slideData,
  allSlideData,
  pdfPath,
  pagesPath,
  pagePad,
  onSelect,
  onClose,
}) {
  const [officeTab, setOfficeTab] = useState('berlin-sa24');
  const folderPath = 'file://lava-b-stor01/LIBRARY_WORKSPACE/6_MANUALS_TEST/1_OFFICE%20MANUAL/';
  const folderLabel = '\\\\lava-b-stor01\\LIBRARY_WORKSPACE\\6_MANUALS_TEST\\1_OFFICE MANUAL';

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

        {/* Office location tabs for C and D chapters */}
        {OFFICE_VARIANT_PAGES.has(pageId) && (
          <div className="sp-office-tabs">
            {OFFICE_TABS.map(tab => (
              <button
                key={tab.id}
                className={`sp-office-tab${officeTab === tab.id ? ' sp-office-tab--active' : ''}`}
                style={officeTab === tab.id ? { borderBottomColor: accentColor, color: accentColor } : {}}
                onClick={() => setOfficeTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Content area */}
        {OFFICE_VARIANT_PAGES.has(pageId) && officeTab !== 'berlin-sa24' ? (
          <div className="sp-placeholder">
            <div className="sp-placeholder-inner">
              <img src="/lava-logo.svg" alt="LAVA" className="sp-logo-img" />
              <div className="sp-placeholder-label">
                {OFFICE_TABS.find(t => t.id === officeTab)?.label} — content coming soon
              </div>
              <div className="sp-placeholder-hint">
                <em>{topic}</em> rules for this office will be placed here
              </div>
            </div>
          </div>
        ) : slideData?.type === 'table' ? (
          <TableSlide data={slideData} accentColor={accentColor} />
        ) : slideData?.type === 'links' ? (
          <LinksSlide data={slideData} accentColor={accentColor} />
        ) : slideData?.type === 'form' ? (
          <FormSlide data={slideData} accentColor={accentColor} />
        ) : slideData?.type === 'checklist' ? (
          <ChecklistSlide data={slideData} accentColor={accentColor} />
        ) : slideData?.type === 'office-map' ? (
          <OfficeMapSlide data={slideData} accentColor={accentColor} />
        ) : slideData?.type === 'checkout' ? (
          <CheckoutSlide data={slideData} accentColor={accentColor} />
        ) : slideData?.type === 'locker-map' ? (
          <LockerMapSlide data={slideData} accentColor={accentColor} />
        ) : slideData?.type === 'text' ? (
          <TextSlide data={slideData} accentColor={accentColor} />
        ) : slideData?.type === 'eval-matrix' ? (
          <EvalMatrixSlide data={slideData} accentColor={accentColor} />
        ) : slideData?.type === 'pdf-scroll' ? (
          <PdfScrollSlide data={slideData} />
        ) : slideData?.type === 'pdf-page' ? (
          <PdfPageSlide data={slideData} allSlideData={allSlideData} topicIndex={topicIndex} onSelect={onSelect} pdfPath={pdfPath} pagesPath={pagesPath} pagePad={pagePad} />
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
            <strong>Operating</strong> LAVA
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
