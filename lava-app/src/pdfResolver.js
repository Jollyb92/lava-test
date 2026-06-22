import { PDF_SAFETY, PDF_PPM } from '#pdf-sources';

const PATH_MAP = {
  '/MANUALS/SAFETY%20MANUAL/SAFETY%20MANUAL.pdf': PDF_SAFETY,
  '/MANUALS/PROJECT%20MANAGEMENT%20MANUAL/250919_Project%20Processes%20Manual_v0.1.pdf': PDF_PPM,
};

export function resolvePdfPath(path) {
  if (!path) return path;
  return PATH_MAP[path] || path;
}
