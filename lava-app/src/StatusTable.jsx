import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx-js-style';
import { COLORS, READINESS, detailPages, tocData } from './data.js';

const LS_KEY = 'lava_status_comments';

const MANUALS = [
  { id: 'office',        label: 'Office Manual 2026',   colorKey: 'center',        responsible: 'Office Manager + Directors',             readiness: READINESS.office,        date: '2023',       version: 'V1.01' },
  { id: 'cultural',      label: 'Cultural Manual',             colorKey: 'cultural',      responsible: 'Founders / Directors',                   readiness: READINESS.cultural,      date: 'N/A',        version: 'V1.01' },
  { id: 'design',        label: 'Design Manual',               colorKey: 'design',        responsible: 'Directors, Project Leads, Project Staff', readiness: READINESS.design,        date: 'N/A',        version: 'V1.01' },
  { id: 'bidding',       label: 'Bidding Manual',              colorKey: 'bidding',       responsible: 'PR + Senior Leadership',                 readiness: READINESS.bidding,       date: '2026',       version: 'V1.01' },
  { id: 'communication', label: 'Communication Manual',        colorKey: 'communication', responsible: 'Design Leads',                           readiness: READINESS.communication, date: '01.2023',    version: 'V1.01' },
  { id: 'qems',          label: 'QEMS',                        colorKey: 'qems',          responsible: 'Existing owners',                        readiness: READINESS.qems,          date: '2026',       version: 'V1.01' },
  { id: 'ppm',           label: 'Project Management Manual',   colorKey: 'ppm',           responsible: 'Directors, Project Leads, Project Staff', readiness: READINESS.ppm,           date: '15.05.2025', version: 'V1.01' },
  { id: 'worksafety',    label: 'Work Safety Manual',          colorKey: 'safety',        responsible: 'Sicherheitsfachkraft (Safety Officer)',  readiness: READINESS.safety,        date: '2026',       version: 'V1.01' },
  { id: 'guides',        label: 'Guides & Registers',          colorKey: 'guides',        responsible: 'LAVA Zero + Admin',                      readiness: READINESS.guides,        date: '06.2026',    version: 'V1.01' },
  { id: 'live',          label: 'Live Systems & Tools',        colorKey: 'live',          responsible: 'IT team',                                readiness: READINESS.live,          date: '2026',       version: 'V1.01' },
  { id: 'lavazero',      label: 'LAVA Zero',                   colorKey: 'lavaZero',      responsible: 'LAVA Zero Team',                         readiness: READINESS.lavaZero,      date: '06.2026',    version: 'V1.01' },
];

const MANUAL_COMMENTS = {
  office:        'Graphic update? Images? Content check update?',
  cultural:      'Not started, content is flying around for recycling',
  design:        'Has parts in PMM and Comp guidelines and Communication?',
  bidding:       'Big part in PMM, currently Su is working on other parts',
  communication: 'Compiled, structured in app with 6 chapters',
  qems:          'Compiled — requires to insert documents',
  ppm:           'Outdated, needs to be cleaned and split',
  worksafety:    'Done',
  guides:        'Spread around, needs to be cleaned, proofed and combined',
  live:          'Compiled, missing some parts',
  lavazero:      'Structure ready in app, content to be populated per chapter',
};

