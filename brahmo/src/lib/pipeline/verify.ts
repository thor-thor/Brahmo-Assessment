import { supabase, isSandboxMode } from '../supabase';
import { Citation, VerificationResult, PrefilterResult } from './types';

const INDIAN_KANOON_API_KEY = process.env.INDIAN_KANOON_API_KEY;
const INDIAN_KANOON_BASE_URL = 'https://api.indiankanoon.org';
const COST_PER_API_CALL = 0.3;

export function correctCitationFormat(text: string): { correctedText: string; isCorrected: boolean; correctionReason?: string } {
  let corrected = text.trim();
  let isCorrected = false;
  const reasons: string[] = [];

  // Fix missing space between citation type and page (SCC123 → SCC 123)
  const missingSpaceRegex = /(SCC|SCR|Cri\s+LJ)(\d+)/g;
  if (missingSpaceRegex.test(corrected)) {
    corrected = corrected.replace(missingSpaceRegex, '$1 $2');
    isCorrected = true;
    reasons.push('added missing space between citation type and page');
  }

  // Fix SCC Online → SCC OnLine
  const onlineRegex = /SCC\s+Online/gi;
  if (/SCC\s+Online/i.test(corrected) && !/SCC\s+OnLine/.test(corrected)) {
    corrected = corrected.replace(onlineRegex, 'SCC OnLine');
    isCorrected = true;
    reasons.push('corrected SCC Online to SCC OnLine');
  }

  // Fix space between parentheses and year: (2023) 5 SCC123 → (2023) 5 SCC 123
  const parenthesesRegex = /\(\s*(\d{4})\s*\)\s*(\d{1,2})\s+(SCC|SCR|Cri\s+LJ)(\d+)/g;
  if (parenthesesRegex.test(corrected)) {
    corrected = corrected.replace(parenthesesRegex, '($1) $2 $3 $4');
    isCorrected = true;
    if (!reasons.includes('formatted citation spacing')) {
      reasons.push('formatted citation spacing');
    }
  }

  // Fix AIR Delhi → AIR Del
  const airDelhiRegex = /\bAIR\s+(\d{4})\s+Delhi\s+/gi;
  if (airDelhiRegex.test(corrected)) {
    corrected = corrected.replace(airDelhiRegex, 'AIR $1 Del ');
    isCorrected = true;
    reasons.push('corrected AIR Delhi to AIR Del');
  }

  // Fix court name abbreviations
  const courtReplacements: Record<string, string> = {
    'delhi': 'Del',
    'bombay': 'Bom',
    'calcutta': 'Cal',
    'madras': 'Mad',
    'allahabad': 'All',
    'karnataka': 'Kar',
    'kerala': 'Ker',
    'patna': 'Pat',
    'rajasthan': 'Raj',
    'madhya pradesh': 'MP',
    'andhra pradesh': 'AP',
    'gujarat': 'Guj',
    'punjab': 'Pun',
    'west bengal': 'WB',
    'tamil nadu': 'TN',
    'uttarakhand': 'Uk'
  };

  for (const [fullCourt, shortCode] of Object.entries(courtReplacements)) {
    const courtRegex = new RegExp(`\\b${fullCourt}\\b`, 'gi');
    if (courtRegex.test(corrected)) {
      corrected = corrected.replace(courtRegex, shortCode);
      isCorrected = true;
      reasons.push(`corrected court abbreviation: ${fullCourt} to ${shortCode}`);
    }
  }

  // Fix capitalization inconsistencies
  const originalLower = text.toLowerCase();
  const correctedLower = corrected.toLowerCase();
  if (originalLower === correctedLower && text !== corrected) {
    isCorrected = true;
    if (!reasons.includes('normalized capitalization')) {
      reasons.push('normalized capitalization');
    }
  }

  return { 
    correctedText: corrected, 
    isCorrected, 
    correctionReason: reasons.length > 0 ? reasons.join('; ') : undefined 
  };
}

