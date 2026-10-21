import { PDF_SAFETY, PDF_SAFETY_FALLBACK, PDF_PPM, PDF_PPM_FALLBACK, PDF_COMM, PDF_COMM_FALLBACK, PDF_REGEN, PDF_REGEN_FALLBACK, PDF_MATCARBON, PDF_MATCARBON_FALLBACK, PDF_GRAPHIC, PDF_GRAPHIC_FALLBACK, PDF_COMPETITION_DES, PDF_COMPETITION_DES_FALLBACK, PDF_OFFICE_GUIDELINES, PDF_OFFICE_GUIDELINES_FALLBACK } from '#pdf-sources';

const PATH_MAP = {
  '/MANUALS/SAFETY%20MANUAL/SAFETY%20MANUAL.pdf': PDF_SAFETY,
  '/MANUALS/PROJECT%20MANAGEMENT%20MANUAL/250919_Project%20Processes%20Manual_v0.1.pdf': PDF_PPM,
  '/MANUALS/COMMUNICATION%20MANUAL/LAVA_CommunicationsManual_unapproved.pdf': PDF_COMM,
  '/MANUALS/LAVA%20ZERO/2ndEditionRegenerative_Design_and_Development.pdf': PDF_REGEN,
  '/MANUALS/LAVA%20ZERO/02_260610_L0_MaterialityAndEmbodiedCarbon.pdf': PDF_MATCARBON,
  '/MANUALS/DESIGN%20MANUAL/260205_GRAPHIC%20GUIDELINES.pdf': PDF_GRAPHIC,
  '/MANUALS/DESIGN%20MANUAL/260205_COMPETITION%20GUIDELINES.pdf': PDF_COMPETITION_DES,
  '/MANUALS/LAVA%20ZERO/07_Office%20Guidelines/LAVAzero_Office%20Guidelines.pdf': PDF_OFFICE_GUIDELINES,
};

const FALLBACK_MAP = {
  '/MANUALS/SAFETY%20MANUAL/SAFETY%20MANUAL.pdf': PDF_SAFETY_FALLBACK,
  '/MANUALS/PROJECT%20MANAGEMENT%20MANUAL/250919_Project%20Processes%20Manual_v0.1.pdf': PDF_PPM_FALLBACK,
  '/MANUALS/COMMUNICATION%20MANUAL/LAVA_CommunicationsManual_unapproved.pdf': PDF_COMM_FALLBACK,
  '/MANUALS/LAVA%20ZERO/2ndEditionRegenerative_Design_and_Development.pdf': PDF_REGEN_FALLBACK,
  '/MANUALS/LAVA%20ZERO/02_260610_L0_MaterialityAndEmbodiedCarbon.pdf': PDF_MATCARBON_FALLBACK,
  '/MANUALS/DESIGN%20MANUAL/260205_GRAPHIC%20GUIDELINES.pdf': PDF_GRAPHIC_FALLBACK,
  '/MANUALS/DESIGN%20MANUAL/260205_COMPETITION%20GUIDELINES.pdf': PDF_COMPETITION_DES_FALLBACK,
  '/MANUALS/LAVA%20ZERO/07_Office%20Guidelines/LAVAzero_Office%20Guidelines.pdf': PDF_OFFICE_GUIDELINES_FALLBACK,
};

export function resolvePdfPath(path) {
  if (!path) return path;
  return PATH_MAP[path] ?? path;
}

export function resolveFallbackPath(path) {
  if (!path) return null;
  return FALLBACK_MAP[path] ?? null;
}

// pdf.js needs these to decode JPEG 2000 images and ICC colour profiles;
// without them such images are silently skipped. Keep as one shared object
// so react-pdf doesn't reload the document on every render.
export const PDF_OPTIONS = {
  wasmUrl: '/pdfjs/wasm/',
  iccUrl: '/pdfjs/iccs/',
};
