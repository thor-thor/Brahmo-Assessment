import { Citation, VerificationResult, SectionAlert, VerificationReport } from './pipeline/types';
import { annotateCitations as annotateCitationsPipeline } from './pipeline/annotate';

export function annotateCitations(
  originalText: string,
  citations: Citation[],
  verificationResults: VerificationResult[],
  sectionAlerts?: SectionAlert[]
): {
  annotatedText: string;
  report: VerificationReport;
} {
  // Section alerts are for informational purposes only and don't affect annotation
  // The actual annotation is done by the pipeline function
  const result = annotateCitationsPipeline(originalText, citations, verificationResults);
  return result;
}