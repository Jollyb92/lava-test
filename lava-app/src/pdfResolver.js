import { PDF_SAFETY, PDF_SAFETY_FALLBACK, PDF_PPM, PDF_PPM_FALLBACK } from '#pdf-sources';

const PATH_MAP = {
  '/MANUALS/SAFETY%20MANUAL/SAFETY%20MANUAL.pdf': PDF_SAFETY,
  '/MANUALS/PROJECT%20MANAGEMENT%20MANUAL/250919_Project%20Processes%20Manual_v0.1.pdf': PDF_PPM,
};

const FALLBACK_MAP = {
  '/MANUALS/SAFETY%20MANUAL/SAFETY%20MANUAL.pdf': PDF_SAFETY_FALLBACK,
  '/MANUALS/PROJECT%20MANAGEMENT%20MANUAL/250919_Project%20Processes%20Manual_v0.1.pdf': PDF_PPM_FALLBACK,
};

export function resolvePdfPath(path) {
  if (!path) return path;
  return PATH_MAP[path] ?? path;
}

export function resolveFallbackPath(path) {
  if (!path) return null;
  return FALLBACK_MAP[path] ?? null;
}