// Mock database for sandbox mode testing
const MOCK_KANOON_DB: Record<string, { title: string; docid: number }> = {
  '(2021) 10 SCC 1': { title: 'Siddharth vs State Of Uttar Pradesh', docid: 195847623 },
  '(2022) 10 SCC 51': { title: 'Satender Kumar Antil vs Central Bureau Of Investigation', docid: 185404561 },
  '(2014) 8 SCC 273': { title: 'Arnesh Kumar vs State Of Bihar', docid: 1234567 },
  '(2020) 5 SCC 1': { title: 'Sushila Aggarwal vs State (NCT Of Delhi)', docid: 2345678 },
  '(2024) 8 SCC 234': { title: 'Vikram Singh vs State Of Haryana', docid: 9876543 },
  '2024 SCC OnLine Del 3456': { title: 'Vikram Singh vs State of Delhi & Anr.', docid: 3456789 },
  'AIR 2024 Del 234': { title: 'Amit Kumar vs Union of India', docid: 7654321 },
  '(2023) 5 SCC 123': { title: 'State vs Ram Singh & Ors.', docid: 888888 }
};

const VERIFICATION_CACHE = new Map<string, VerificationResult>();

let cacheHits = 0;
let cacheMisses = 0;

export function getCacheMetrics(): { hits: number; misses: number } {
  return { hits: cacheHits, misses: cacheMisses };
}

export function resetCacheMetrics(): void {
  cacheHits = 0;
  cacheMisses = 0;
}

async function checkCache(text: string): Promise<VerificationResult | null> {
  const normalizedText = text.toLowerCase();
  if (VERIFICATION_CACHE.has(normalizedText)) {
    cacheHits++;
    return VERIFICATION_CACHE.get(normalizedText) || null;
  }
  cacheMisses++;
  return null;
}

async function storeInCache(text: string, result: VerificationResult | null): Promise<void> {
  if (result) {
    VERIFICATION_CACHE.set(text.toLowerCase(), result);
  }
}

async function verifyIK(text: string): Promise<{ found: boolean; docid?: number; title?: string; apiCall: boolean }> {
  const cached = await checkCache(text);
  if (cached) {
    return {
      found: cached.status === 'VERIFIED' || cached.status === 'CORRECTED',
      docid: cached.ikDocId,
      title: cached.caseName,
      apiCall: false
    };
  }

  if (isSandboxMode) {
    // Simulate API call delay in sandbox
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 150));
    const matched = MOCK_KANOON_DB[text];
    if (matched) {
      await storeInCache(text, {
        citationText: text,
        status: 'VERIFIED',
        ikDocId: matched.docid,
        caseName: matched.title,
        apiCallMade: true,
        cachedResult: false
      } as VerificationResult);
      return { found: true, docid: matched.docid, title: matched.title, apiCall: true };
    } else {
      await storeInCache(text, {
        citationText: text,
        status: 'UNVERIFIED',
        reason: 'Citation not found in Indian Kanoon database',
        apiCallMade: true,
        cachedResult: false
      } as VerificationResult);
      return { found: false, apiCall: true };
    }
  }

  try {
    const searchResponse = await fetch(`${INDIAN_KANOON_BASE_URL}/search/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${INDIAN_KANOON_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ formInput: text })
    });

    if (!searchResponse.ok) {
      throw new Error(`Indian Kanoon API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    if (searchData.found > 0 && searchData.docs && searchData.docs.length > 0) {
      const docId = searchData.docs[0].docid;
      const metaResponse = await fetch(`${INDIAN_KANOON_BASE_URL}/docmeta/${docId}/`, {
        headers: {
          'Authorization': `Token ${INDIAN_KANOON_API_KEY}`
        }
      });

      if (!metaResponse.ok) {
        throw new Error(`Indian Kanoon meta API error: ${metaResponse.status}`);
      }

      const metaData = await metaResponse.json();
      await storeInCache(text, {
        citationText: text,
        status: 'VERIFIED',
        caseName: metaData.title,
        ikDocId: docId,
        apiCallMade: true,
        cachedResult: false
      } as VerificationResult);
      return { found: true, docid: docId, title: metaData.title, apiCall: true };
    } else {
      await storeInCache(text, null);
      return { found: false, apiCall: true };
    }
  } catch (error) {
    console.error('Error verifying citation against Indian Kanoon:', error);
      await storeInCache(text, {
        citationText: text,
        status: 'UNVERIFIED',
        reason: 'Citation verification failed due to IK API error',
        apiCallMade: true,
        cachedResult: false
      } as VerificationResult);
    return { found: false, apiCall: true };
  }
}