const SECTION_COMMENTS = {
  office:        ['Add more narrative', 'Add forms pdf?, buddy system', 'Work on checkout system — email to Laurent for books and tools', 'Add lava zero, environmental preparedness', 'Design manual material, PMM material link, templates', 'Agree on content', 'Content graphic update?'],
  cultural:      ['Add content and narrative', 'Add content and narrative', 'Add content and narrative', 'Add content and narrative'],
  design:        ['Design direction and explanation', 'Add narrative', 'Choose diagrams and templates', 'Comes from communication?', 'Not approved, big pdf'],
  bidding:       ['In the PMM?', 'What ones go here?', 'What ones go here?', 'What ones go here?'],
  communication: ['Logo — confirm clearspace rules', 'Font & Color — confirm accents', 'LAVA Narrative — confirm copy', 'Themes — confirm visuals', 'LAVA Locations — check studio list', 'Style & Hub — link to assets hub'],
  qems:          ['Available to read?', 'Available to read?', 'Available to read?', 'Available to read?', 'Available to read?', 'Available to read?'],
  ppm:           ['Check and proof', 'Goes to Bidding Manual', 'Check and proof', 'Check and proof'],
  worksafety:    ['Ready to use document, implemented', 'Ready to use document, implemented', 'Ready to use document, implemented', 'Ready to use document, implemented', 'Ready to use document, implemented'],
  guides:        ['Which form of the information?', 'Which form of the information?', 'Which form of the information?', 'Which form of the information?'],
  live:          [null, 'Check actuality', 'Check actuality, implement in the app', 'Check actuality', 'Check actuality'],
  lavazero:      ['Add session content', 'Add tools list', 'Add materials catalogue', 'Add EPD database links'],
};

// Section-level readiness % per manual (indexed by section order from getSections)
const SECTION_READINESS = {
  office:        [80, 60, 70, 70, 60, 70, 70],   // Part A–G
  cultural:      [20, 20, 20, 20],
  design:        [10, 10, 30, 20, 80],
  bidding:       [60, 30, 20, 20],
  communication: [40, 40, 40, 40, 40, 40],
  qems:          [80, 80, 80, 80, 80, 80],
  ppm:           [80, 80, 80, 80],
  worksafety:    [100, 100, 100, 100, 100],
  guides:        [20, 20, 20, 20],
  live:          [60, 70, 70, 70, 70],
  lavazero:      [90, 90, 90, 90],
};

function loadComments() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch {
    return {};
  }
}

function getSections(id) {
  if (id === 'office') {
    return tocData.parts
      .filter(p => /^Part [A-G]/.test(p.label))
      .map(p => p.label);
  }
  const page = detailPages[id];
  if (!page) return [];
  if (page.chapters) return page.chapters.map(ch => ch.title.replace(/^\d+\s+/, ''));
  if (page.topics)   return page.topics.map(t => t.replace(/ — .*/, ''));
  return [];
}

function progressColor(v) {
  if (v >= 90) return '#15803D';   // deep green
  if (v >= 70) return '#86EFAC';   // light green
  if (v >= 50) return '#EAB308';   // yellow
  if (v > 20)  return '#F97316';   // orange
  return '#EF4444';                 // red
}

function ProgressCell({ value }) {
  if (value == null) return <span className="st-dim">—</span>;
  const col = progressColor(value);
  return (
    <div className="st-prog">
      <div className="st-prog-track">
        <div className="st-prog-fill" style={{ width: `${value}%`, background: col }} />
      </div>
      <span className="st-prog-label" style={{ color: col }}>{value}%</span>
    </div>
  );
}

function CommentCell({ value, onChange }) {
  const ref = useRef(null);

  function autoResize() {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }

  useEffect(() => { autoResize(); }, [value]);

  return (
    <textarea
      ref={ref}
      className="st-comment-input"
      value={value}
      rows={1}
      onChange={e => { onChange(e.target.value); autoResize(); }}
      onClick={e => e.stopPropagation()}
    />
  );
}

// All colors must be 8-char AARRGGBB for xlsx-js-style
function argb(hex) {
  return 'FF' + hex.replace('#', '').toUpperCase();
}

function tintArgb(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const ch = c => Math.round(255 + (c - 255) * opacity).toString(16).padStart(2, '0').toUpperCase();
  return 'FF' + ch(r) + ch(g) + ch(b);
}

function cell(v, s) {
  return { v, t: 's', s };
}

