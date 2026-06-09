import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { READINESS } from './data.js';

// ── Canvas ────────────────────────────────────────────────────────────────────
const VW = 1200, VH = 840;

// ── Hub ───────────────────────────────────────────────────────────────────────
const CX = 575, CY = 392, HR = 82;

// ── Dimensions ────────────────────────────────────────────────────────────────
const NW = 144, NH = 70, NRX = 9;   // main node rect
const SW = 110, SH = 52, SRX = 7;   // sub-node rect
const LW = 122, LH = 36, LRX = 4;   // connection-label box

// ── Geometry ──────────────────────────────────────────────────────────────────
function circleEdge(fromX, fromY, cx, cy, r) {
  const dx = fromX - cx, dy = fromY - cy;
  const d  = Math.hypot(dx, dy);
  return [cx + (dx / d) * r, cy + (dy / d) * r];
}

function rectEdge(fromX, fromY, rx, ry, w, h) {
  const dx = fromX - rx, dy = fromY - ry;
  const d  = Math.hypot(dx, dy);
  const ux = dx / d, uy = dy / d;
  const t  = Math.min((w / 2) / Math.abs(ux || 1e-9), (h / 2) / Math.abs(uy || 1e-9));
  return [rx + ux * t, ry + uy * t];
}

// ── Status colors ─────────────────────────────────────────────────────────────
function statusColor(pct) {
  if (pct >= 100) return '#22C55E';
  if (pct >= 50)  return '#3B82F6';
  return '#B0B7C3';
}

// ── Node data ─────────────────────────────────────────────────────────────────
const NODES = [
  { id: 'qems',       x: 140,  y: 115, color: '#1A5A4A', name: ['QEMS'],                         subtitle: 'ISO 9001/14001',        readiness: READINESS.qems,     dash: '7 4' },
  { id: 'ppm',        x: 1032, y: 98,  color: '#8B3F1C', name: ['Project Processes', 'Manual'],  subtitle: 'Templates & SOPs',      readiness: READINESS.ppm,      dash: '7 4' },
  { id: 'cultural',   x: 210,  y: 372, color: '#1D9E75', name: ['Cultural Manual'],               subtitle: 'Values & philosophy',   readiness: READINESS.cultural, dash: null  },
  { id: 'bidding',    x: 872,  y: 302, color: '#D4652F', name: ['Bidding Manual'],                subtitle: 'Proposals & clients',   readiness: READINESS.bidding,  dash: null  },
  { id: 'live',       x: 1042, y: 452, color: '#1B3B6B', name: ['Live Systems', '& Tools'],       subtitle: 'Platforms & tools',     readiness: READINESS.live,     dash: '7 4' },
  { id: 'guides',     x: 162,  y: 628, color: '#3D3D3D', name: ['Guides &', 'Registers'],         subtitle: 'Appendices A–M',        readiness: READINESS.guides,   dash: '7 4' },
  { id: 'worksafety', x: 558,  y: 732, color: '#8B2D2D', name: ['Work Safety Manual'],            subtitle: 'Safety & emergencies',  readiness: READINESS.safety,   dash: '7 4' },
  { id: 'project',    x: 898,  y: 612, color: '#5F3B5A', name: ['Project Manual'],                subtitle: 'Design & quality',      readiness: READINESS.project,  dash: null  },
];