export async function verifyCitation(
  citation: Citation,
  prefilterResult?: PrefilterResult
): Promise<VerificationResult> {
  const originalText = citation.text;

  // If prefilter REMOVE: immediately return REMOVED
  if (prefilterResult?.action === 'REMOVE') {
    return {
      citationText: originalText,
      status: 'REMOVED',
      reason: prefilterResult.reason || 'Citation is impossible or fabricated',
      prefilter: prefilterResult,
      apiCallMade: false
    };
  }

  // Step 1: Try original text
  let verifyResult = await verifyIK(originalText);
  if (verifyResult.found) {
    return {
      citationText: originalText,
      status: 'VERIFIED',
      caseName: verifyResult.title,
      ikDocId: verifyResult.docid,
      prefilter: prefilterResult,
      apiCallMade: verifyResult.apiCall
    };
  }

  // Step 2: Try format-corrected version
  const { correctedText: formattedText, isCorrected: isFormatCorrected, correctionReason: formatCorrectionReason } = correctCitationFormat(originalText);
  
  if (isFormatCorrected && formattedText !== originalText) {
    verifyResult = await verifyIK(formattedText);
    if (verifyResult.found) {
      return {
        citationText: originalText,
        status: 'CORRECTED',
        caseName: verifyResult.title,
        ikDocId: verifyResult.docid,
        correctedText: formattedText,
        correctionReason: formatCorrectionReason,
        prefilter: prefilterResult,
        apiCallMade: verifyResult.apiCall
      };
    }
  }

  // Step 3: Try page correction for SCC citations
  let pageCorrectedText: string | undefined;
  let pageCorrectionReason: string | undefined;
  if (citation.type === 'SCC' && citation.year && citation.volume && citation.page) {
    const baseCitation = `(${citation.year}) ${citation.volume} SCC`;
    if (isSandboxMode) {
      // Try to find a match with different page number
      const match = Object.keys(MOCK_KANOON_DB).find(key =>
        key.startsWith(baseCitation + ' ') &&
        /^\s*\d+$/.test(key.substring(baseCitation.length + 1))
      );
      if (match) {
        const matchPage = parseInt(match.substring(baseCitation.length + 1), 10);
        if (matchPage !== citation.page) {
          pageCorrectedText = `${baseCitation} ${matchPage}`;
          pageCorrectionReason = `page corrected from ${citation.page} to ${matchPage}`;
        }
      }
    }
  }

  if (pageCorrectedText) {
    verifyResult = await verifyIK(pageCorrectedText);
    if (verifyResult.found) {
      return {
        citationText: originalText,
        status: 'CORRECTED',
        caseName: verifyResult.title,
        ikDocId: verifyResult.docid,
        correctedText: pageCorrectedText,
        correctionReason: pageCorrectionReason,
        prefilter: prefilterResult,
        apiCallMade: verifyResult.apiCall
      };
    }
  }

  // Step 4: No match found after all correction attempts
  if (prefilterResult?.action === 'FLAG_SUSPICIOUS') {
    return {
      citationText: originalText,
      status: 'UNVERIFIED',
      reason: prefilterResult.reason || 'Suspicious citation pattern not confirmed by IK',
      correctionReason: 'Citation looks plausible but was not found in Indian Kanoon',
      prefilter: prefilterResult,
      apiCallMade: false
    };
  }

  // Step 5: No match found - mark as UNVERIFIED (not REMOVED)
  return {
    citationText: originalText,
    status: 'UNVERIFIED',
    reason: 'Citation not found in Indian Kanoon database',
    prefilter: prefilterResult,
    apiCallMade: true
  };
}

export async function verifyCitationsParallel(
  citations: Citation[],
  prefilterResults: PrefilterResult[]
): Promise<VerificationResult[]> {
  const verificationPromises = citations.map((citation, index) =>
    verifyCitation(citation, prefilterResults[index])
  );
  return Promise.all(verificationPromises);
}

export function calculateCost(apiCalls: number): number {
  return apiCalls * COST_PER_API_CALL;
}