import { useState } from 'react';

const PHASES = [
  {
    id: 'preboarding',
    roman: 'I',
    title: 'Pre-boarding',
    subtitle: 'Administrative preparation',
    focus: 'Infrastructure & operational readiness — completed by Day −3',
    color: '#3B82F6',
    colorLight: '#EFF6FF',
    deadline: 'By Day −3',
    items: [
      { id: 'pre-1', task: 'IT infrastructure requested (login / email)',          responsible: 'HR / Admin',  note: 'via IT Stuttgart' },
      { id: 'pre-2', task: 'Poolarserver access configured',                       responsible: 'HR',          note: 'As per role profile' },
      { id: 'pre-3', task: 'Hardware provisioning & software setup',               responsible: 'IT Berlin',   note: 'In consultation with directors' },
      { id: 'pre-4', task: 'Workstation placement & setup',                        responsible: 'Admin',       note: '' },
      { id: 'pre-5', task: 'Access permissions granted',                           responsible: 'HR',          note: 'Server, project files, licences' },
      { id: 'pre-6', task: 'Buddy / mentor briefed',                              responsible: 'Admin',       note: 'Appointment confirmed' },
      { id: 'pre-7', task: 'Office assets prepared',                               responsible: 'Admin',       note: 'Keys, Office Manual' },
    ],
  },
  {
    id: 'dayone',
    roman: 'II',
    title: 'Day One',
    subtitle: 'Orientation & integration',
    focus: 'Company culture and administrative obligations',
    color: '#F59E0B',
    colorLight: '#FFFBEB',
    deadline: 'Day 1',
    items: [
      { id: 'd1-1', task: 'Welcome: office tour & team introductions',             responsible: 'Admin',       note: 'Incl. safety check (alarm code)' },
      { id: 'd1-2', task: 'Compliance: personnel form handover',                   responsible: 'HR',          note: 'Forwarded to payroll' },
      { id: 'd1-3', task: 'IT handover: hardware & login credentials',             responsible: 'IT Berlin',   note: 'Equipment agreement signed' },
      { id: 'd1-4', task: 'Governance: Office Manual issued',                      responsible: 'Admin',       note: 'Rules acknowledged' },
      { id: 'd1-5', task: 'Culture: team lunch with buddy',                        responsible: 'Buddy',       note: 'Social integration' },
      { id: 'd1-6', task: 'Operational start: first task briefing',                responsible: 'Lead',        note: 'Task assignment' },
    ],
  },
  {
    id: 'weekone',
    roman: 'III',
    title: 'Week One',
    subtitle: 'Operational enablement',
    focus: 'Methodology, standards and reporting',
    color: '#14B8A6',
    colorLight: '#F0FDFA',
    deadline: 'Days 2–7',
    items: [
      { id: 'w1-1', task: 'Time tracking: Poolarserver timesheets',                responsible: 'Buddy',       note: 'Daily logging' },
      { id: 'w1-2', task: 'Data management: server structure & naming',            responsible: 'Buddy',       note: 'Versioning / archiving' },
      { id: 'w1-3', task: 'HR processes: leave and sick-day procedures',           responsible: 'Admin',       note: 'Request process' },
      { id: 'w1-4', task: 'Safety: FabLab induction',                             responsible: 'Buddy',       note: 'Authorisation required' },
      { id: 'w1-5', task: 'Review T+7: first check-in with lead',                 responsible: 'Lead',        note: 'Needs assessment' },
    ],
  },
  {
    id: 'probation',
    roman: 'IV',
    title: 'Probation Period',
    subtitle: 'Performance monitoring',
    focus: 'Structured performance development and feedback — months 1, 3 and 5',
    color: '#8B5CF6',
    colorLight: '#F5F3FF',
    deadline: 'Month 1 → 3 → 5',
    items: [
      { id: 'pb-1', task: 'Month 1 — Onboarding status & goal clarity',           responsible: 'Lead / HR',   note: '' },
      { id: 'pb-2', task: 'Month 3 — Competency check & performance review',      responsible: 'Lead / HR',   note: '' },
      { id: 'pb-3', task: 'Month 5 — Final probation decision',                   responsible: 'Lead / HR',   note: '' },
    ],
    hasDate: true,
  },
];

const ALL_ITEMS = PHASES.flatMap(p => p.items);