const SUBNODES = [
  // Cultural
  { id: 's-hist',   parent: 'cultural', x: 338,  y: 185, color: '#5DCAA5', name: ['Our History']             },
  { id: 's-vals',   parent: 'cultural', x: 420,  y: 215, color: '#5DCAA5', name: ['Core Values']             },
  { id: 's-dphil',  parent: 'cultural', x: 108,  y: 240, color: '#5DCAA5', name: ['Design', 'Philosophy']    },
  { id: 's-tstr',   parent: 'cultural', x: 110,  y: 455, color: '#5DCAA5', name: ['Team Structure']          },
  { id: 's-growth', parent: 'cultural', x: 250,  y: 548, color: '#5DCAA5', name: ['Growth &', 'Mentorship']  },
  // Bidding
  { id: 's-scope',  parent: 'bidding',  x: 745,  y: 178, color: '#F0997B', name: ['Scope &', 'Pricing']      },
  { id: 's-prop',   parent: 'bidding',  x: 872,  y: 150, color: '#F0997B', name: ['Proposal', 'Template']    },
  { id: 's-ceng',   parent: 'bidding',  x: 1028, y: 242, color: '#F0997B', name: ['Client', 'Engagement']    },
  { id: 's-tass',   parent: 'bidding',  x: 990,  y: 398, color: '#F0997B', name: ['Team', 'Assignments']     },
  // Project
  { id: 's-phas',   parent: 'project',  x: 842,  y: 490, color: '#9B7B96', name: ['Project Phases']          },
  { id: 's-qual',   parent: 'project',  x: 990,  y: 485, color: '#9B7B96', name: ['Quality', 'Standards']    },
  { id: 's-deliv',  parent: 'project',  x: 1045, y: 612, color: '#9B7B96', name: ['Deliverables', '& Archive'] },
  { id: 's-file',   parent: 'project',  x: 1005, y: 732, color: '#9B7B96', name: ['File Management']         },
  { id: 's-less',   parent: 'project',  x: 848,  y: 748, color: '#9B7B96', name: ['Lessons Learned']         },
];

// Label positioned at t along the spoke (0=hub center, 1=node center)
const CONN_LABELS = [
  { nodeId: 'qems',       t: 0.50, lines: ['Compliance & standards', 'framework']    },
  { nodeId: 'ppm',        t: 0.50, lines: ['Operational standards', '& governance']  },
  { nodeId: 'cultural',   t: 0.50, lines: ['Shared values', 'foundation']            },
  { nodeId: 'bidding',    t: 0.50, lines: ['Operations &', 'client interface']        },
  { nodeId: 'live',       t: 0.52, lines: ['Operational', 'infrastructure']          },
  { nodeId: 'guides',     t: 0.50, lines: ['Reference data', '& tracking']           },
  { nodeId: 'worksafety', t: 0.48, lines: ['Safety compliance', '& response']        },
  { nodeId: 'project',    t: 0.50, lines: ['Delivery standards', '& procedures']     },
];

const LEGEND = [
  { label: 'Complete',    color: '#22C55E' },
  { label: 'In progress', color: '#3B82F6' },
  { label: 'Early stage', color: '#B0B7C3' },
];

// ── Sub-node card ─────────────────────────────────────────────────────────────
function SubNode({ node, onClick }) {
  const { x, y, color, name } = node;
  const rx = x - SW / 2, ry = y - SH / 2;
  const multi  = name.length > 1;
  const nameY1 = ry + (multi ? 17 : 28);
  const nameY2 = nameY1 + 13;
  return (
    <g style={{ cursor: 'pointer' }} onClick={onClick}>
      <rect x={rx} y={ry} width={SW} height={SH} rx={SRX}
        fill="#fff" stroke="#E5E7EB" strokeWidth={1} />
      <rect x={rx} y={ry} width={4} height={SH} fill={color}
        clipPath={`url(#clip-${node.id})`} />
      <text x={rx + 11} y={nameY1}
        fill="#374151" fontSize={11} fontWeight="600"
        fontFamily="'Inter','Helvetica Neue',Arial,sans-serif"
        style={{ userSelect: 'none', pointerEvents: 'none' }}>
        {name[0]}
      </text>
      {multi && (
        <text x={rx + 11} y={nameY2}
          fill="#374151" fontSize={11} fontWeight="600"
          fontFamily="'Inter','Helvetica Neue',Arial,sans-serif"
          style={{ userSelect: 'none', pointerEvents: 'none' }}>
          {name[1]}
        </text>
      )}
    </g>
  );
}

