'use client';

import { SectionAlert } from '@/lib/pipeline/types';
import StatusBadge from './StatusBadge';

interface SectionAlertsPanelProps {
  alerts: SectionAlert[];
}

export default function SectionAlertsPanel({ alerts }: SectionAlertsPanelProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="mb-6 p-5 bg-amber-50/70 border border-amber-200/80 rounded-xl shadow-sm animate-in fade-in duration-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">⚠️</span>
        <h3 className="text-base font-bold text-amber-800">
          Section Alerts — Repealed Law Detected
        </h3>
        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200 ml-auto">
          {alerts.length} Section{alerts.length > 1 ? 's' : ''} Converted
        </span>
      </div>

      <p className="text-xs text-amber-700/95 mb-3.5 leading-relaxed">
        Old Indian Penal Code (IPC), Code of Criminal Procedure (CrPC), or Indian Evidence Act (IEA) sections 
        have been automatically converted to their new Bharatiya Nyaya Sanhita (BNS), Bharatiya Nagarik Suraksha Sanhita (BNSS), 
        and Bharatiya Sakshya Adhiniyam (BSA) equivalents enforced on July 1, 2024.
      </p>

      <div className="overflow-hidden border border-amber-200/50 rounded-lg bg-white">
        <table className="min-w-full divide-y divide-amber-100 text-xs text-left">
          <thead className="bg-amber-50/50 text-amber-800 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2">Old Section (Repealed)</th>
              <th className="px-4 py-2">New Section (BNS/BNSS/BSA)</th>
              <th className="px-4 py-2">Conversion Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-50 text-gray-700">
            {alerts.map((alert, index) => (
              <tr key={index} className="hover:bg-amber-50/20 transition-colors">
                <td className="px-4 py-2.5 font-medium text-red-600 font-mono">
                  {alert.oldSection}
                </td>
                <td className="px-4 py-2.5 font-bold text-emerald-700 font-mono">
                  {alert.newSection}
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status="CORRECTED" className="text-[10px]" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}