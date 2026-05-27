import { Citation, VerificationResult, DiagnosticEntry } from './types';
import { prefilterCitation } from './prefilter';
import { correctCitationFormat } from './verify';

export function buildDiagnostics(
  citations: Citation[],
  verificationResults: VerificationResult[]
): DiagnosticEntry[] {
  return citations.map((citation, index) => {
    const result = verificationResults[index];
    const steps: string[] = [];

    // 1. Prefilter step
    const prefilter = prefilterCitation(citation);
    if (prefilter.action === 'REMOVE' && prefilter.ruleTriggered) {
      steps.push(`🔴 Pre-filter REMOVED: ${prefilter.ruleTriggered}`);
      if (prefilter.reason) {
        steps.push(`   Reason: ${prefilter.reason}`);
      }
      steps.push(`   No API call made - impossible citation caught early`);
    } else if (prefilter.action === 'FLAG_SUSPICIOUS' && prefilter.ruleTriggered) {
      steps.push(`⚠️ Pre-filter FLAGGED: ${prefilter.ruleTriggered}`);
      if (prefilter.reason) {
        steps.push(`   Reason: ${prefilter.reason}`);
      }
      steps.push(`   Proceeding to verification with caution`);
    } else {
      steps.push(`✓ Pre-filter passed: Citation looks valid by format rules`);
    }

    steps.push('');
    steps.push('→ Verification against Indian Kanoon:');

    // 2. Verification step based on status
    if (result.status === 'VERIFIED') {
      steps.push(`✅ VERIFIED: Citation exists in Indian Kanoon`);
      if (result.caseName) {
        steps.push(`   Case: ${result.caseName}`);
      }
      if (result.ikDocId) {
        steps.push(`   IK Doc ID: ${result.ikDocId}`);
      }
      steps.push(`   Status: Citation is safe to use`);
    } else if (result.status === 'CORRECTED') {
      steps.push(`⚠️ CORRECTED: Citation had formatting issues but case exists`);
      steps.push(`   Original: ${result.citationText}`);
      if (result.correctedText) {
        steps.push(`   Corrected to: ${result.correctedText}`);
      }
      if (result.correctionReason) {
        steps.push(`   Reason: ${result.correctionReason}`);
      }
      if (result.caseName) {
        steps.push(`   Case: ${result.caseName}`);
      }
      steps.push(`   Status: Use corrected citation to avoid formatting confusion`);
    } else if (result.status === 'UNVERIFIED') {
      steps.push(`⚠️ UNVERIFIED: Citation format is valid but not in IK database`);
      steps.push(`   Reason: ${result.reason || 'Citation not found in Indian Kanoon'}`);
      steps.push(`   Status: Needs manual verification (may be recent, regional, or unreported)`);
    } else if (result.status === 'REMOVED') {
      steps.push(`❌ REMOVED: Citation is fabricated or impossible`);
      if (result.prefilter?.action === 'REMOVE') {
        steps.push(`   Reason: Pre-filter caught impossible citation`);
        if (result.reason) {
          steps.push(`   Details: ${result.reason}`);
        }
      } else if (result.prefilter?.action === 'FLAG_SUSPICIOUS') {
        steps.push(`   Reason: Suspicious pattern confirmed - not in database`);
        if (result.reason) {
          steps.push(`   Details: ${result.reason}`);
        }
      } else {
        steps.push(`   Reason: ${result.reason || 'Not found in Indian Kanoon after all checks'}`);
      }
      steps.push(`   Status: EXCLUDED from final output for safety`);
    }

    steps.push('');
    steps.push(`📊 Final Status: ${result.status}`);

    return {
      citationText: citation.text,
      steps,
      finalStatus: result.status
    };
  });
}

export function generateStatusBadge(status: string): string {
  const badges: Record<string, string> = {
    VERIFIED: '✅ VERIFIED',
    CORRECTED: '⚠️ CORRECTED',
    UNVERIFIED: '⚠️ UNVERIFIED',
    REMOVED: '❌ REMOVED'
  };
  return badges[status] || '❓ UNKNOWN';
}