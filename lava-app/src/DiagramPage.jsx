import { useState, useRef, useCallback, useMemo, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { nodes, connections, COLORS, tocLink } from './data.js';
import GlobalSearch, { SearchButton } from './GlobalSearch.jsx';
import StatusTable from './StatusTable.jsx';
import ActiveUsers from './ActiveUsers.jsx';

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

const NodeGroup = memo(function NodeGroup({ node, op, isHov, isSearchMatch, screensaver, onMouseEnter, onMouseLeave, onClick }) {
  const lines = node.label.split('\n');
  const lineH = node.layer === 2 ? 12 : 15;
  const totalH = lines.length * lineH;
  const ssActive = screensaver && node.id !== 'center';

  return (
    <g
      data-node-id={node.id}
      style={{
        cursor: node.clickTarget ? 'pointer' : 'default',
        opacity: op,
        transform: `translate(${node.x}px, ${node.y}px)`,
        transition: 'opacity 0.2s',
        willChange: 'transform',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {isHov && !screensaver && (
        <circle
          r={node.radius + 8}
          fill="none"
          stroke={node.color}
          strokeWidth={2.5}
          opacity={0.5}
          filter={`url(#glow-${node.id})`}
        />
      )}

      {isSearchMatch && !isHov && !screensaver && (
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
        fill={ssActive ? 'none' : node.color}
        stroke={ssActive ? 'rgba(180,180,180,0.45)' : (node.id === 'center' ? COLORS.centerStroke : 'none')}
        strokeWidth={ssActive ? 1.5 : (node.id === 'center' ? 2 : 0)}
        style={{ transition: 'fill 1.5s ease, stroke 1.5s ease, stroke-width 1.5s ease' }}
      />

      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fill={node.textColor || COLORS.white}
        fontSize={node.layer === 2 ? 8 : node.layer === 0 ? 12 : 11}
        fontWeight="700"
        fontFamily="'Inter','Helvetica Neue',Arial,sans-serif"
        letterSpacing="0.04em"
        opacity={ssActive ? 0 : 1}
        style={{ userSelect: 'none', pointerEvents: 'none', transition: 'opacity 1.5s ease' }}
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
          opacity={ssActive ? 0 : 0.7}
          style={{ userSelect: 'none', pointerEvents: 'none', transition: 'opacity 1.5s ease' }}
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

const IDLE_MS = 2 * 60 * 1000; // 2 minutes

// Per-node orbital params: amplitude, angular speed (rad/s), phase offset
// Built once when screensaver starts so each run looks different
function buildOrbitParams() {
  const p = {};
  nodes.forEach(n => {
    const amp   = n.id === 'center' ? 3 : n.layer === 1 ? 16 : 32;
    // Speed: 0.14–0.26 rad/s → period 24–45 s, intentionally irrational per node
    const speed = (0.14 + Math.random() * 0.12) * (Math.random() < 0.5 ? 1 : -1);
    const phase = Math.random() * Math.PI * 2;
    // Each node also has a secondary wobble on a perpendicular axis for figure-8 feel
    const amp2   = amp * (0.3 + Math.random() * 0.4);
    const speed2 = speed * (1.37 + Math.random() * 0.5); // irrational ratio to avoid sync
    const phase2 = Math.random() * Math.PI * 2;
    p[n.id] = { amp, speed, phase, amp2, speed2, phase2 };
  });
  return p;
}

export default function DiagramPage({ searchOpen, onSearchOpen, onSearchClose }) {
  const navigate = useNavigate();
  const [hovered, setHovered]       = useState(null);
  const [tooltip, setTooltip]       = useState({ visible: false, x: 0, y: 0, text: '' });
  const [highlight, setHighlight]   = useState(null); // { all, active } from the search panel
  const [statusOpen, setStatusOpen] = useState(false);
  const [screensaver, setScreensaver] = useState(false);
  const svgRef      = useRef(null);
  const ssActive    = useRef(false);
  const idleTimer   = useRef(null);
  const rafRef      = useRef(null);
  const orbitParams = useRef({});
  const nodeEls     = useRef(null); // cached DOM refs, populated once per session

  useEffect(() => {
    function cacheNodeEls() {
      const map = {};
      nodes.forEach(n => {
        map[n.id] = svgRef.current?.querySelector(`[data-node-id="${n.id}"]`) ?? null;
      });
      nodeEls.current = map;
    }

    function tick(t) {
      const s = t / 1000;
      nodes.forEach(n => {
        const el = nodeEls.current?.[n.id];
        if (!el) return;
        const { amp, speed, phase, amp2, speed2, phase2 } = orbitParams.current[n.id];
        const dx = amp  * Math.cos(speed  * s + phase)
                 + amp2 * Math.cos(speed2 * s + phase2);
        const dy = amp  * Math.sin(speed  * s + phase)
                 + amp2 * Math.sin(speed2 * s + phase2);
        el.style.transition = 'opacity 0.2s';
        el.style.transform  = `translate(${n.x + dx}px, ${n.y + dy}px)`;
      });
      rafRef.current = requestAnimationFrame(tick);
    }

    function start() {
      ssActive.current   = true;
      orbitParams.current = buildOrbitParams();
      cacheNodeEls();
      setScreensaver(true);
      rafRef.current = requestAnimationFrame(tick);
    }

    function stop() {
      ssActive.current = false;
      cancelAnimationFrame(rafRef.current);
      setScreensaver(false);
      // Return all nodes to original position with smooth transition
      nodes.forEach(n => {
        const el = nodeEls.current?.[n.id];
        if (!el) return;
        el.style.transition = 'transform 2s ease-out, opacity 0.2s';
        el.style.transform  = `translate(${n.x}px, ${n.y}px)`;
      });
      nodeEls.current = null;
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
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('click', onActivity);
      window.removeEventListener('keydown', onActivity);
    };
  }, []);

  const matchSet  = highlight?.all ?? null;
  const activeSet = highlight?.active ?? null;

  const neighborSet = useMemo(() => hovered ? getNeighbors(hovered) : null, [hovered]);

  function nodeOpacity(id) {
    if (matchSet)     return matchSet.has(id) ? 1 : 0.2;
    if (!neighborSet) return 1;
    return neighborSet.has(id) ? 1 : 0.15;
  }

  function lineOpacity(a, b) {
    if (matchSet)     return matchSet.has(a) && matchSet.has(b) ? 0.8 : 0.12;
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
    <div className={`diagram-page${screensaver ? ' diagram-page--screensaver' : ''}`}>
      <div className="diagram-header">
        <div className="logo">
          <span className="logo-badge">LAVA</span>
          Operating LAVA
        </div>
        <div className="diagram-search-center">
          <SearchButton onClick={onSearchOpen} />
        </div>
        <div className="header-btns">
          <button className="hbtn" onClick={() => navigate('/toc')}>Table of Contents</button>
          <button className="hbtn" onClick={() => navigate(tocLink('glossary'))}>Glossary</button>
          <button className="hbtn" onClick={() => navigate(tocLink('involved'))}>Involved Parties</button>
        </div>
      </div>

      <StatusTable open={statusOpen} onClose={() => setStatusOpen(false)} />

      <div className="diagram-body">
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
              const op           = nodeOpacity(node.id);
              const isHov        = hovered === node.id || (activeSet?.has(node.id) ?? false);
              const isSearchMatch = matchSet?.has(node.id) ?? false;
              return (
                <NodeGroup
                  key={node.id}
                  node={node}
                  op={op}
                  isHov={isHov}
                  isSearchMatch={isSearchMatch}
                  screensaver={screensaver}
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

          <ActiveUsers />
        </div>

        {searchOpen && (
          <GlobalSearch open variant="side" onClose={onSearchClose} onHighlight={setHighlight} />
        )}
      </div>

      <div className="page-footer">Operating LAVA 1.01</div>
    </div>
  );
}
