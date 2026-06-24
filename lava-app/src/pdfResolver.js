import { PDF_SAFETY, PDF_SAFETY_FALLBACK, PDF_PPM, PDF_PPM_FALLBACK, PDF_COMM, PDF_COMM_FALLBACK, PDF_REGEN, PDF_REGEN_FALLBACK } from '#pdf-sources';

const PATH_MAP = {
  '/MANUALS/SAFETY%20MANUAL/SAFETY%20MANUAL.pdf': PDF_SAFETY,
  '/MANUALS/PROJECT%20MANAGEMENT%20MANUAL/250919_Project%20Processes%20Manual_v0.1.pdf': PDF_PPM,
  '/MANUALS/COMMUNICATION%20MANUAL/LAVA_CommunicationsManual_unapproved.pdf': PDF_COMM,
  '/MANUALS/LAVA%20ZERO/2ndEditionRegenerative_Design_and_Development.pdf': PDF_REGEN,
};

const FALLBACK_MAP = {
  '/MANUALS/SAFETY%20MANUAL/SAFETY%20MANUAL.pdf': PDF_SAFETY_FALLBACK,
  '/MANUALS/PROJECT%20MANAGEMENT%20MANUAL/250919_Project%20Processes%20Manual_v0.1.pdf': PDF_PPM_FALLBACK,
  '/MANUALS/COMMUNICATION%20MANUAL/LAVA_CommunicationsManual_unapproved.pdf': PDF_COMM_FALLBACK,
  '/MANUALS/LAVA%20ZERO/2ndEditionRegenerative_Design_and_Development.pdf': PDF_REGEN_FALLBACK,
};

export function resolvePdfPath(path) {
  if (!path) return path;
  return PATH_MAP[path] ?? path;
}

export function resolveFallbackPath(path) {
  if (!path) return null;
  return FALLBACK_MAP[path] ?? null;
}
