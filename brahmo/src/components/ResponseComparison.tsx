'use client';

import StatusBadge from './StatusBadge';

interface CitationClickInfo {
  status: string | null;
  citation: string | null;
  caseName: string | null;
  ikId: string | null;
  reason: string | null;
  corrected: string | null;
  correctionReason: string | null;
}

export default function ResponseComparison({
  genericResponse,
  verifiedResponse,
  onSelectCitation
}: {
  genericResponse: string;
  verifiedResponse: string;
  onSelectCitation?: (info: CitationClickInfo) => void;
}) {

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const badge = target.closest('.citation-badge');

    if (badge && onSelectCitation) {
      const status = badge.getAttribute('data-status');
      const citation = badge.getAttribute('data-citation');
      const caseName = badge.getAttribute('data-casename');
      const ikId = badge.getAttribute('data-ikid');
      const reason = badge.getAttribute('data-reason');
      const corrected = badge.getAttribute('data-corrected');
      const correctionReason = badge.getAttribute('data-correction-reason');

      onSelectCitation({ status, citation, caseName, ikId, reason, corrected, correctionReason });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Generic AI panel */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            Generic AI Response
          </h3>
          <StatusBadge status="UNVERIFIED" className="text-[10px]" />
        </div>

        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed min-h-[300px]">
          {genericResponse ? (
            genericResponse
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-400">
              <svg className="w-12 h-12 mb-2 stroke-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 11-18 0z" />
              </svg>
              <span>Click "Ask Generic AI" to generate a response</span>
            </div>
          )}
        </div>
      </div>

      {/* Verified AI panel */}
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Verified Response
          </h3>
          <StatusBadge status="VERIFIED" className="text-[10px]" />
        </div>

        <div
          onClick={handleContainerClick}
          className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed min-h-[300px]"
        >
          {verifiedResponse ? (
            <div dangerouslySetInnerHTML={{ __html: verifiedResponse }} />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-400">
              <svg className="w-12 h-12 mb-2 stroke-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Click "Ask with Citation Verification" to check citations</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}