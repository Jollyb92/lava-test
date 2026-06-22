import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './App.css';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export default function App() {
  const [file, setFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onFileChange = useCallback((e) => {
    const picked = e.target.files[0];
    if (picked) {
      setFile(picked);
      setPageNumber(1);
      setNumPages(null);
    }
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages: n }) => {
    setNumPages(n);
  }, []);

  const prev = () => setPageNumber(p => Math.max(1, p - 1));
  const next = () => setPageNumber(p => Math.min(numPages, p + 1));

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  return (
    <div className="app" tabIndex={0} onKeyDown={onKeyDown}>
      <div className="toolbar">
        <label className="file-btn">
          Open PDF
          <input type="file" accept=".pdf" onChange={onFileChange} hidden />
        </label>
        {numPages && (
          <>
            <button onClick={prev} disabled={pageNumber <= 1}>‹ Prev</button>
            <span className="page-info">{pageNumber} / {numPages}</span>
            <button onClick={next} disabled={pageNumber >= numPages}>Next ›</button>
          </>
        )}
      </div>

      <div className="viewer">
        {file ? (
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="msg">Loading PDF…</div>}
            error={<div className="msg error">Failed to load PDF.</div>}
          >
            <Page
              pageNumber={pageNumber}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              width={Math.min(window.innerWidth - 40, 1000)}
            />
          </Document>
        ) : (
          <div className="msg">Open a PDF file to get started.</div>
        )}
      </div>
    </div>
  );
}
