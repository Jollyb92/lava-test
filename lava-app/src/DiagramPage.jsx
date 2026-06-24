import { useState, useRef, useCallback, useMemo, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nodes, connections, COLORS } from './data.js';
import { SearchButton } from './GlobalSearch.jsx';
import StatusTable from './StatusTable.jsx';

const VW = 1200;
const VH = 780;

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

// ── Memoized connection line — only re-renders when opacity changes ─────────

const ConnectionLine = memo(function ConnectionLine({ x1, y1, x2, y2, col, op, dash }) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={col}
      strokeWidth={1.5}
      strokeOpacity={op}
      strokeDasharray={dash}
      style={{ transition: 'stroke-opacity 1s ease' }}
    />
  );
});

// ── Memoized node group — only re-renders when its visual state changes ─────

const NodeGroup = memo(function NodeGroup({ node, dx, dy, op, isHov, isSearchMatch, onMouseEnter, onMouseLeave, onClick }) {
  const lines = node.label.split('\n');
  const lineH = node.layer === 2 ? 12 : 15;
  const totalH = lines.length * lineH;

  return (
    <g
      style={{
        cursor: node.clickTarget ? 'pointer' : 'default',
        opacity: op,
        transform: `translate(${node.x + (dx || 0)}px, ${node.y + (dy || 0)}px)`,
        transition: 'transform 2.5s ease-in-out, opacity 0.2s',
        willChange: 'transform',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {isHov && (
        <circle
          r={node.radius + 8}
          fill="none"
          stroke={node.color}
          strokeWidth={2.5}
          opacity={0.5}
          filter={`url(#glow-${node.id})`}
        />
      )}

      {isSearchMatch && !isHov && (
        <circle
          r={node.radius + 6}
          fill="none"
          stroke="#B3F400"
          strokeWidth={2.5}
          opacity={0.9}
        />
      )}

      <circle
        r={node.radius}
        fill={node.color}
        stroke={node.id === 'center' ? COLORS.centerStroke : 'none'}
        strokeWidth={node.id === 'center' ? 2 : 0}
      />

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
});

// ──────────────────────────────────────────────────────────────────────────

const IDLE_MS    = 2 * 60 * 1000; // 2 minutes
const REDRIFT_MS = 4500;          // re-randomise drift every 4.5 s

function generateDrifts() {
  const d = {};
  nodes.forEach(n => {
    const range = n.layer === 0 ? 28 : n.layer === 1 ? 60 : 85;
    d[n.id] = {
      dx: (Math.random() - 0.5) * range * 2,
      dy: (Math.random() - 0.5) * range * 2,
    };
  });
  return d;
}

export default function DiagramPage({ onSearchOpen }) {
  const navigate = useNavigate();
  const [hovered, setHovered]       = useState(null);
  const [tooltip, setTooltip]       = useState({ visible: false, x: 0, y: 0, text: '' });
  const [search, setSearch]         = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [screensaver, setScreensaver] = useState(false);
  const [drifts, setDrifts]           = useState({});
  const svgRef       = useRef(null);
  const ssActive     = useRef(false);
  const idleTimer    = useRef(null);
  const driftTimer   = useRef(null);

  useEffect(() => {
    function start() {
      ssActive.current = true;
      setScreensaver(true);
      setDrifts(generateDrifts());
      driftTimer.current = setInterval(() => setDrifts(generateDrifts()), REDRIFT_MS);
    }

    function stop() {
      ssActive.current = false;
      setScreensaver(false);
      setDrifts({});
      clearInterval(driftTimer.current);
      schedule();
    }

    function schedule() {
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(start, IDLE_MS);
    }

    function onActivity() {
      if (ssActive.current) stop();
      else schedule();
    }

    schedule();
    window.addEventListener('mousemove', onActivity);
    window.addEventListener('click', onActivity);
    window.addEventListener('keydown', onActivity);
    return () => {
      clearTimeout(idleTimer.current);
      clearInterval(driftTimer.current);
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('click', onActivity);
      window.removeEventListener('keydown', onActivity);
    };
  }, []);

  const matchSet = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return new Set(
      nodes
        .filter(n => n.label.toLowerCase().includes(q) || (n.sublabel || '').toLowerCase().includes(q))
        .map(n => n.id)
    );
  }, [search]);

  const neighborSet = useMemo(() => hovered ? getNeighbors(hovered) : null, [hovered]);

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

  const handleMouseEnterNode = useCallback((e, node) => {
    setHovered(node.id);
    setTooltip({ visible: true, x: e.clientX + 14, y: e.clientY - 10, text: node.label.replace('\n', ' ') });
  }, []);

  const handleMouseLeaveNode = useCallback(() => {
    setHovered(null);
    setTooltip(t => ({ ...t, visible: false }));
  }, []);

  const handleNodeClick = useCallback((clickTarget) => {
    if (clickTarget) navigate(clickTarget);
  }, [navigate]);

  function handleMouseMove(e) {
    if (tooltip.visible) setTooltip(t => ({ ...t, x: e.clientX + 14, y: e.clientY - 10 }));
  }

  return (
    <div className="diagram-page">
      <div className="diagram-header">
        <div className="logo">
          <span className="logo-badge">LAVA</span>
          Office Manual Berlin 2026
        </div>
        <div className="diagram-search-center">
          <SearchButton onClick={onSearchOpen} />
        </div>
        <div className="header-btns">
          <button className="hbtn" onClick={() => navigate('/toc')}>Table of Contents</button>
          <button className="hbtn" onClick={() => navigate('/glossary')}>Glossary</button>
          <button className="hbtn" onClick={() => navigate('/involved')}>Involved Parties</button>
        </div>
      </div>

      <StatusTable open={statusOpen} onClose={() => setStatusOpen(false)} />

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

          {connections.map(([fromId, toId], i) => {
            const from = getNode(fromId);
            const to   = getNode(toId);
            if (!from || !to) return null;
            const dash = connDash(to.layer);
            const col  = connColor(to.layer);
            const op   = screensaver ? 0 : lineOpacity(fromId, toId);
            return (
              <ConnectionLine
                key={i}
                x1={from.x} y1={from.y}
                x2={to.x}   y2={to.y}
                col={col} op={op} dash={dash}
              />
            );
          })}

          {nodes.map(node => {
            const drift = drifts[node.id] || { dx: 0, dy: 0 };
            const op           = nodeOpacity(node.id);
            const isHov        = hovered === node.id;
            const isSearchMatch = matchSet?.has(node.id) ?? false;
            return (
              <NodeGroup
                key={node.id}
                node={node}
                dx={drift.dx}
                dy={drift.dy}
                op={op}
                isHov={isHov}
                isSearchMatch={isSearchMatch}
                onMouseEnter={e => handleMouseEnterNode(e, node)}
                onMouseLeave={handleMouseLeaveNode}
                onClick={() => handleNodeClick(node.clickTarget)}
              />
            );
          })}
        </svg>

        {tooltip.visible && (
          <div className="node-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
            {tooltip.text}
          </div>
        )}

        <button className="st-open-btn" onClick={() => setStatusOpen(true)}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="1" y="1" width="11" height="2.5" rx="0.5" fill="currentColor" opacity="0.7"/>
            <rect x="1" y="5.25" width="11" height="2.5" rx="0.5" fill="currentColor" opacity="0.5"/>
            <rect x="1" y="9.5" width="7" height="2.5" rx="0.5" fill="currentColor" opacity="0.35"/>
          </svg>
          Status Overview
        </button>
      </div>

      <div className="page-footer">LAVA Berlin 2026 — Office Manual v4 — Draft</div>
    </div>
  );
}
