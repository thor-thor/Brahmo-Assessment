'use client';

import { useState } from 'react';
import StatusBadge from './StatusBadge';
import { DiagnosticEntry } from '@/lib/pipeline/types';

interface DiagnosticsDrawerProps {
  diagnostics: DiagnosticEntry[];
  totalCitations: number;
}

export default function DiagnosticsDrawer({ diagnostics, totalCitations }: DiagnosticsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showVerified, setShowVerified] = useState(false);

  const verifiedCount = diagnostics.filter(d => d.finalStatus === 'VERIFIED').length;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-3 p-3 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors duration-200 flex items-center justify-center gap-2 text-slate-700 font-medium text-sm"
      >
        <span>📊</span>
        <span>View {totalCitations} citation diagnostics</span>
      </button>
    );
  }

  const problemCitations = diagnostics.filter(d => d.finalStatus === 'CORRECTED' || d.finalStatus === 'REMOVED' || d.finalStatus === 'UNVERIFIED');
  const allVerified = diagnostics.filter(d => d.finalStatus === 'VERIFIED');

  return (
    <div className="mt-4 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔍</span>
          <h3 className="text-base font-bold text-slate-800">Citation Diagnostics</h3>
          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
            {totalCitations} entries
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {problemCitations.map((entry, index) => (
          <div
            key={`problem-${index}`}
            className="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="font-mono text-sm text-slate-800 font-medium break-all">
                {entry.citationText}
              </div>
              <StatusBadge status={entry.finalStatus} />
            </div>

            <div className="space-y-1 pl-1">
              {entry.steps.map((step, stepIndex) => (
                <div
                  key={stepIndex}
                  className="text-xs text-slate-600 flex items-start gap-2"
                >
                  <span className="text-slate-400 mt-0.5">•</span>
                  <span className={step.includes('Pre-filter rejected') || step.includes('Pre-filter flagged') ? 'text-amber-600 font-medium' : ''}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {verifiedCount > 0 && (
          <div className="p-4 bg-emerald-50/30 border-t border-emerald-100">
            <button
              onClick={() => setShowVerified(!showVerified)}
              className="flex items-center gap-2 text-emerald-700 font-semibold text-sm hover:text-emerald-800 transition-colors"
            >
              <span>{showVerified ? '▼' : '▶'}</span>
              <span>{verifiedCount} citation{verifiedCount !== 1 ? 's' : ''} verified ✅</span>
            </button>
            
            {showVerified && (
              <div className="mt-3 space-y-3 pl-2">
                {allVerified.map((entry, index) => (
                  <div key={`verified-${index}`} className="p-3 bg-white rounded-lg border border-emerald-100">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="font-mono text-sm text-slate-800 font-medium break-all">
                        {entry.citationText}
                      </div>
                      <StatusBadge status={entry.finalStatus} />
                    </div>
                    <div className="space-y-1 pl-1">
                      {entry.steps.map((step, stepIndex) => (
                        <div
                          key={stepIndex}
                          className="text-xs text-slate-600 flex items-start gap-2"
                        >
                          <span className="text-slate-400 mt-0.5">•</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50/80 border-t border-slate-100 text-center">
        <button
          onClick={() => setIsOpen(false)}
          className="text-xs text-slate-600 hover:text-slate-800 font-medium"
        >
          Collapse diagnostics
        </button>
      </div>
    </div>
  );
}