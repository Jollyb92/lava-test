import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import DiagramPage from './DiagramPage.jsx';
import DetailPage from './DetailPage.jsx';
import TocPage from './TocPage.jsx';
import GlobalSearch from './GlobalSearch.jsx';
import { OFFICE_SECTION_IDS, tocLink } from './data.js';

// Operating LAVA sections live in the Table of Contents; old links redirect there
function DetailRoute({ onSearchOpen }) {
  const { id } = useParams();
  const [params] = useSearchParams();
  if (OFFICE_SECTION_IDS.has(id)) return <Navigate to={tocLink(id, params.get('slide'))} replace />;
  return <DetailPage onSearchOpen={onSearchOpen} />;
}

export default function App() {
  const { pathname } = useLocation();
  const onDiagram = pathname === '/';
  // Search belongs to the page it was opened on, so navigating closes it
  const [searchPath, setSearchPath] = useState(null);
  const searchOpen = searchPath === pathname;
  const setSearchOpen = useCallback(
    open => setSearchPath(prev => {
      const next = typeof open === 'function' ? open(prev === pathname) : open;
      return next ? pathname : null;
    }),
    [pathname]
  );

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(o => !o);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setSearchOpen]);

  return (
    <>
      <Routes>
        <Route path="/"           element={<DiagramPage searchOpen={searchOpen} onSearchOpen={() => setSearchOpen(true)} onSearchClose={() => setSearchOpen(false)} />} />
        <Route path="/toc"        element={<TocPage     onSearchOpen={() => setSearchOpen(true)} />} />
        <Route path="/glossary"   element={<Navigate to={tocLink('glossary')} replace />} />
        <Route path="/involved"   element={<Navigate to={tocLink('involved')} replace />} />
        <Route path="/detail/:id" element={<DetailRoute onSearchOpen={() => setSearchOpen(true)} />} />
      </Routes>
      {/* On the diagram, search is docked beside the bubbles (rendered by DiagramPage) */}
      {!onDiagram && <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />}
    </>
  );
}
