import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { nodes, connections, COLORS } from './data.js';

const VW = 1000;
const VH = 720;

function getNode(id) {
  return nodes.find(n => n.id === id);
}

function getNeighbors(id) {
  const set = new Set([id]);
  for (const [a, b] of connections) {
    if (a === id) set.add(b);
    if (b === id) set.add(a);
  }
  return set;
}

function connDash(toLayer) {
  if (toLayer === 2) return '4 4';
  if (toLayer === 3) return '8 5';
  return null;
}

function connColor(toLayer) {
  if (toLayer === 2) return '#ccc';
  if (toLayer === 3) return '#aaa';
  return '#999';
}

// ── Progress ring helpers ──────────────────────────────────────────────────

// Converts a 0–360 degree position (0 = 12 o'clock, clockwise) to SVG x,y on a circle of radius r
function polarToXY(deg, r) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [r * Math.cos(rad), r * Math.sin(rad)];
}

// SVG arc path for one segment of the ring (center is 0,0)
function arcSegment(r, startDeg, endDeg) {
  const [x1, y1] = polarToXY(startDeg, r);
  const [x2, y2] = polarToXY(endDeg, r);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(3)} ${y2.toFixed(3)}`;
}

function progressColor(percent) {
  if (percent >= 70) return '#22C55E';  // green
  if (percent >= 30) return '#3B82F6';  // blue
  return '#9CA3AF';                      // grey
}

// Flat-color progress ring drawn around a node (center = 0,0)
function ProgressRing({ nodeRadius, percent, sw = 4 }) {
  if (percent === undefined || percent === null) return null;

  const r     = nodeRadius + (nodeRadius >= 50 ? 9 : 6);
  const color = progressColor(percent);

  const arcEl = percent >= 100
    ? <circle r={r} fill="none" stroke={color} strokeWidth={sw} />
    : percent > 0
      ? <path d={arcSegment(r, 0, (percent / 100) * 360)} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" />
      : null;

  return (
    <>
      <circle r={r} fill="none" stroke="#d8d8d8" strokeWidth={sw} opacity={0.5} />
      {arcEl}
      <text
        x={0}
        y={nodeRadius + (nodeRadius >= 50 ? 22 : 16)}
        textAnchor="middle"
        fill="#555"
        fontSize={nodeRadius >= 50 ? 9 : 8}
        fontWeight="700"
        fontFamily="'Inter','Helvetica Neue',Arial,sans-serif"
        letterSpacing="0.04em"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {percent}%
      </text>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────

export default function DiagramPage() {
  const navigate = useNavigate();
  const [hovered, setHovered]   = useState(null);
  const [tooltip, setTooltip]   = useState({ visible: false, x: 0, y: 0, text: '' });
  const [search, setSearch]     = useState('');
  const svgRef = useRef(null);

  const matchSet = (() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return new Set(
      nodes
        .filter(n => n.label.toLowerCase().includes(q) || (n.sublabel || '').toLowerCase().includes(q))
        .map(n => n.id)
    );
  })();

  const neighborSet = hovered ? getNeighbors(hovered) : null;

  function nodeOpacity(id) {
    if (matchSet)     return matchSet.has(id) ? 1 : 0.2;
    if (!neighborSet) return 1;
    return neighborSet.has(id) ? 1 : 0.15;
  }

  function lineOpacity(a, b) {
    if (matchSet)     return 0.12;
    if (!neighborSet) return 1;
    return neighborSet.has(a) && neighborSet.has(b) ? 1 : 0.07;
  }

  function handleMouseEnter(e, node) {
    setHovered(node.id);
    setTooltip({ visible: true, x: e.clientX + 14, y: e.clientY - 10, text: node.label.replace('\n', ' ') });
  }

  function handleMouseMove(e) {
    if (tooltip.visible) setTooltip(t => ({ ...t, x: e.clientX + 14, y: e.clientY - 10 }));
  }

  function handleMouseLeave() {
    setHovered(null);
    setTooltip(t => ({ ...t, visible: false }));
  }

  return (
    <div className="diagram-page">
      <div className="diagram-header">
        <div className="logo">
          <span className="logo-badge">LAVA</span>
          Office Manual Berlin 2026
        </div>
        <div className="search-wrap">
          <input
            className="search-input"
            type="text"
            placeholder="Search nodes…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="header-btns">
            <button className="hbtn" onClick={() => navigate('/toc')}>Table of Contents</button>
            <button className="hbtn" onClick={() => navigate('/glossary')}>Glossary</button>
            <button className="hbtn" onClick={() => navigate('/involved')}>Involved Parties</button>
          </div>
        </div>
      </div>

      <div className="diagram-canvas-wrap" onMouseMove={handleMouseMove}>
        <svg
          ref={svgRef}
          className="diagram-svg fade-in"
          viewBox={`0 0 ${VW} ${VH}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {nodes.map(n => (
              <filter key={`glow-${n.id}`} id={`glow-${n.id}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {/* Connections */}
          {connections.map(([fromId, toId], i) => {
            const from = getNode(fromId);
            const to   = getNode(toId);
            if (!from || !to) return null;
            const dash = connDash(to.layer);
            const col  = connColor(to.layer);
            const op   = lineOpacity(fromId, toId);
            return (
              <line
                key={i}
                x1={from.x} y1={from.y}
                x2={to.x}   y2={to.y}
                stroke={col}
                strokeWidth={1.5}
                strokeOpacity={op}
                strokeDasharray={dash}
                style={{ transition: 'stroke-opacity 0.2s' }}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const op    = nodeOpacity(node.id);
            const isHov = hovered === node.id;
            const isSearchMatch = matchSet?.has(node.id);
            const lines = node.label.split('\n');
            const lineH = node.layer === 2 ? 12 : 15;
            const totalH = lines.length * lineH;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x},${node.y})`}
                style={{
                  cursor: node.clickTarget ? 'pointer' : 'default',
                  opacity: op,
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => handleMouseEnter(e, node)}
                onMouseLeave={handleMouseLeave}
                onClick={() => node.clickTarget && navigate(node.clickTarget)}
              >
                {/* Progress ring (drawn first, behind glow) */}
                {node.readiness !== undefined && (
                  <ProgressRing
                    nodeRadius={node.radius}
                    percent={node.readiness}
                    sw={node.layer === 2 ? 3 : 4}
                  />
                )}

                {/* Hover glow ring */}
                {isHov && (
                  <circle
                    r={node.radius + (node.readiness !== undefined ? 16 : 8)}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={2.5}
                    opacity={0.5}
                    filter={`url(#glow-${node.id})`}
                  />
                )}

                {/* Search highlight */}
                {isSearchMatch && !isHov && (
                  <circle
                    r={node.radius + (node.readiness !== undefined ? 14 : 6)}
                    fill="none"
                    stroke="#B3F400"
                    strokeWidth={2.5}
                    opacity={0.9}
                  />
                )}

                {/* Main filled circle */}
                <circle
                  r={node.radius}
                  fill={node.color}
                  stroke={node.id === 'center' ? COLORS.centerStroke : 'none'}
                  strokeWidth={node.id === 'center' ? 2 : 0}
                />

                {/* Label */}
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={node.textColor || COLORS.white}
                  fontSize={node.layer === 2 ? 8 : node.layer === 0 ? 12 : 11}
                  fontWeight="700"
                  fontFamily="'Inter','Helvetica Neue',Arial,sans-serif"
                  letterSpacing="0.04em"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {lines.map((l, i) => (
                    <tspan key={i} x={0} dy={i === 0 ? -(totalH / 2 - lineH / 2) : lineH}>
                      {l}
                    </tspan>
                  ))}
                </text>

                {/* Sub-label */}
                {node.sublabel && node.layer !== 2 && (
                  <text
                    textAnchor="middle"
                    fill={node.textColor || COLORS.white}
                    fontSize={node.layer === 0 ? 6 : 7.5}
                    fontFamily="'Inter','Helvetica Neue',Arial,sans-serif"
                    opacity={0.7}
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >
                    {node.sublabel.split('\n').map((l, i) => (
                      <tspan key={i} x={0} dy={i === 0 ? totalH / 2 + 8 : 10}>{l}</tspan>
                    ))}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {tooltip.visible && (
          <div className="node-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            {tooltip.text}
          </div>
        )}
      </div>

      <div className="page-footer">LAVA Berlin 2026 — Office Manual v4 — Draft</div>
    </div>
  );
}