function PhaseIcon({ roman, color }) {
  return (
    <div className="cl-phase-icon" style={{ background: color }}>
      {roman}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function OnboardingChecklist({ onClose }) {
  const [personal, setPersonal] = useState({ name: '', position: '', startDate: '', buddy: '' });
  const [checked,  setChecked]  = useState(new Set());
  const [dates,    setDates]    = useState({});
  const [signDate, setSignDate] = useState('');
  const [openPhase, setOpenPhase] = useState(null);

  function toggleCheck(id) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function setField(key, val) { setPersonal(p => ({ ...p, [key]: val })); }
  function setDate(id, val)   { setDates(d => ({ ...d, [id]: val })); }
  function resetAll()         { setChecked(new Set()); setDates({}); }

  const total     = ALL_ITEMS.length;
  const completed = ALL_ITEMS.filter(i => checked.has(i.id)).length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  // ── Email export ───────────────────────────────────────────────────────────
  function handleEmail() {
    const lines = [
      'ONBOARDING CHECKLIST — LAVA 2026',
      '══════════════════════════════════════════',
      '',
      'PERSONAL DETAILS',
      `Name:        ${personal.name}`,
      `Position:    ${personal.position}`,
      `Start Date:  ${personal.startDate}`,
      `Buddy:       ${personal.buddy}`,
      '',
      `Progress: ${completed}/${total} items complete (${pct}%)`,
      '',
    ];
    for (const phase of PHASES) {
      lines.push(`${phase.roman}. ${phase.title.toUpperCase()} | ${phase.subtitle.toUpperCase()}`);
      lines.push(`Focus: ${phase.focus}`);
      for (const item of phase.items) {
        const tick  = checked.has(item.id) ? '[✓]' : '[ ]';
        const date  = phase.hasDate && dates[item.id] ? ` | Scheduled: ${dates[item.id]}` : '';
        lines.push(`${tick} ${item.task}${item.responsible ? ` — ${item.responsible}` : ''}${date}`);
      }
      lines.push('');
    }
    lines.push('V. COMPLETION');
    lines.push('The successful completion of the onboarding process is hereby confirmed.');
    lines.push(`Location / Date: ${signDate}`);

    const subject = encodeURIComponent(`Onboarding Checklist — ${personal.name || 'LAVA'}`);
    const body    = encodeURIComponent(lines.join('\n'));
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  // ── PDF via print window ───────────────────────────────────────────────────
  function handlePrint() {
    const phaseColors = { preboarding: '#3B82F6', dayone: '#F59E0B', weekone: '#14B8A6', probation: '#8B5CF6' };

    const tableRows = (phase) => phase.items.map(item => `
      <tr>
        <td class="status">${checked.has(item.id) ? '<span class="tick">✓</span>' : ''}</td>
        <td class="task">${item.task}</td>
        <td class="resp">${item.responsible || ''}</td>
        <td class="note">${item.note || ''}</td>
        ${phase.hasDate ? `<td class="date">${dates[item.id] || ''}</td>` : ''}
      </tr>`).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Onboarding Checklist — ${personal.name || 'LAVA'}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 10px; color: #111; padding: 28px 40px; }
  .doc-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 14px; border-bottom: 2px solid #111; margin-bottom: 18px; }
  h1 { font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
  .meta { font-size: 9px; color: #888; margin-top: 4px; }
  .progress-bar { height: 5px; background: #eee; border-radius: 3px; margin: 10px 0 4px; }
  .progress-fill { height: 100%; background: #22C55E; border-radius: 3px; width: ${pct}%; }
  .progress-label { font-size: 9px; color: #555; }
  .personal { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 40px; margin-bottom: 22px; padding: 14px; background: #f9f9f9; border: 1px solid #eee; }
  .pf { display: flex; gap: 10px; align-items: baseline; }
  .pl { font-weight: 700; font-size: 8.5px; text-transform: uppercase; letter-spacing: .05em; color: #555; min-width: 80px; }
  .pv { border-bottom: 1px solid #bbb; flex: 1; padding-bottom: 2px; font-size: 11px; min-height: 16px; }
  .sec { margin-bottom: 18px; }
  .sh { display: flex; align-items: center; gap: 8px; padding: 6px 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; color: #fff; }
  .sh-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.5); }
  .sf { padding: 4px 10px; font-size: 8.5px; color: #666; font-style: italic; background: #f7f7f7; border: 1px solid #eee; border-top: none; margin-bottom: 0; }
  table { width: 100%; border-collapse: collapse; margin-top: 0; }
  th { background: #f0f0f0; font-size: 8px; text-transform: uppercase; letter-spacing: .05em; padding: 5px 8px; text-align: left; border: 1px solid #ddd; color: #444; }
  td { padding: 5px 8px; border: 1px solid #eee; font-size: 9.5px; vertical-align: top; }
  td.status { width: 26px; text-align: center; }
  .tick { font-size: 13px; color: #22C55E; font-weight: 700; }
  td.task { font-weight: 600; }
  td.resp { color: #555; font-size: 9px; }
  td.note { color: #888; font-style: italic; font-size: 9px; }
  td.date { font-size: 9px; min-width: 90px; }
  .completion { margin-top: 22px; padding: 14px; border: 1px solid #ddd; background: #fafafa; }
  .ct { font-weight: 800; font-size: 11px; margin-bottom: 6px; }
  .ci { font-size: 9.5px; color: #555; font-style: italic; margin-bottom: 14px; line-height: 1.5; }
  .sign { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
  .sf2 { font-size: 9px; color: #555; border-bottom: 1px solid #999; padding-bottom: 3px; }
  @page { margin: 14mm; }
</style></head><body>
<div class="doc-header">
  <div>
    <h1>Onboarding Checklist</h1>
    <div class="meta">LAVA 2026 — Human Resources &amp; Personnel Management</div>
  </div>
  <div style="text-align:right">
    <div class="progress-bar"><div class="progress-fill"></div></div>
    <div class="progress-label">${completed} / ${total} items complete (${pct}%)</div>
  </div>
</div>
<div class="personal">
  <div class="pf"><span class="pl">Name</span><span class="pv">${personal.name}</span></div>
  <div class="pf"><span class="pl">Position</span><span class="pv">${personal.position}</span></div>
  <div class="pf"><span class="pl">Start Date</span><span class="pv">${personal.startDate}</span></div>
  <div class="pf"><span class="pl">Buddy</span><span class="pv">${personal.buddy}</span></div>
</div>
${PHASES.map(phase => `
<div class="sec">
  <div class="sh" style="background:${phaseColors[phase.id]}">
    <div class="sh-dot"></div>
    ${phase.roman}. ${phase.title} — ${phase.subtitle}
  </div>
  <div class="sf">Focus: ${phase.focus}</div>
  <table>
    <thead><tr>
      <th>✓</th><th>Activity</th><th>Responsible</th><th>Note</th>
      ${phase.hasDate ? '<th>Scheduled Date</th>' : ''}
    </tr></thead>
    <tbody>${tableRows(phase)}</tbody>
  </table>
</div>`).join('')}
<div class="completion">
  <div class="ct">V. Completion</div>
  <div class="ci">The successful completion of the onboarding process is hereby confirmed.</div>
  <div class="sign">
    <div class="sf2">Location / Date: ${signDate}</div>
    <div class="sf2">Signature: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
  </div>
</div>
</body></html>`;

    const w = window.open('', '_blank', 'width=860,height=720');
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 450);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="cl-reset-btn" onClick={resetAll} title="Reset all checkboxes">
            Reset
          </button>
          <button className="cl-close" onClick={onClose} title="Close">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="cl-progress-wrap">
        <div className="cl-progress-track">
          <div className="cl-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="cl-progress-label">
          <span style={{ fontWeight: 700, color: pct === 100 ? '#22C55E' : '#374151' }}>{completed}/{total}</span>
          &ensp;items complete&ensp;
          <span className="cl-pct-badge" style={{ background: pct === 100 ? '#22C55E' : '#E5E7EB', color: pct === 100 ? '#fff' : '#6B7280' }}>
            {pct}%
          </span>
        </div>
      </div>

      <div className="cl-body">

        {/* Personal details */}
        <div className="cl-section cl-section--personal">
          <div className="cl-section-head" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="cl-phase-dot" style={{ background: '#6B7280' }} />
            Personal Details
          </div>
          <div className="cl-personal-grid">
            {[
              { label: 'Name',       key: 'name',      ph: 'Full name'     },
              { label: 'Position',   key: 'position',  ph: 'Job title'     },
              { label: 'Start Date', key: 'startDate', ph: 'DD.MM.YYYY'    },
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

        {/* Phases */}
        {PHASES.map(phase => {
          const phaseItems  = phase.items;
          const phaseDone   = phaseItems.filter(i => checked.has(i.id)).length;
          const phaseTotal  = phaseItems.length;
          const phasePct    = Math.round((phaseDone / phaseTotal) * 100);
          const allDone     = phaseDone === phaseTotal;
          const isOpen      = openPhase === phase.id || openPhase === null;

          return (
            <div key={phase.id} className="cl-section cl-section--phase"
              style={{ borderLeft: `3px solid ${phase.color}` }}>

              {/* Phase header — clickable to collapse */}
              <button className="cl-phase-header" onClick={() => setOpenPhase(p => p === phase.id ? null : phase.id)}>
                <PhaseIcon roman={phase.roman} color={phase.color} />
                <div className="cl-phase-header-text">
                  <div className="cl-phase-title">{phase.title}</div>
                  <div className="cl-phase-subtitle">{phase.subtitle}</div>
                </div>
                <div className="cl-phase-header-right">
                  <div className="cl-phase-badge"
                    style={{ background: allDone ? '#22C55E' : phase.colorLight, color: allDone ? '#fff' : phase.color }}>
                    {phaseDone}/{phaseTotal}
                  </div>
                  <svg className={`cl-phase-chevron${isOpen ? ' cl-phase-chevron--open' : ''}`}
                    width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>

              {isOpen && (
                <>
                  <div className="cl-focus" style={{ marginTop: 4 }}>
                    <span className="cl-deadline-chip" style={{ background: phase.colorLight, color: phase.color }}>
                      {phase.deadline}
                    </span>
                    {phase.focus}
                  </div>

                  {phaseItems.map(item => (
                    <div key={item.id}
                      className={`cl-item${checked.has(item.id) ? ' cl-item--done' : ''}`}
                      onClick={() => toggleCheck(item.id)}>
                      <div className={`cl-checkbox${checked.has(item.id) ? ' cl-checkbox--on' : ''}`}
                        style={checked.has(item.id) ? { background: phase.color, borderColor: phase.color } : {}}>
                        {checked.has(item.id) && <CheckIcon />}
                      </div>
                      <div className="cl-item-body">
                        <div className="cl-item-task">{item.task}</div>
                        {(item.responsible || item.note) && (
                          <div className="cl-item-meta">
                            {item.responsible && (
                              <span className="cl-resp" style={{ background: phase.color }}>{item.responsible}</span>
                            )}
                            {item.note && <span className="cl-note">{item.note}</span>}
                          </div>
                        )}
                        {phase.hasDate && (
                          <input className="cl-date-input" type="text"
                            placeholder="Scheduled date (DD.MM.YYYY)"
                            value={dates[item.id] || ''}
                            onClick={e => e.stopPropagation()}
                            onChange={e => setDate(item.id, e.target.value)} />
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          );
        })}

        {/* Completion */}
        <div className="cl-section cl-section--completion">
          <div className="cl-section-head" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="cl-phase-dot" style={{ background: '#22C55E' }} />
            V. Completion
          </div>
          <p className="cl-abschluss-text">
            The successful completion of the onboarding process is hereby confirmed.
          </p>
          <label className="cl-field">
            <span className="cl-field-label">Location / Date</span>
            <input className="cl-field-input" type="text" placeholder="Berlin, DD.MM.YYYY"
              value={signDate} onChange={e => setSignDate(e.target.value)} />
          </label>
          <label className="cl-field" style={{ marginTop: 12 }}>
            <span className="cl-field-label">Signature</span>
            <div className="cl-sig-line" />
          </label>
        </div>

      </div>

      {/* Actions */}
      <div className="cl-actions">
        <button className="cl-btn cl-btn--outline" onClick={handleEmail}>
          <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
            <rect x="1" y="1" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M1 3.5L7 7L13 3.5" stroke="currentColor" strokeWidth="1.3"/>
          </svg>
          Send by email
        </button>
        <button className="cl-btn cl-btn--primary" onClick={handlePrint}>
          <svg width="13" height="14" viewBox="0 0 13 14" fill="none">
            <path d="M3.5 1H9.5V4.5H3.5V1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            <path d="M3.5 9H9.5V13H3.5V9Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            <path d="M1 4.5H12V9.5H1V4.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            <circle cx="9.5" cy="7" r="0.8" fill="currentColor"/>
          </svg>
          Export / Print PDF
        </button>
      </div>
    </div>
  );
}
