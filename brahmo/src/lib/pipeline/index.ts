export { extractCitations } from './extract';
export { prefilterCitation, countPrefilterSavings } from './prefilter';
export { verifyCitation, verifyCitationsParallel, correctCitationFormat, getCacheMetrics, resetCacheMetrics, calculateCost } from './verify';
export { normalizeSections } from './section-normalizer';
export { buildDiagnostics, generateStatusBadge } from './diagnostics';
export { annotateCitations } from './annotate';
export type { Citation, VerificationResult, VerificationReport, SectionAlert, PrefilterResult, DiagnosticEntry, CitationStatus } from './types';