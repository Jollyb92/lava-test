// LAVA Office Manual — full content data
import rawDetailPages from './detailPages.json';

export const COLORS = {
  bg: '#FFFFFF',
  center: '#B3F400',
  centerStroke: '#00FF00',
  cultural: '#1D9E75',
  culturalSub: '#5DCAA5',
  design: '#5B3A8A',
  designSub: '#9B7BC4',
  bidding: '#D4652F',
  biddingSub: '#F0997B',
  communication: '#1B4080',
  communicationSub: '#5B80C0',
  qems: '#1A5A4A',
  ppm: '#8B3F1C',
  ppmSub: '#C07A5A',
  safety: '#8B2D2D',
  safetySub: '#C07878',
  guides: '#3D3D3D',
  live: '#1B3B6B',
  officeSub: '#C8F040',
  white: '#FFFFFF',
  dark: '#1a1a1a',
  isoGreen: '#00FF00',
  linkedGreen: '#00BB00',
};

export const READINESS = {
  qems: 100,
  ppm: 100,
  safety: 100,
  office: 100,
  cultural: 20,
  design: 60,
  bidding: 80,
  communication: 40,
  guides: 20,
  live: 10,
};

// Diagram node definitions
// Canvas 1200×780, center (600,390)
// Design top-center; Cultural upper-left; PPM upper-right (outer); Bidding/Comm lower
export const nodes = [
  // ── Center ──────────────────────────────────────────────────────────────
  {
    id: 'center',
    label: 'OFFICE MANUAL\nBERLIN 2026',
    color: COLORS.center,
    textColor: COLORS.dark,
    strokeColor: COLORS.centerStroke,
    radius: 80,
    x: 600, y: 390,
    clickTarget: '/toc',
    layer: 0,
  },

  // ── Office Manual sub-nodes (Parts A–G) r=135 from center (600,390) ────────
  // Distributed at 15°,50°,120°,160°,200°,305°,340° — avoids Design(270°) & WorkSafety(90°) zones
  { id: 'off-a', label: 'Who We\nAre',        color: COLORS.officeSub, textColor: COLORS.dark, radius: 28, x: 732, y: 472, layer: 2, parent: 'center', clickTarget: '/toc#part-a', connectionType: 'dotted' },
  { id: 'off-b', label: 'Working\nHere',      color: COLORS.officeSub, textColor: COLORS.dark, radius: 28, x: 655, y: 500, layer: 2, parent: 'center', clickTarget: '/toc#part-b', connectionType: 'dotted' },
  { id: 'off-c', label: 'The\nOffice',        color: COLORS.officeSub, textColor: COLORS.dark, radius: 28, x: 533, y: 507, layer: 2, parent: 'center', clickTarget: '/toc#part-c', connectionType: 'dotted' },
  { id: 'off-d', label: 'Safety &\nEnviron.', color: COLORS.officeSub, textColor: COLORS.dark, radius: 28, x: 470, y: 397, layer: 2, parent: 'center', clickTarget: '/toc#part-d', connectionType: 'dotted' },
  { id: 'off-e', label: 'How We\nWork',       color: COLORS.officeSub, textColor: COLORS.dark, radius: 28, x: 535, y: 277, layer: 2, parent: 'center', clickTarget: '/toc#part-e', connectionType: 'dotted' },
  { id: 'off-f', label: 'Connect',            color: COLORS.officeSub, textColor: COLORS.dark, radius: 28, x: 677, y: 279, layer: 2, parent: 'center', clickTarget: '/toc#part-f', connectionType: 'dotted' },
  { id: 'off-g', label: 'Knowledge\n& Growth', color: COLORS.officeSub, textColor: COLORS.dark, radius: 28, x: 733, y: 367, layer: 2, parent: 'center', clickTarget: '/toc#part-g', connectionType: 'dotted' },

  // ── Tier 1: Sibling Manuals (solid lines to center) ─────────────────────
  {
    id: 'cultural',
    label: 'CULTURAL\nMANUAL',
    color: COLORS.cultural,
    textColor: COLORS.white,
    radius: 52,
    x: 370, y: 265,
    clickTarget: '/detail/cultural',
    layer: 1,
    readiness: READINESS.cultural,
    connectionType: 'solid',
  },
  {
    id: 'design',
    label: 'DESIGN\nMANUAL',
    color: COLORS.design,
    textColor: COLORS.white,
    radius: 52,
    x: 600, y: 195,
    clickTarget: '/detail/design',
    layer: 1,
    readiness: READINESS.design,
    connectionType: 'solid',
  },
  {
    id: 'bidding',
    label: 'BIDDING\nMANUAL',
    color: COLORS.bidding,
    textColor: COLORS.white,
    radius: 52,
    x: 840, y: 475,
    clickTarget: '/detail/bidding',
    layer: 1,
    readiness: READINESS.bidding,
    connectionType: 'solid',
  },
  {
    id: 'communication',
    label: 'COMMUNICATION\nMANUAL',
    color: COLORS.communication,
    textColor: COLORS.white,
    radius: 52,
    x: 315, y: 480,
    clickTarget: '/detail/communication',
    layer: 1,
    readiness: READINESS.communication,
    connectionType: 'solid',
  },

  // ── Cultural sub-nodes — r=110, angles 175°→274° ─────────────────────────
  { id: 'cult-history',   label: 'LAVA Story\n& History',        color: COLORS.culturalSub, textColor: COLORS.dark, radius: 28, x: 260, y: 275, layer: 2, parent: 'cultural', clickTarget: '/detail/cultural', connectionType: 'dotted' },
  { id: 'cult-knowledge', label: 'Knowledge\nSharing',           color: COLORS.culturalSub, textColor: COLORS.dark, radius: 28, x: 273, y: 213, layer: 2, parent: 'cultural', clickTarget: '/detail/cultural', connectionType: 'dotted' },
  { id: 'cult-ethics',    label: 'Team Ethics\n& Ground\nRules', color: COLORS.culturalSub, textColor: COLORS.dark, radius: 28, x: 317, y: 169, layer: 2, parent: 'cultural', clickTarget: '/detail/cultural', connectionType: 'dotted' },
  { id: 'cult-studio',    label: 'Studio\nCulture\n& Rituals',   color: COLORS.culturalSub, textColor: COLORS.dark, radius: 28, x: 378, y: 155, layer: 2, parent: 'cultural', clickTarget: '/detail/cultural', connectionType: 'dotted' },

  // ── Design sub-nodes — r=110, angles 214°→346° ───────────────────────────
  { id: 'des-workflow',    label: 'Design\nWorkflow',               color: COLORS.designSub, textColor: COLORS.dark, radius: 28, x: 509, y: 133, layer: 2, parent: 'design', clickTarget: '/detail/design', connectionType: 'dotted' },
  { id: 'des-philosophy',  label: 'Design\nPhilosophy\nin Practice',color: COLORS.designSub, textColor: COLORS.dark, radius: 28, x: 557, y: 94,  layer: 2, parent: 'design', clickTarget: '/detail/design', connectionType: 'dotted' },
  { id: 'des-templates',   label: 'Templates\n& Standards',        color: COLORS.designSub, textColor: COLORS.dark, radius: 28, x: 619, y: 87,  layer: 2, parent: 'design', clickTarget: '/detail/design', connectionType: 'dotted' },
  { id: 'des-graphic',     label: 'Graphic\nApproach',             color: COLORS.designSub, textColor: COLORS.dark, radius: 28, x: 675, y: 115, layer: 2, parent: 'design', clickTarget: '/detail/design', connectionType: 'dotted' },
  { id: 'des-competition', label: 'Competition\nGuidelines',       color: COLORS.designSub, textColor: COLORS.dark, radius: 28, x: 707, y: 168, layer: 2, parent: 'design', clickTarget: '/detail/design', connectionType: 'dotted' },

  // ── Bidding sub-nodes — r=110, angles 350°→86° ───────────────────────────
  { id: 'bid-proposal',  label: 'Proposal\nProcess',       color: COLORS.biddingSub, textColor: COLORS.dark, radius: 28, x: 948, y: 456, layer: 2, parent: 'bidding', clickTarget: '/detail/bidding', connectionType: 'dotted' },
  { id: 'bid-templates', label: 'Templates\n& Components', color: COLORS.biddingSub, textColor: COLORS.dark, radius: 28, x: 942, y: 516, layer: 2, parent: 'bidding', clickTarget: '/detail/bidding', connectionType: 'dotted' },
  { id: 'bid-scope',     label: 'Scope\n& Fee',            color: COLORS.biddingSub, textColor: COLORS.dark, radius: 28, x: 905, y: 564, layer: 2, parent: 'bidding', clickTarget: '/detail/bidding', connectionType: 'dotted' },
  { id: 'bid-client',    label: 'Client\nEngagement',      color: COLORS.biddingSub, textColor: COLORS.dark, radius: 28, x: 848, y: 585, layer: 2, parent: 'bidding', clickTarget: '/detail/bidding', connectionType: 'dotted' },

  // ── Communication sub-nodes — r=110, angles 100°→260° ────────────────────
  { id: 'comm-document', label: 'Doc &\nPres.\nTemplates',    color: COLORS.communicationSub, textColor: COLORS.dark, radius: 28, x: 296, y: 588, layer: 2, parent: 'communication', clickTarget: '/detail/communication', connectionType: 'dotted' },
  { id: 'comm-external', label: 'External\nComm.\nStandards', color: COLORS.communicationSub, textColor: COLORS.dark, radius: 28, x: 241, y: 562, layer: 2, parent: 'communication', clickTarget: '/detail/communication', connectionType: 'dotted' },
  { id: 'comm-layout',   label: 'Layout\nConventions',        color: COLORS.communicationSub, textColor: COLORS.dark, radius: 28, x: 209, y: 510, layer: 2, parent: 'communication', clickTarget: '/detail/communication', connectionType: 'dotted' },
  { id: 'comm-colour',   label: 'Colour\nRules',              color: COLORS.communicationSub, textColor: COLORS.dark, radius: 28, x: 209, y: 450, layer: 2, parent: 'communication', clickTarget: '/detail/communication', connectionType: 'dotted' },
  { id: 'comm-graphic',  label: 'Graphic\nApproach',          color: COLORS.communicationSub, textColor: COLORS.dark, radius: 28, x: 241, y: 398, layer: 2, parent: 'communication', clickTarget: '/detail/communication', connectionType: 'dotted' },
  { id: 'comm-fonts',    label: 'Fonts',                      color: COLORS.communicationSub, textColor: COLORS.dark, radius: 28, x: 296, y: 372, layer: 2, parent: 'communication', clickTarget: '/detail/communication', connectionType: 'dotted' },

  // ── Tier 3: External Systems ─────────────────────────────────────────────
  {
    id: 'qems',
    label: 'QEMS',
    sublabel: 'ISO 9001/14001\nManagement System',
    color: COLORS.qems,
    textColor: COLORS.white,
    radius: 50,
    x: 85, y: 295,
    clickTarget: '/detail/qems',
    layer: 3,
    readiness: READINESS.qems,
    connectionType: 'dashed',
  },
  {
    id: 'ppm',
    label: 'PROJECT\nMANAGEMENT\nMANUAL',
    color: COLORS.ppm,
    textColor: COLORS.white,
    radius: 50,
    x: 830, y: 265,
    clickTarget: '/detail/ppm',
    layer: 3,
    readiness: READINESS.ppm,
    connectionType: 'dashed',
  },
  // Work Safety — bottom-center, mirroring Design above center
  {
    id: 'worksafety',
    label: 'WORK SAFETY\nMANUAL',
    color: COLORS.safety,
    textColor: COLORS.white,
    radius: 50,
    x: 600, y: 585,
    clickTarget: '/detail/worksafety',
    layer: 3,
    readiness: READINESS.safety,
    connectionType: 'dashed',
  },
  {
    id: 'guides',
    label: 'GUIDES &\nREGISTERS',
    sublabel: 'Appendices A–M',
    color: COLORS.guides,
    textColor: COLORS.white,
    radius: 50,
    x: 1100, y: 430,
    clickTarget: '/detail/guides',
    layer: 3,
    readiness: READINESS.guides,
    connectionType: 'dashed',
  },
  // Live Systems — lower-right, connector threads between Bidding lower subs and WS right sub
  {
    id: 'live',
    label: 'LIVE SYSTEMS\n& TOOLS',
    sublabel: 'Operational Platforms',
    color: COLORS.live,
    textColor: COLORS.white,
    radius: 50,
    x: 940, y: 720,
    clickTarget: '/detail/live',
    layer: 3,
    readiness: READINESS.live,
    connectionType: 'dashed',
  },

  // ── PPM sub-nodes — 4 chapters, r=110, angles 295°→75° ──────────────────
  { id: 'ppm-intro',    label: 'Introduction',          color: COLORS.ppmSub, textColor: COLORS.dark, radius: 28, x: 877, y: 165, layer: 2, parent: 'ppm', clickTarget: '/detail/ppm', connectionType: 'dotted' },
  { id: 'ppm-before',   label: 'Before the\nProject',  color: COLORS.ppmSub, textColor: COLORS.dark, radius: 28, x: 935, y: 231, layer: 2, parent: 'ppm', clickTarget: '/detail/ppm', connectionType: 'dotted' },
  { id: 'ppm-during',   label: 'During the\nProject',  color: COLORS.ppmSub, textColor: COLORS.dark, radius: 28, x: 927, y: 317, layer: 2, parent: 'ppm', clickTarget: '/detail/ppm', connectionType: 'dotted' },
  { id: 'ppm-after',    label: 'After the\nProject',   color: COLORS.ppmSub, textColor: COLORS.dark, radius: 28, x: 859, y: 371, layer: 2, parent: 'ppm', clickTarget: '/detail/ppm', connectionType: 'dotted' },

  // ── Work Safety sub-nodes — r=110, fan below WorkSafety(600,585) ─────────
  { id: 'ws-roles',     label: 'Contacts\n& Roles',         color: COLORS.safetySub, textColor: COLORS.dark, radius: 28, x: 703, y: 623, layer: 2, parent: 'worksafety', clickTarget: '/detail/worksafety', connectionType: 'dotted' },
  { id: 'ws-emergency', label: 'Emergency\nProcedures',     color: COLORS.safetySub, textColor: COLORS.dark, radius: 28, x: 663, y: 675, layer: 2, parent: 'worksafety', clickTarget: '/detail/worksafety', connectionType: 'dotted' },
  { id: 'ws-hazard',    label: 'Hazards &\nPrevention',     color: COLORS.safetySub, textColor: COLORS.dark, radius: 28, x: 600, y: 695, layer: 2, parent: 'worksafety', clickTarget: '/detail/worksafety', connectionType: 'dotted' },
  { id: 'ws-incident',  label: 'Wellbeing\nat Work',        color: COLORS.safetySub, textColor: COLORS.dark, radius: 28, x: 537, y: 675, layer: 2, parent: 'worksafety', clickTarget: '/detail/worksafety', connectionType: 'dotted' },
  { id: 'ws-fablab',    label: 'Your\nWorkspace',           color: COLORS.safetySub, textColor: COLORS.dark, radius: 28, x: 497, y: 623, layer: 2, parent: 'worksafety', clickTarget: '/detail/worksafety', connectionType: 'dotted' },
];

