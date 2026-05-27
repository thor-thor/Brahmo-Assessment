import { Citation } from './pipeline/types';

export function detectHallucinations(citation: Citation): {
  status: 'HALLUCINATED' | 'SUSPICIOUS' | 'PASS';
  reason?: string;
} {
  return { status: 'PASS' };
}