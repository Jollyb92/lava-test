import { useState } from 'react';

const CHECKLIST = {
  sections: [
    {
      id: 'preboarding',
      roman: 'I',
      title: 'Preboarding',
      subtitle: 'Administrative Vorbereitung',
      focus: 'Infrastrukturelle Betriebsbereitschaft (Abgeschlossen bis T-3)',
      items: [
        { id: 'pre-1', task: 'IT-Infrastruktur beantragt (Login/E-Mail)',         responsible: 'HR/Admin', note: 'via IT STR' },
        { id: 'pre-2', task: 'Poolarserver Zugriff',                               responsible: 'HR',       note: 'Gemäß Rollenprofil' },
        { id: 'pre-3', task: 'Hardware-Provisionierung & Software-Setup',          responsible: 'IT BER',   note: 'In Absprache mit Direktoren' },
        { id: 'pre-4', task: 'Strategische Platzierung & Setup',                   responsible: '—',        note: '' },
        { id: 'pre-5', task: 'Zugriffsberechtigen',                                responsible: 'HR',       note: 'Gemäß Rollenprofil (Server, Projekt-Files, Lizenzen)' },
        { id: 'pre-6', task: 'Briefing des Mentors (Buddy)',                       responsible: 'Admin',    note: 'Terminbestätigung erfolgt' },
        { id: 'pre-7', task: 'Bereitstellung Office Assets',                       responsible: 'Admin',    note: 'Schlüssel, Office Manual' },
      ],
    },
    {
      id: 'tag1',
      roman: 'II',
      title: 'Tag 1',
      subtitle: 'Orientierung & Integration',
      focus: 'Unternehmenskultur und administrative Pflichten',
      items: [
        { id: 'tag-1', task: 'Begrüßung: Rundgang & Vorstellung Team',             responsible: 'Admin',  note: 'Inkl. Safety-Check (Alarm)' },
        { id: 'tag-2', task: 'Compliance: Übergabe Personalbogen',                 responsible: 'HR',     note: 'Weitergabe an Lohnbuchhaltung' },
        { id: 'tag-3', task: 'IT-Transfer: Übergabe Hardware & Login',             responsible: 'IT BER', note: 'Equipment Agreement' },
        { id: 'tag-4', task: 'Governance: Aushändigung Office Manual',             responsible: 'Admin',  note: 'Kenntnisnahme Regeln' },
        { id: 'tag-5', task: 'Kultur: Gemeinsames Mittagessen mit Buddy',          responsible: 'Buddy',  note: 'Soziale Einbindung' },
        { id: 'tag-6', task: 'Operativer Start: Briefing zur ersten Aufgabe',      responsible: 'Lead',   note: 'Fachliche Zuweisung' },
      ],
    },
    {
      id: 'woche1',
      roman: 'III',
      title: 'Woche 1',
      subtitle: 'Operative Befähigung',
      focus: 'Methodik, Standards und Reporting',
      items: [
        { id: 'w1-1', task: 'Zeiterfassung: Poolarserver Timesheets',              responsible: 'Buddy', note: 'Tägliche Erfassung' },
        { id: 'w1-2', task: 'Datenmanagement: Serverstruktur & Naming',            responsible: 'Buddy', note: 'Versionierung/Archivierung' },
        { id: 'w1-3', task: 'HR-Prozesse: Urlaub, Krankheit',                     responsible: 'Admin', note: 'Antragswesen' },
        { id: 'w1-4', task: 'Sicherheit: Einweisung FabLab',                      responsible: 'Buddy', note: 'Autorisierung erforderlich' },
        { id: 'w1-5', task: 'Review T+7: Erstes Statusgespräch',                  responsible: 'Lead',  note: 'Bedarfsklärung' },
      ],
    },
    {
      id: 'probezeit',
      roman: 'IV',
      title: 'Probezeit',
      subtitle: 'Performance Monitoring',
      focus: 'Strukturierte Leistungsentwicklung und Feedback (Monat 1, 3 und 5)',
      items: [
        { id: 'pb-1', task: 'Monat 1 — Onboarding-Status & Zielklarheit',         responsible: '', note: '' },
        { id: 'pb-2', task: 'Monat 3 — Kompetenzcheck & Leistungsabgleich',       responsible: '', note: '' },
        { id: 'pb-3', task: 'Monat 5 — Finale Entscheidung Probezeit',            responsible: '', note: '' },
      ],
    },
  ],
};

const ALL_ITEMS = CHECKLIST.sections.flatMap(s => s.items);

