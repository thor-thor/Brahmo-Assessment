import { Citation, PrefilterResult } from './types';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Prefilter citations to catch impossible ones before IK API calls
 * REMOVE: Citation is impossible/fabricated (year, volume, page)
 * FLAG_SUSPICIOUS: Pattern looks suspicious but needs human verification
 * PROCEED: Looks valid, proceed to IK verification
 */
export function prefilterCitation(citation: Citation): PrefilterResult {
  const { year, volume, page, type } = citation;

  // REMOVE: Future years are impossible
  if (year && year > CURRENT_YEAR) {
    return {
      action: 'REMOVE',
      reason: `Future year: ${year} (Indian cases cannot exceed current legal boundaries)`,
      ruleTriggered: 'FUTURE_YEAR'
    };
  }

  // REMOVE: Impossible SCC volume (SCC publishes ~20-25 volumes per year at max)
  if (type === 'SCC' && volume && volume > 25) {
    return {
      action: 'REMOVE',
      reason: `Impossible volume: ${volume} SCC (SCC publishes maximum 20-25 volumes per year)`,
      ruleTriggered: 'IMPOSSIBLE_SCC_VOLUME'
    };
  }

  // REMOVE: Pre-1900 dates for modern citation types
  if (year && year < 1900) {
    const pre1900Types = ['SCC', 'SCC_OnLine', 'Cri_LJ', 'SCR'];
    if (pre1900Types.includes(type)) {
      return {
        action: 'REMOVE',
        reason: `Pre-modern date: ${year} (citation type ${type} did not exist prior to 1900)`,
        ruleTriggered: 'PRE1900_YEAR'
      };
    }
  }

  // FLAG_SUSPICIOUS: Unusually large page number
  if (page && page > 5000) {
    return {
      action: 'FLAG_SUSPICIOUS',
      reason: `Unusually large page number: ${page} (verify if correct)`,
      ruleTriggered: 'IMPOSSIBLE_PAGE'
    };
  }

  // FLAG_SUSPICIOUS: High page number for low volume (pattern matching fake SCC)
  if (type === 'SCC' && volume && page && volume < 10 && page > 500) {
    return {
      action: 'FLAG_SUSPICIOUS',
      reason: `Unusually high page number for low volume: ${page} in volume ${volume}`,
      ruleTriggered: 'FAKE_SCC_PATTERN'
    };
  }

  // FLAG_SUSPICIOUS: Unusually high AIR page number
  if (type === 'AIR' && page && page > 500) {
    return {
      action: 'FLAG_SUSPICIOUS',
      reason: `Unusually high page number for AIR: ${page}`,
      ruleTriggered: 'FAKE_AIR_PATTERN'
    };
  }

  // Looks valid, proceed to IK verification
  return { action: 'PROCEED' };
}

export function countPrefilterSavings(results: PrefilterResult[]): { removed: number; suspicious: number } {
  const removed = results.filter(r => r.action === 'REMOVE').length;
  const suspicious = results.filter(r => r.action === 'FLAG_SUSPICIOUS').length;
  return { removed, suspicious };
}