// Connections: [fromId, toId]
export const connections = [
  // Office Manual sub-nodes (dotted)
  ['center', 'off-a'],
  ['center', 'off-b'],
  ['center', 'off-c'],
  ['center', 'off-d'],
  ['center', 'off-e'],
  ['center', 'off-f'],
  ['center', 'off-g'],
  // Center to Tier 1 (solid)
  ['center', 'cultural'],
  ['center', 'design'],
  ['center', 'bidding'],
  ['center', 'communication'],
  // Cultural sub-nodes (dotted)
  ['cultural', 'cult-history'],
  ['cultural', 'cult-ethics'],
  ['cultural', 'cult-studio'],
  ['cultural', 'cult-knowledge'],
  // Design sub-nodes (dotted)
  ['design', 'des-workflow'],
  ['design', 'des-philosophy'],
  ['design', 'des-templates'],
  ['design', 'des-graphic'],
  ['design', 'des-competition'],
  // Bidding sub-nodes (dotted)
  ['bidding', 'bid-proposal'],
  ['bidding', 'bid-templates'],
  ['bidding', 'bid-scope'],
  ['bidding', 'bid-client'],
  // Communication sub-nodes (dotted)
  ['communication', 'comm-fonts'],
  ['communication', 'comm-colour'],
  ['communication', 'comm-layout'],
  ['communication', 'comm-graphic'],
  ['communication', 'comm-external'],
  ['communication', 'comm-document'],
  // Center to Tier 3 (dashed)
  ['center', 'qems'],
  ['center', 'ppm'],
  ['center', 'worksafety'],
  ['center', 'guides'],
  ['center', 'live'],
  // PPM sub-nodes (dotted)
  ['ppm', 'ppm-intro'],
  ['ppm', 'ppm-before'],
  ['ppm', 'ppm-during'],
  ['ppm', 'ppm-after'],
  // Work Safety sub-nodes (dotted)
  ['worksafety', 'ws-roles'],
  ['worksafety', 'ws-emergency'],
  ['worksafety', 'ws-hazard'],
  ['worksafety', 'ws-incident'],
  ['worksafety', 'ws-fablab'],
];