export default function OnboardingChecklist({ onClose }) {
  const [personal, setPersonal] = useState({ name: '', position: '', startdate: '', buddy: '' });
  const [checked,  setChecked]  = useState(new Set());
  const [dates,    setDates]    = useState({});
  const [signDate, setSignDate] = useState('');

  function toggleCheck(id) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function setField(key, val) { setPersonal(p => ({ ...p, [key]: val })); }
  function setDate(id, val)   { setDates(d => ({ ...d, [id]: val })); }

  const total     = ALL_ITEMS.length;
  const completed = ALL_ITEMS.filter(i => checked.has(i.id)).length;
  const pct       = Math.round((completed / total) * 100);

  // ── Email ──────────────────────────────────────────────────────────────────
  function handleEmail() {
    const lines = [
      'ONBOARDING CHECKLIST — LAVA BERLIN 2026',
      '════════════════════════════════════════',
      '',
      'PERSONALDATEN',
      `Name:       ${personal.name}`,
      `Position:   ${personal.position}`,
      `Startdatum: ${personal.startdate}`,
      `Buddy:      ${personal.buddy}`,
      '',
    ];
    for (const sec of CHECKLIST.sections) {
      lines.push(`${sec.roman}. ${sec.title.toUpperCase()} | ${sec.subtitle.toUpperCase()}`);
      lines.push(`Fokus: ${sec.focus}`);
      for (const item of sec.items) {
        const tick  = checked.has(item.id) ? '[✓]' : '[ ]';
        const extra = sec.id === 'probezeit' && dates[item.id] ? ` — ${dates[item.id]}` : '';
        lines.push(`${tick} ${item.task}${item.responsible ? ` (${item.responsible})` : ''}${extra}`);
      }
      lines.push('');
    }
    lines.push('V. ABSCHLUSS');
    lines.push('Hiermit wird der ordnungsgemäße Abschluss des Onboarding-Prozesses bestätigt.');
    lines.push(`Ort / Datum: ${signDate}`);

    const subject = encodeURIComponent(`Onboarding Checklist — ${personal.name || 'LAVA'}`);
    const body    = encodeURIComponent(lines.join('\n'));
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  // ── PDF via print window ───────────────────────────────────────────────────
  function handlePrint() {
    const rows = sec => sec.items.map(item => `
      <tr>
        <td class="status">${checked.has(item.id) ? '✓' : ''}</td>
        <td>${item.task}</td>
        <td>${item.responsible || ''}</td>
        <td>${item.note || ''}</td>
        ${sec.id === 'probezeit' ? `<td>${dates[item.id] || ''}</td>` : ''}
      </tr>`).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Onboarding Checklist — ${personal.name || 'LAVA'}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: #111; padding: 28px 40px; }
  h1 { font-size: 15px; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 2px; }
  .meta { font-size: 9px; color: #888; margin-bottom: 20px; }
  .personal { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 32px; margin-bottom: 20px; padding-top: 14px; border-top: 1px solid #eee; }
  .pf { display: flex; gap: 8px; align-items: baseline; }
  .pl { font-weight: 700; font-size: 9px; text-transform: uppercase; letter-spacing: .04em; color: #555; min-width: 80px; }
  .pv { border-bottom: 1px solid #bbb; flex: 1; padding-bottom: 1px; font-size: 11px; }
  .sec { margin-bottom: 16px; }
  .sh { background: #1a1a1a; color: #fff; padding: 5px 9px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; }
  .sf { background: #f5f5f5; padding: 3px 9px; font-size: 8px; color: #666; font-style: italic; margin-bottom: 0; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f0f0f0; font-size: 8px; text-transform: uppercase; letter-spacing: .04em; padding: 4px 7px; text-align: left; border: 1px solid #ddd; }
  td { padding: 4px 7px; border: 1px solid #eee; font-size: 9.5px; vertical-align: top; }
  td.status { width: 28px; text-align: center; font-size: 12px; }
  .abs { margin-top: 20px; padding: 14px; border: 1px solid #ddd; }
  .abs-title { font-weight: 700; font-size: 11px; margin-bottom: 6px; }
  .abs-text { font-size: 9.5px; color: #555; font-style: italic; margin-bottom: 10px; }
  .sign { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .sign-f { font-size: 9px; color: #555; border-bottom: 1px solid #999; padding-bottom: 2px; }
  @page { margin: 15mm; }
</style></head><body>
<h1>Onboarding Checklist</h1>
<div class="meta">LAVA Berlin 2026 — Human Resources &amp; Personal Management</div>
<div class="personal">
  <div class="pf"><span class="pl">Name</span><span class="pv">${personal.name}</span></div>
  <div class="pf"><span class="pl">Position</span><span class="pv">${personal.position}</span></div>
  <div class="pf"><span class="pl">Startdatum</span><span class="pv">${personal.startdate}</span></div>
  <div class="pf"><span class="pl">Buddy</span><span class="pv">${personal.buddy}</span></div>
</div>
${CHECKLIST.sections.map(sec => `
<div class="sec">
  <div class="sh">${sec.roman}. ${sec.title} | ${sec.subtitle}</div>
  <div class="sf">Fokus: ${sec.focus}</div>
  <table>
    <thead><tr>
      <th>Status</th><th>Aktivität</th><th>Verantwortlich</th><th>Bemerkung</th>
      ${sec.id === 'probezeit' ? '<th>Geplanter Termin</th>' : ''}
    </tr></thead>
    <tbody>${rows(sec)}</tbody>
  </table>
</div>`).join('')}
<div class="abs">
  <div class="abs-title">V. Abschluss</div>
  <div class="abs-text">Hiermit wird der ordnungsgemäße Abschluss des Onboarding-Prozesses bestätigt.</div>
  <div class="sign">
    <div class="sign-f">Ort / Datum: ${signDate}</div>
    <div class="sign-f">Unterschrift: ___________________________</div>
  </div>
</div>
</body></html>`;

    const w = window.open('', '_blank', 'width=820,height=700');
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="checklist-panel">
      {/* Header */}
      <div className="cl-header">
        <div>
          <div className="cl-title">Onboarding Checklist</div>
          <div className="cl-subtitle">HR &amp; Personnel Management</div>
        </div>
        <button className="cl-close" onClick={onClose} title="Close">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Progress */}
      <div className="cl-progress-track">
        <div className="cl-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="cl-progress-label">{completed}/{total} items complete</div>

      <div className="cl-body">
        {/* Personal data */}
        <div className="cl-section">
          <div className="cl-section-head">Personaldaten</div>
          <div className="cl-personal-grid">
            {[
              { label: 'Name',       key: 'name',      ph: 'Full name'     },
              { label: 'Position',   key: 'position',  ph: 'Job title'     },
              { label: 'Startdatum', key: 'startdate', ph: 'DD.MM.YYYY'    },
              { label: 'Buddy',      key: 'buddy',     ph: 'Buddy name'    },
            ].map(f => (
              <label key={f.key} className="cl-field">
                <span className="cl-field-label">{f.label}</span>
                <input className="cl-field-input" type="text" placeholder={f.ph}
                  value={personal[f.key]} onChange={e => setField(f.key, e.target.value)} />
              </label>
            ))}
          </div>
        </div>

        {/* Checklist sections */}
        {CHECKLIST.sections.map(sec => (
          <div key={sec.id} className="cl-section">
            <div className="cl-section-head">
              <span className="cl-roman">{sec.roman}.</span> {sec.title}
              <span className="cl-section-sub"> — {sec.subtitle}</span>
            </div>
            <div className="cl-focus">{sec.focus}</div>

            {sec.items.map(item => (
              <div key={item.id}
                className={`cl-item${checked.has(item.id) ? ' cl-item--done' : ''}`}
                onClick={() => toggleCheck(item.id)}>
                <div className={`cl-checkbox${checked.has(item.id) ? ' cl-checkbox--on' : ''}`}>
                  {checked.has(item.id) && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.2 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="cl-item-body">
                  <div className="cl-item-task">{item.task}</div>
                  {(item.responsible || item.note) && (
                    <div className="cl-item-meta">
                      {item.responsible && item.responsible !== '—' && (
                        <span className="cl-resp">{item.responsible}</span>
                      )}
                      {item.note && <span className="cl-note">{item.note}</span>}
                    </div>
                  )}
                  {sec.id === 'probezeit' && (
                    <input className="cl-date-input" type="text"
                      placeholder="Geplanter Termin (DD.MM.YYYY)"
                      value={dates[item.id] || ''}
                      onClick={e => e.stopPropagation()}
                      onChange={e => setDate(item.id, e.target.value)} />
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Abschluss */}
        <div className="cl-section">
          <div className="cl-section-head">V. Abschluss</div>
          <p className="cl-abschluss-text">
            Hiermit wird der ordnungsgemäße Abschluss des Onboarding-Prozesses bestätigt.
          </p>
          <label className="cl-field">
            <span className="cl-field-label">Ort / Datum</span>
            <input className="cl-field-input" type="text" placeholder="Berlin, DD.MM.YYYY"
              value={signDate} onChange={e => setSignDate(e.target.value)} />
          </label>
          <label className="cl-field" style={{ marginTop: 10 }}>
            <span className="cl-field-label">Unterschrift</span>
            <div className="cl-sig-line" />
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="cl-actions">
        <button className="cl-btn cl-btn--outline" onClick={handleEmail}>
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
            <rect x="1" y="1" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M1 3.5L7 7.5L13 3.5" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
          Send by email
        </button>
        <button className="cl-btn cl-btn--primary" onClick={handlePrint}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="3" y="1" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            <rect x="3" y="8" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M3 5H11V10H3V5Z" stroke="currentColor" strokeWidth="1.3"/>
            <circle cx="10" cy="7.5" r="0.8" fill="currentColor"/>
          </svg>
          Export PDF
        </button>
      </div>
    </div>
  );
}