// ── Main node card ─────────────────────────────────────────────────────────────
function ManualNode({ node, isHov, onEnter, onLeave, onClick }) {
  const { x, y, color, name, subtitle, readiness } = node;
  const rx     = x - NW / 2, ry = y - NH / 2;
  const multi  = name.length > 1;
  const status = statusColor(readiness);
  const barW   = (readiness / 100) * (NW - 18);
  const nameY1 = ry + (multi ? 18 : 25);
  const nameY2 = nameY1 + 13;
  const subY   = multi ? nameY2 + 13 : nameY1 + 15;
  const barY   = ry + NH - 12;

  return (
    <g style={{ cursor: 'pointer' }} onClick={onClick} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      {isHov && (
        <rect x={rx - 4} y={ry - 4} width={NW + 8} height={NH + 8}
          rx={NRX + 3} fill={color} opacity={0.14} />
      )}
      <rect x={rx} y={ry} width={NW} height={NH} rx={NRX}
        fill="#fff"
        stroke={isHov ? color : '#E5E7EB'}
        strokeWidth={isHov ? 1.5 : 1}
        style={{ transition: 'stroke 0.15s' }} />
      <rect x={rx} y={ry} width={5} height={NH} fill={color}
        clipPath={`url(#clip-${node.id})`} />
      <text x={rx + 13} y={nameY1}
        fill="#111827" fontSize={13} fontWeight="700"
        fontFamily="'Inter','Helvetica Neue',Arial,sans-serif"
        style={{ userSelect: 'none', pointerEvents: 'none' }}>
        {name[0]}
      </text>
      {multi && (
        <text x={rx + 13} y={nameY2}
          fill="#111827" fontSize={13} fontWeight="700"
          fontFamily="'Inter','Helvetica Neue',Arial,sans-serif"
          style={{ userSelect: 'none', pointerEvents: 'none' }}>
          {name[1]}
        </text>
      )}
      <text x={rx + 13} y={subY}
        fill="#9CA3AF" fontSize={11}
        fontFamily="'Inter','Helvetica Neue',Arial,sans-serif"
        style={{ userSelect: 'none', pointerEvents: 'none' }}>
        {subtitle}
      </text>
      <rect x={rx + 9} y={barY} width={NW - 18} height={4} rx={2} fill="#F3F4F6" />
      {barW > 0 && (
        <rect x={rx + 9} y={barY} width={barW} height={4} rx={2} fill={status} />
      )}
      <text x={rx + NW - 7} y={barY + 2}
        textAnchor="end" dominantBaseline="middle"
        fill={status} fontSize={10} fontWeight="700"
        fontFamily="'Inter','Helvetica Neue',Arial,sans-serif"
        style={{ userSelect: 'none', pointerEvents: 'none' }}>
        {readiness}%
      </text>
    </g>
  );
}

