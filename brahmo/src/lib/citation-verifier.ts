import { Citation, VerificationResult } from './pipeline/types';
import { verifyCitation, verifyCitationsParallel, correctCitationFormat } from './pipeline/verify';

export { verifyCitation, verifyCitationsParallel, correctCitationFormat };
export type { Citation, VerificationResult };