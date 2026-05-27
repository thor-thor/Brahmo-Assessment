'use client';

import StatusBadge from './StatusBadge';
import DiagnosticsDrawer from './DiagnosticsDrawer';
import { DiagnosticEntry, VerificationReport } from '@/lib/pipeline/types';

interface VerificationReportPanelProps {
  report: VerificationReport;
  diagnostics?: DiagnosticEntry[];
}

export default function VerificationReportPanel({ report, diagnostics }: VerificationReportPanelProps) {
  const savedApiCalls = Math.max(0, report.totalFound - report.ikApiCalls);
  const estimatedSavings = savedApiCalls * 0.3;

  return (
    <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-sm animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 mb-5 gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>📋</span> Citation Verification Report
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Deterministic legal citation verification pipeline
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Accuracy</span>
            <span className="text-xl font-black text-blue-600">
              {report.accuracy.toFixed(1)}%
            </span>
          </div>
          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                report.accuracy >= 90 ? 'bg-emerald-500' : report.accuracy >= 70 ? 'bg-blue-500' : 'bg-amber-500'
              }`}
              style={{ width: `${report.accuracy}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-5">
        <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Found</span>
          <span className="text-lg font-extrabold text-slate-800 mt-1 block">{report.totalFound}</span>
        </div>

        <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl shadow-xs text-center">
          <span className="text-[10px] font-bold text-emerald-600 uppercase block">Verified</span>
          <span className="text-lg font-extrabold text-emerald-700 mt-1 block">{report.verified}</span>
        </div>

        <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl shadow-xs text-center">
          <span className="text-[10px] font-bold text-amber-600 uppercase block">Corrected</span>
          <span className="text-lg font-extrabold text-amber-700 mt-1 block">{report.corrected}</span>
        </div>

        <div className="p-3 bg-slate-100/60 border border-slate-200/50 rounded-xl shadow-xs text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Unverified</span>
          <span className="text-lg font-extrabold text-slate-600 mt-1 block">{report.unverified}</span>
        </div>

        <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl shadow-xs text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-red-500 uppercase block">Removed</span>
          <span className="text-lg font-extrabold text-red-700 mt-1 block">{report.removed}</span>
        </div>
      </div>

      {/* Pre-filter stats */}
      {report.preFilterRemoved > 0 && (
        <div className="grid grid-cols-1 gap-4 mb-5">
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl shadow-xs text-center">
            <span className="text-[10px] font-bold text-blue-500 uppercase block">Pre-Filter Removed</span>
            <span className="text-lg font-extrabold text-blue-700 mt-1 block">{report.preFilterRemoved}</span>
          </div>
        </div>
      )}

      {/* Cost diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200/60 pt-4 text-xs">
        <div className="flex flex-col gap-1.5 text-slate-600">
          <div className="flex justify-between">
            <span>IK API Requests:</span>
            <span className="font-semibold text-slate-800">{report.ikApiCalls} call{report.ikApiCalls !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between">
            <span>Cache Hits:</span>
            <span className="font-semibold text-emerald-600">{report.cacheHits} hit{report.cacheHits !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex justify-between">
            <span>Estimated Cost:</span>
            <span className="font-bold text-slate-800 font-mono">₹{report.estimatedCost.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 text-slate-600 md:border-l md:border-slate-200/60 md:pl-4">
          <div className="flex justify-between">
            <span>Pre-Filter & Cache Savings:</span>
            <span className="font-semibold text-emerald-600">{savedApiCalls} call{savedApiCalls !== 1 ? 's' : ''} saved</span>
          </div>
          <div className="flex justify-between">
            <span>Saved API Cost:</span>
            <span className="font-bold text-emerald-600 font-mono">₹{estimatedSavings.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Diagnostics Drawer */}
      {diagnostics && diagnostics.length > 0 && (
        <DiagnosticsDrawer diagnostics={diagnostics} totalCitations={report.totalFound} />
      )}
    </div>
  );
}