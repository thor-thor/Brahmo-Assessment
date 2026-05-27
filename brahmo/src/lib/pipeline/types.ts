export type CitationStatus = 'VERIFIED' | 'CORRECTED' | 'UNVERIFIED' | 'REMOVED';

export interface Citation {
  type: string;
  text: string;
  year?: number;
  volume?: number;
  page?: number;
  position: number;
}

export interface PrefilterResult {
  action: 'REMOVE' | 'FLAG_SUSPICIOUS' | 'PROCEED';
  reason?: string;
  ruleTriggered?: string;
}

export interface VerificationResult {
  citationText: string;
  status: CitationStatus;
  caseName?: string;
  ikDocId?: number;
  matchedPage?: number;
  reason?: string;
  correctedText?: string;
  correctionReason?: string;
  prefilter?: PrefilterResult;
  apiCallMade?: boolean;
  cachedResult?: boolean;
}

export interface SectionAlert {
  oldSection: string;
  newSection: string;
  oldAct: string;
  newAct: string;
  reason: 'REPEALED' | 'RENUMBERED';
}

export interface VerificationReport {
  totalFound: number;
  verified: number;
  corrected: number;
  unverified: number;
  removed: number;
  preFilterRemoved: number;
  accuracy: number;
  ikApiCalls: number;
  cacheHits: number;
  cacheMisses: number;
  estimatedCost: number;
  savedCost: number;
}

export interface DiagnosticEntry {
  citationText: string;
  steps: string[];
  finalStatus: CitationStatus;
}