// ── Page component ─────────────────────────────────────────────────────────────
export default function DiagramPage() {
  const navigate  = useNavigate();
  const [hovered, setHovered] = useState(null);

  const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

  return (
    <div className="diagram-page">
      <div className="diagram-header">
        <div className="logo">
          <span className="logo-badge">LAVA</span>
          Office Manual Berlin 2026
        </div>
        <div className="search-wrap">
          <div className="header-btns">
            <button className="hbtn" onClick={() => navigate('/toc')}>Table of contents</button>
            <button className="hbtn" onClick={() => navigate('/glossary')}>Glossary</button>
            <button className="hbtn" onClick={() => navigate('/involved')}>Involved parties</button>
          </div>
        </div>
      </div>

      <div className="diagram-canvas-wrap">
        <svg
          className="diagram-svg fade-in"
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {NODES.map(n => (
              <clipPath key={`clip-${n.id}`} id={`clip-${n.id}`}>
                <rect x={n.x - NW / 2} y={n.y - NH / 2} width={NW} height={NH} rx={NRX} />
              </clipPath>
            ))}
            {SUBNODES.map(n => (
              <clipPath key={`clip-${n.id}`} id={`clip-${n.id}`}>
                <rect x={n.x - SW / 2} y={n.y - SH / 2} width={SW} height={SH} rx={SRX} />
              </clipPath>
            ))}
          </defs>

          {/* Sub-node spokes (dotted, behind everything) */}
          {SUBNODES.map(sn => {
            const p  = nodeMap[sn.parent];
            const [px, py] = rectEdge(sn.x, sn.y, p.x, p.y, NW, NH);
            const [sx, sy] = rectEdge(p.x, p.y, sn.x, sn.y, SW, SH);
            return (
              <line key={`ss-${sn.id}`}
                x1={px} y1={py} x2={sx} y2={sy}
                stroke="#D1D5DB" strokeWidth={1.2} strokeDasharray="4 3"
              />
            );
          })}

          {/* Main spokes */}
          {NODES.map(n => {
            const isHov = hovered === n.id;
            const [hx, hy] = circleEdge(n.x, n.y, CX, CY, HR);
            const [ex, ey] = rectEdge(CX, CY, n.x, n.y, NW, NH);
            return (
              <line key={`spoke-${n.id}`}
                x1={hx} y1={hy} x2={ex} y2={ey}
                stroke={isHov ? n.color : '#C8CACD'}
                strokeWidth={isHov ? 2 : 1.5}
                strokeDasharray={n.dash || undefined}
                style={{ transition: 'stroke 0.15s' }}
              />
            );
          })}

          {/* Sub-nodes */}
          {SUBNODES.map(sn => (
            <SubNode
              key={sn.id}
              node={sn}
              onClick={() => navigate(`/detail/${sn.parent}`)}
            />
          ))}

          {/* Main nodes */}
          {NODES.map(n => (
            <ManualNode
              key={n.id}
              node={n}
              isHov={hovered === n.id}
              onEnter={() => setHovered(n.id)}
              onLeave={() => setHovered(null)}
              onClick={() => navigate(`/detail/${n.id}`)}
            />
          ))}

          {/* Connection-label boxes (on top of spokes) */}
          {CONN_LABELS.map(lbl => {
            const n  = nodeMap[lbl.nodeId];
            const lx = CX + (n.x - CX) * lbl.t;
            const ly = CY + (n.y - CY) * lbl.t;
            const half = (lbl.lines.length - 1) / 2;
            return (
              <g key={`lbl-${lbl.nodeId}`}>
                <rect x={lx - LW / 2} y={ly - LH / 2} width={LW} height={LH}
                  rx={LRX} fill="#fff" stroke="#D1D5DB" strokeWidth={1} />
                {lbl.lines.map((line, i) => (
                  <text key={i}
                    x={lx}
                    y={ly + (i - half) * 12}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="#6B7280" fontSize={10}
                    fontFamily="'Inter','Helvetica Neue',Arial,sans-serif"
                    style={{ userSelect: 'none' }}>
                    {line}
                  </text>
                ))}
              </g>
            );
          })}

          {/* Hub (rendered last so it sits above spokes) */}
          <g
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/toc')}
            onMouseEnter={() => setHovered('hub')}
            onMouseLeave={() => setHovered(null)}
          >
            <circle cx={CX} cy={CY} r={HR + 8}
              fill="#B3F400"
              opacity={hovered === 'hub' ? 0.22 : 0.09}
              style={{ transition: 'opacity 0.15s' }}
            />
            <circle cx={CX} cy={CY} r={HR} fill="#1a1a1a" />
            <circle cx={CX} cy={CY} r={HR} fill="none" stroke="#B3F400" strokeWidth={2.5} />
            <text x={CX} y={CY - 8} textAnchor="middle"
              fill="#fff" fontSize={13} fontWeight="700"
              fontFamily="'Inter','Helvetica Neue',Arial,sans-serif"
              style={{ userSelect: 'none', pointerEvents: 'none' }}>
              Office Manual
            </text>
            <text x={CX} y={CY + 8} textAnchor="middle"
              fill="#B3F400" fontSize={11}
              fontFamily="'Inter','Helvetica Neue',Arial,sans-serif"
              style={{ userSelect: 'none', pointerEvents: 'none' }}>
              Berlin 2026
            </text>
            <text x={CX} y={CY + 24} textAnchor="middle"
              fill="rgba(179,244,0,0.55)" fontSize={10}
              fontFamily="'Inter','Helvetica Neue',Arial,sans-serif"
              style={{ userSelect: 'none', pointerEvents: 'none' }}>
              {READINESS.office}%
            </text>
          </g>

          {/* Legend */}
          {LEGEND.map((item, i) => (
            <g key={item.label} transform={`translate(${VW / 2 - 130 + i * 115}, ${VH - 22})`}>
              <circle r={5} fill={item.color} />
              <text x={12} dominantBaseline="middle"
                fill="#9CA3AF" fontSize={11}
                fontFamily="'Inter','Helvetica Neue',Arial,sans-serif"
                style={{ userSelect: 'none' }}>
                {item.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="page-footer">LAVA Berlin 2026 — Office Manual v4 — Draft</div>
    </div>
  );
}
