import { Routes, Route } from 'react-router-dom';
import DiagramPage from './DiagramPage.jsx';
import DetailPage from './DetailPage.jsx';
import TocPage from './TocPage.jsx';
import GlossaryPage from './GlossaryPage.jsx';
import InvolvedPage from './InvolvedPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/"           element={<DiagramPage />} />
      <Route path="/toc"        element={<TocPage />} />
      <Route path="/glossary"   element={<GlossaryPage />} />
      <Route path="/involved"   element={<InvolvedPage />} />
      <Route path="/detail/:id" element={<DetailPage />} />
    </Routes>
  );
}
