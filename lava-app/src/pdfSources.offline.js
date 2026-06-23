import safetyPdf from '../public/MANUALS/SAFETY MANUAL/SAFETY MANUAL.pdf?url';
import ppmPdf from '../public/MANUALS/PROJECT MANAGEMENT MANUAL/250919_Project Processes Manual_v0.1.pdf?url';
// To enable offline mode for the Communication Manual, place the PDF at:
// public/MANUALS/COMMUNICATION MANUAL/LAVA_CommunicationsManual_unapproved.pdf
// then uncomment the import below and set PDF_COMM = commPdf.
// import commPdf from '../public/MANUALS/COMMUNICATION MANUAL/LAVA_CommunicationsManual_unapproved.pdf?url';

export const PDF_SAFETY          = safetyPdf;
export const PDF_SAFETY_FALLBACK = null;
export const PDF_PPM             = ppmPdf;
export const PDF_PPM_FALLBACK    = null;
export const PDF_COMM            = null;
export const PDF_COMM_FALLBACK   = null;