// Detail page content — source of truth is detailPages.json; edit that file to update content
function resolveDetailPages(raw) {
  const resolved = {};
  for (const [key, page] of Object.entries(raw)) {
    resolved[key] = {
      ...page,
      color: COLORS[page.colorKey],
      ...(page.textColorKey ? { textColor: COLORS[page.textColorKey] } : {}),
    };
  }
  return resolved;
}
export const detailPages = resolveDetailPages(rawDetailPages);


export const tocData = {
  parts: [
    {
      label: 'Front Matter',
      sections: [
        { id: 'doc-control', label: 'Document Control' },
        { id: 'involved', label: 'Involved Parties' },
        { id: 'glossary', label: 'Glossary' },
        { id: 'intro', label: 'Introduction — How to Use This Manual Family' },
        { id: 'toc', label: 'Table of Contents' },
      ],
    },
    {
      label: 'Part A — Who We Are',
      sections: [
        { id: 'a1', label: 'A.1 LAVA World' },
        { id: 'a2', label: 'A.2 Values & General Rules' },
      ],
    },
    {
      label: 'Part B — Working Here',
      sections: [
        { id: 'b1', label: 'B.1 Onboarding & First Days' },
        { id: 'b2', label: 'B.2 A Standard Day at LAVA' },
        { id: 'b3', label: 'B.3 Time Off & Absence' },
        { id: 'b4', label: 'B.4 Mentoring & Buddy System' },
        { id: 'b5', label: 'B.5 Performance & Growth' },
        { id: 'b6', label: 'B.6 Offboarding' },
      ],
    },
    {
      label: 'Part C — The Office Environment',
      sections: [
        { id: 'c1', label: 'C.1 Berlin Office Rules' },
        { id: 'c2', label: 'C.2 Housekeeping' },
        { id: 'c3', label: 'C.3 Spaces & Facilities' },
      ],
    },
    {
      label: 'Part D — Safety & Environment',
      sections: [
        { id: 'd1', label: 'D.1 Work Safety' },
        { id: 'd2', label: 'D.2 Environmental Practice / LAVA Zero' },
        { id: 'd3', label: 'D.3 Environmental Preparedness' },
      ],
    },
    {
      label: 'Part E — How We Work',
      sections: [
        { id: 'e1', label: 'E.1 Design Manual at a Glance' },
        { id: 'e2', label: 'E.2 Project Management Manual at a Glance' },
        { id: 'e3', label: 'E.3 SOPs' },
        { id: 'e4', label: 'E.4 Project Folder Structure' },
        { id: 'e5', label: 'E.5 Templates & Standards Register' },
        { id: 'e6', label: 'E.6 IT, Servers & Poolarserver' },
        { id: 'e7', label: 'E.7 Document Control' },
        { id: 'e8', label: 'E.8 Graphic Identity in Practice' },
      ],
    },
    {
      label: 'Part F — Connections',
      sections: [
        { id: 'f1', label: 'F.1 Cross-References & Linked Documents' },
      ],
    },
    {
      label: 'Part G — Knowledge & Growth',
      sections: [
        { id: 'g1', label: 'G.1 Knowledge & Growth' },
      ],
    },
    {
      label: 'Supporting Systems',
      sections: [
        { id: 'qems', label: 'QEMS' },
        { id: 'ppm', label: 'Project Management Manual (PPM)' },
        { id: 'worksafety', label: 'Work Safety Manual' },
        { id: 'guides', label: 'Guides & Registers (Appendices A–M)' },
        { id: 'live', label: 'Live Systems & Tools' },
      ],
    },
  ],
};

