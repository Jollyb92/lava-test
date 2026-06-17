import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import DiagramPage from './DiagramPage.jsx';
import DetailPage from './DetailPage.jsx';
import TocPage from './TocPage.jsx';
import GlossaryPage from './GlossaryPage.jsx';
import InvolvedPage from './InvolvedPage.jsx';
import GlobalSearch from './GlobalSearch.jsx';

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(o => !o);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <Routes>
        <Route path="/"           element={<DiagramPage onSearchOpen={() => setSearchOpen(true)} />} />
        <Route path="/toc"        element={<TocPage     onSearchOpen={() => setSearchOpen(true)} />} />
        <Route path="/glossary"   element={<GlossaryPage onSearchOpen={() => setSearchOpen(true)} />} />
        <Route path="/involved"   element={<InvolvedPage onSearchOpen={() => setSearchOpen(true)} />} />
        <Route path="/detail/:id" element={<DetailPage  onSearchOpen={() => setSearchOpen(true)} />} />
      </Routes>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