export default function StatusTable({ open, onClose }) {
  const [expanded, setExpanded] = useState(() => new Set(MANUALS.map(m => m.id)));
  const [comments, setComments] = useState(loadComments);
  const commentsRef = useRef(comments);
  const saveTimer = useRef(null);

  // Flush pending save immediately when modal closes or component unmounts
  useEffect(() => {
    if (!open) {
      clearTimeout(saveTimer.current);
      localStorage.setItem(LS_KEY, JSON.stringify(commentsRef.current));
    }
  }, [open]);

  useEffect(() => {
    return () => {
      clearTimeout(saveTimer.current);
      localStorage.setItem(LS_KEY, JSON.stringify(commentsRef.current));
    };
  }, []);

  function getComment(key, defaultVal) {
    return key in comments ? comments[key] : (defaultVal ?? '');
  }

  function handleCommentChange(key, value) {
    const next = { ...commentsRef.current, [key]: value };
    commentsRef.current = next;
    setComments(next);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(LS_KEY, JSON.stringify(commentsRef.current));
    }, 1500);
  }

  function exportToXlsx() {
    const ws = {};
    let row = 0;

    const HDR = {
      fill: { patternType: 'solid', fgColor: { rgb: argb('#1a1a1a') } },
      font: { bold: true, color: { rgb: argb('#B3F400') }, sz: 11 },
      alignment: { vertical: 'center' },
    };
    ['Manual', 'Section', 'Responsible', 'Readiness %', 'Date', 'Version', 'Comments'].forEach((v, c) => {
      ws[XLSX.utils.encode_cell({ r: row, c })] = cell(v, HDR);
    });
    row++;

    for (const manual of MANUALS) {
      const bg      = COLORS[manual.colorKey];
      const fgText  = manual.colorKey === 'center' ? argb('#1a1a1a') : argb('#ffffff');
      const tintBg  = tintArgb(bg, 0.15);

      const MAN = {
        fill: { patternType: 'solid', fgColor: { rgb: argb(bg) } },
        font: { bold: true, color: { rgb: fgText }, sz: 11 },
        alignment: { vertical: 'center' },
      };
      const SEC = {
        fill: { patternType: 'solid', fgColor: { rgb: tintBg } },
        font: { color: { rgb: argb('#374151') }, sz: 10 },
        alignment: { vertical: 'center', indent: 1 },
      };
      const SEC_DIM = {
        fill: { patternType: 'solid', fgColor: { rgb: tintBg } },
        font: { color: { rgb: argb('#9CA3AF') }, sz: 10 },
        alignment: { vertical: 'center' },
      };

      const readinessVal = manual.readiness != null ? manual.readiness + '%' : '';
      const manComment = getComment(`manual_${manual.id}`, MANUAL_COMMENTS[manual.id]);
      [manual.label, '', manual.responsible, readinessVal, manual.date, manual.version, manComment].forEach((v, c) => {
        ws[XLSX.utils.encode_cell({ r: row, c })] = cell(v, MAN);
      });
      row++;

      getSections(manual.id).forEach((sec, si) => {
        const secVal     = (SECTION_READINESS[manual.id] || [])[si] ?? null;
        const secDefault = (SECTION_COMMENTS[manual.id]  || [])[si] ?? null;
        const secComment = getComment(`section_${manual.id}_${si}`, secDefault);
        ws[XLSX.utils.encode_cell({ r: row, c: 0 })] = cell('', SEC);
        ws[XLSX.utils.encode_cell({ r: row, c: 1 })] = cell(sec, SEC);
        ws[XLSX.utils.encode_cell({ r: row, c: 2 })] = cell(manual.responsible, SEC_DIM);
        ws[XLSX.utils.encode_cell({ r: row, c: 3 })] = cell(secVal != null ? secVal + '%' : '—', SEC_DIM);
        ws[XLSX.utils.encode_cell({ r: row, c: 4 })] = cell('', SEC_DIM);
        ws[XLSX.utils.encode_cell({ r: row, c: 5 })] = cell('', SEC_DIM);
        ws[XLSX.utils.encode_cell({ r: row, c: 6 })] = cell(secComment || '', SEC_DIM);
        row++;
      });
    }

    ws['!ref']  = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: row - 1, c: 6 } });
    ws['!cols'] = [{ wch: 36 }, { wch: 42 }, { wch: 36 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 50 }];
    ws['!rows'] = Array.from({ length: row }, () => ({ hpt: 18 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Manual Status');
    XLSX.writeFile(wb, 'LAVA_Manual_Status.xlsx');
  }

  if (!open) return null;

  const totalSections = MANUALS.reduce((n, m) => n + getSections(m.id).length, 0);

  function toggle(id) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="st-backdrop" onClick={onClose}>
      <div className="st-sheet" onClick={e => e.stopPropagation()}>

        <div className="st-header">
          <span className="st-title">Manual Status Overview</span>
          <span className="st-subtitle">{MANUALS.length} manuals · {totalSections} sections</span>
          <button className="st-export-btn" onClick={exportToXlsx}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v7M6.5 8L4 5.5M6.5 8L9 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M1.5 10v1.5h10V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export .xlsx
          </button>
          <button className="st-close" onClick={onClose}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1 1L12 12M12 1L1 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="st-scroll">
          <table className="st-table">
            <thead>
              <tr>
                <th className="st-th-name">Manual / Section</th>
                <th className="st-th-resp">Responsible</th>
                <th className="st-th-prog">Readiness</th>
                <th className="st-th-date">Date</th>
                <th className="st-th-ver">Version</th>
                <th className="st-th-comment">Comments</th>
              </tr>
            </thead>
            <tbody>
              {MANUALS.map(manual => {
                const color   = COLORS[manual.colorKey];
                const sections = getSections(manual.id);
                const isOpen  = expanded.has(manual.id);
                return (
                  <>
                    <tr key={manual.id} className="st-row-manual" onClick={() => toggle(manual.id)}>
                      <td className="st-cell-manual">
                        <span className="st-swatch" style={{ background: color }} />
                        <span className="st-manual-name">{manual.label}</span>
                        {sections.length > 0 && (
                          <span className="st-chevron">{isOpen ? '▾' : '▸'}</span>
                        )}
                      </td>
                      <td className="st-cell-resp">{manual.responsible}</td>
                      <td className="st-cell-prog"><ProgressCell value={manual.readiness} /></td>
                      <td className="st-cell-date">{manual.date}</td>
                      <td className="st-cell-ver">{manual.version}</td>
                      <td className="st-cell-comment">
                        <CommentCell
                          value={getComment(`manual_${manual.id}`, MANUAL_COMMENTS[manual.id])}
                          onChange={v => handleCommentChange(`manual_${manual.id}`, v)}
                        />
                      </td>
                    </tr>
                    {isOpen && sections.map((sec, si) => {
                      const secVal     = (SECTION_READINESS[manual.id] || [])[si] ?? null;
                      const secDefault = (SECTION_COMMENTS[manual.id]  || [])[si] ?? null;
                      return (
                        <tr key={`${manual.id}-${si}`} className="st-row-section">
                          <td className="st-cell-section">
                            <span className="st-section-indent" style={{ background: color }} />
                            {sec}
                          </td>
                          <td className="st-cell-resp st-dim">{manual.responsible}</td>
                          <td className="st-cell-prog"><ProgressCell value={secVal} /></td>
                          <td className="st-cell-date st-dim" />
                          <td className="st-cell-ver st-dim" />
                          <td className="st-cell-comment st-dim">
                            <CommentCell
                              value={getComment(`section_${manual.id}_${si}`, secDefault)}
                              onChange={v => handleCommentChange(`section_${manual.id}_${si}`, v)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="st-footer">
          LAVA 2026 — Office Manual V1.01
        </div>
      </div>
    </div>
  );
}