export const glossaryData = {
  manualFamily: [
    { term: 'OM', def: 'Office Manual (daily life in the Berlin office)' },
    { term: 'CM', def: 'Cultural Manual (values, history, design philosophy)' },
    { term: 'BM', def: 'Bidding Manual (proposals, templates, client engagement)' },
    { term: 'PM', def: 'Project Manual (design process, quality, delivery)' },
    { term: 'PPM', def: 'Project Management Manual (templates register, folder structure, server governance)' },
    { term: 'WSM', def: 'Work Safety Manual (safety roles, emergency procedures, hazard register)' },
  ],
  managementSystems: [
    { term: 'QEMS', def: 'Quality & Environmental Management System' },
    { term: 'QMS', def: 'Quality Management System (ISO 9001 half of QEMS)' },
    { term: 'EMS', def: 'Environmental Management System (ISO 14001 half of QEMS)' },
    { term: 'ISO 9001', def: 'International standard for Quality Management Systems' },
    { term: 'ISO 14001', def: 'International standard for Environmental Management Systems' },
    { term: 'SOP', def: 'Standard Operating Procedure' },
    { term: 'KPI', def: 'Key Performance Indicator' },
    { term: 'POC', def: 'Point of Contact' },
  ],
  softwareIT: [
    { term: 'Poolarserver', def: "LAVA's intranet platform (timesheets, project info, contacts)" },
    { term: 'Poolarmail', def: 'Secure large-file transfer inside Poolarserver (2 GB limit)' },
    { term: 'Zeiterfassung', def: 'Time-tracking in Poolarserver' },
    { term: 'IT Wiki', def: "LAVA's internal knowledge base via Teams > BER > Office Management" },
  ],
  locations: [
    { term: 'L:\\', def: 'Berlin server drive' },
    { term: 'BER PROJECTS', def: 'Server folder for ongoing Berlin projects' },
    { term: 'BER LIBRARY', def: 'Server folder for reference materials and standards' },
    { term: 'BER TEMP', def: 'Server folder for temporary files' },
    { term: '_SCANS', def: 'Folder where printer deposits scanned documents (delete after use)' },
  ],
  germanTerms: [
    { term: 'Urlaubsantrag', def: 'Vacation request form' },
    { term: 'Stoßlüften', def: 'Opening windows fully for short bursts to refresh air' },
    { term: 'Sicherheitsfachkraft', def: 'Safety specialist' },
    { term: 'Sicherheitsbeauftragte', def: 'Safety officer' },
    { term: 'Brandschutzhelfer', def: 'Fire protection helper' },
    { term: 'Ersthelfer', def: 'First aider' },
    { term: 'Rechtskataster', def: 'Legal register' },
  ],
};

export const involvedPartiesData = [
  { manual: 'Office Manual', role: 'Office Manager drafts, Directors review' },
  { manual: 'Cultural Manual', role: 'Founders/Directors draft, all staff invited to comment' },
  { manual: 'Bidding Manual', role: 'PR + Senior Leadership draft and review' },
  { manual: 'Project Manual', role: 'Design Leads + Project Managers draft, Directors review' },
  { manual: 'QEMS, PPM, Work Safety Manual', role: 'Existing owners stay' },
  { manual: 'Live Systems & Tools', role: 'IT team maintains' },
  { manual: 'Guides & Registers', role: 'LAVA Zero team + Admin' },
];
