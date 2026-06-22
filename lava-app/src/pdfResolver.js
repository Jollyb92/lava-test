import { PDF_SAFETY, PDF_PPM } from '#pdf-sources';

// Maps original public-folder paths to bundled data URLs (offline build only).
// In dev mode these are null, so the map is effectively empty.
const BUNDLED = {
  '/MANUALS/SAFETY%20MANUAL/SAFETY%20MANUAL.pdf': PDF_SAFETY,
  '/MANUALS/PROJECT%20MANAGEMENT%20MANUAL/250919_Project%20Processes%20Manual_v0.1.pdf': PDF_PPM,
};

const base = (import.meta.env.VITE_PDF_BASE || '').replace(/\/$/, '');

export function resolvePdfPath(path) {
  if (!path) return path;
  // Offline build: return the bundled data URL
  const bundled = BUNDLED[path];
  if (bundled) return bundled;
  // Dev/prod: prepend VITE_PDF_BASE if set, otherwise serve from public folder
  return base ? `${base}${path}` : path;
}
