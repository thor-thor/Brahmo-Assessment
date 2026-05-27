import { Citation, VerificationResult, VerificationReport } from './types';

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function removeSentenceContaining(text: string, fragment: string): string {
  const escaped = escapeRegex(fragment);
  const sentenceRegex = new RegExp(`[^.!?\\n]*${escaped}[^.!?\\n]*[.!?]`, 'g');
  let cleaned = text.replace(sentenceRegex, '');
  if (cleaned === text) {
    // fallback to removing just the citation text and collapsing spaces/punctuation
    cleaned = cleaned.replace(new RegExp(escaped, 'g'), '');
    cleaned = cleaned.replace(/\s{2,}/g, ' ').replace(/\s+([.,!?;:])/g, '$1');
  }
  return cleaned.trim();
}

export function annotateCitations(
  originalText: string,
  citations: Citation[],
  verificationResults: VerificationResult[],
  sectionAlerts?: { oldSection: string; newSection: string; oldAct: string; newAct: string; reason: 'REPEALED' | 'RENUMBERED' }[]
): {
  annotatedText: string;
  report: VerificationReport;
} {
  const annotatedMatches = citations.map((citation, index) => ({
    citation,
    result: verificationResults[index]
  })).filter(m => m.result !== undefined);

  // Sort by position descending to preserve indices during replacement
  const sortedMatches = [...annotatedMatches].sort((a, b) => b.citation.position - a.citation.position);

  let annotatedText = originalText;

  for (const { citation, result } of sortedMatches) {
    const start = citation.position;
    const end = start + citation.text.length;

    if (annotatedText.substring(start, end) !== citation.text) {
      console.warn(`Text mismatch at position ${start}: expected "${citation.text}", found "${annotatedText.substring(start, end)}"`);
      continue;
    }

    const { status, caseName, ikDocId, reason, correctedText, correctionReason } = result;
    let badgeHtml = '';

    switch (status) {
      case 'VERIFIED':
        badgeHtml = `<span class="citation-badge verified inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors" data-status="VERIFIED" data-citation="${citation.text}" data-casename="${caseName || ''}" data-ikid="${ikDocId || ''}">✅ ${citation.text}</span>`;
        break;

      case 'CORRECTED':
        const correctedDisplay = correctedText || citation.text;
        const reasonText = correctionReason || '';
        badgeHtml = `<span class="citation-badge corrected inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors" data-status="CORRECTED" data-original="${citation.text}" data-corrected="${correctedText || ''}" data-correction-reason="${correctionReason || ''}" data-casename="${caseName || ''}" data-ikid="${ikDocId || ''}"><span class="line-through opacity-70">${citation.text}</span> → ${correctedDisplay}</span>`;
        break;

      case 'UNVERIFIED':
        badgeHtml = `<span class="citation-badge unverified inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors" data-status="UNVERIFIED" data-citation="${citation.text}" data-reason="${reason || 'Not found in Indian Kanoon'}">⚠️ ${citation.text}</span>`;
        break;

      case 'REMOVED':
        // Remove removed citations from the final output and preserve them only in diagnostics
        annotatedText = removeSentenceContaining(annotatedText, citation.text);
        continue;

      default:
        badgeHtml = `<span class="citation-badge unknown inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">${citation.text}</span>`;
        break;
    }

    annotatedText = annotatedText.substring(0, start) + badgeHtml + annotatedText.substring(end);
  }

  // Calculate report metrics
  const totalFound = verificationResults.length;
  const preFilterRemoved = verificationResults.filter(r => r.prefilter?.action === 'REMOVE').length;
  const verified = verificationResults.filter(r => r.status === 'VERIFIED').length;
  const corrected = verificationResults.filter(r => r.status === 'CORRECTED').length;
  const unverified = verificationResults.filter(r => r.status === 'UNVERIFIED').length;
  const removed = verificationResults.filter(r => r.status === 'REMOVED').length;

  // Accuracy = (verified + corrected) / (total - prefilter_removed) × 100
  const denominatorForAccuracy = totalFound - preFilterRemoved;
  const accuracy = denominatorForAccuracy > 0 
    ? ((verified + corrected) / denominatorForAccuracy) * 100 
    : 0;

  const report: VerificationReport = {
    totalFound,
    verified,
    corrected,
    unverified,
    removed,
    preFilterRemoved,
    accuracy: Math.round(accuracy * 10) / 10, // Round to 1 decimal
    ikApiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    estimatedCost: 0,
    savedCost: 0
  };

  annotatedText = annotatedText
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return {
    annotatedText,
    report
  };
}