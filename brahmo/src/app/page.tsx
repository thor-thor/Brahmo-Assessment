'use client';

import { useState, useEffect } from 'react';
import MatterSelector from '@/components/MatterSelector';
import QueryInput from '@/components/QueryInput';
import ActionButtons from '@/components/ActionButtons';
import SectionAlertsPanel from '@/components/SectionAlertsPanel';
import ResponseComparison from '@/components/ResponseComparison';
import VerificationReportPanel from '@/components/VerificationReportPanel';
import { DiagnosticEntry, VerificationReport, SectionAlert } from '@/lib/pipeline/types';

interface CitationClickInfo {
  status: string | null;
  citation: string | null;
  caseName: string | null;
  ikId: string | null;
  reason: string | null;
  corrected: string | null;
  correctionReason: string | null;
}

export default function CitationSafetyEngine() {
  const [selectedMatter, setSelectedMatter] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [genericResponse, setGenericResponse] = useState('');
  const [verifiedResponse, setVerifiedResponse] = useState('');
  const [verificationReport, setVerificationReport] = useState<VerificationReport | null>(null);
  const [sectionAlerts, setSectionAlerts] = useState<SectionAlert[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<CitationClickInfo | null>(null);

  // Load matter when selected
  useEffect(() => {
    if (selectedMatter) {
      // In a real app, we would fetch the matter details from the database
      // For now, we'll set a sample query based on the matter
      const sampleQueries: Record<string, string> = {
        'Rajesh Kumar — Anticipatory Bail': 'Key SC precedents on anticipatory bail in economic offences',
        'Criminal Complaint — Cheating Case': 'Draft a complaint for cheating under Section 420 IPC with criminal breach of trust under Section 406 IPC',
        'NDPS Act Bail Research': 'Summarize SC approach to bail in NDPS cases over last 5 years',
        'Delhi HC Criminal Revision': 'Key Delhi HC decisions on Section 482 BNSS powers in last 2 years',
        'Corporate NDA Review': 'Review NDA and flag missing clauses for Indian law',
        'Shareholders Dispute': 'Grounds for NCLT petition — oppression and mismanagement',
        'Property Dispute': 'Specific performance of immovable property sale agreement',
        'Family Law': 'Grounds for contested divorce under Hindu Marriage Act Section 13'
      };
      
      const newQuery = sampleQueries[selectedMatter] || '';
      if (newQuery !== query) {
        setQuery(newQuery);
      }
    }
  }, [selectedMatter, query]);

  const handleAskGeneric = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, mode: 'generic' })
      });
      const data = await res.json();
      setGenericResponse(data.response || '');
    } catch (error) {
      console.error('Error calling generic AI:', error);
      setGenericResponse('Error generating response');
    } finally {
      setLoading(false);
    }
  };

  const handleAskVerified = async () => {
    setLoading(true);
    try {
      // Single API call that handles normalization and citation verification
      const verifiedRes = await fetch('/api/citation-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          mode: 'verified'
        })
      });

      if (!verifiedRes.ok) {
        const errorData = await verifiedRes.json();
        throw new Error(errorData.error || 'Failed to verify citations');
      }

      const verifiedData = await verifiedRes.json();
      setVerifiedResponse(verifiedData.annotatedText || '');
      setVerificationReport(verifiedData.report || null);
      setDiagnostics(verifiedData.diagnostics || []);
      setSectionAlerts(verifiedData.sectionAlerts || []);
    } catch (error) {
      console.error('Error calling verified AI:', error);
      setVerifiedResponse(`Error generating response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">BRAHMO Citation Safety Engine</h1>
          <p className="text-gray-600 mt-2">Making AI safe for lawyers by preventing hallucinated citations</p>
        </header>

        {/* Matter Selector */}
        <MatterSelector 
          onSelect={setSelectedMatter} 
          selected={selectedMatter}
        />

        {/* Query Input */}
        <QueryInput 
          value={query} 
          onChange={setQuery} 
          placeholder="Enter your legal question..."
        />

        {/* Action Buttons */}
        <ActionButtons 
          onAskGeneric={handleAskGeneric}
          onAskVerified={handleAskVerified}
          loading={loading}
        />

        {/* Section Alerts Panel */}
        {sectionAlerts.length > 0 && (
          <SectionAlertsPanel alerts={sectionAlerts} />
        )}

        {/* Response Comparison */}
        <ResponseComparison
          genericResponse={genericResponse}
          verifiedResponse={verifiedResponse}
          onSelectCitation={setSelectedCitation}
        />

        {/* Verification Report */}
        {verificationReport && (
          <VerificationReportPanel report={verificationReport} diagnostics={diagnostics} />
        )}

        {/* Citation Details Modal */}
        {selectedCitation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-lg p-6 mx-4 relative">
              <button 
                onClick={() => setSelectedCitation(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex items-center gap-2.5 mb-4">
                <span className="text-xl">⚖️</span>
                <h3 className="text-xl font-bold text-gray-900 pr-6 leading-snug">
                  Citation Diagnostic Panel
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-gray-400 block mb-1">Status</span>
                  {selectedCitation.status === 'VERIFIED' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm font-semibold">
                      <span className="text-emerald-500">✅</span>
                      <span>Verified Case Exists</span>
                    </div>
                  )}
                  {selectedCitation.status === 'CORRECTED' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm font-semibold">
                      <span className="text-amber-500">⚠️</span>
                      <span>Format Corrected & Verified</span>
                    </div>
                  )}
                  {selectedCitation.status === 'REMOVED' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm font-semibold">
                      <span className="text-red-500">❌</span>
                      <span>Fabricated Case Removed</span>
                    </div>
                  )}
                  {selectedCitation.status === 'UNVERIFIED' && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 text-gray-800 rounded-lg text-sm font-semibold">
                      <span className="text-gray-500">⚠️</span>
                      <span>Unverified (API Lookup Failed)</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 block">Cited Citation</span>
                    <span className="font-bold text-gray-800 font-mono">{selectedCitation.citation}</span>
                  </div>
                  {selectedCitation.corrected && (
                    <div>
                      <span className="text-xs font-semibold text-gray-400 block">Corrected Format</span>
                      <span className="font-bold text-amber-700 font-mono">{selectedCitation.corrected}</span>
                    </div>
                  )}
                  {selectedCitation.correctionReason && (
                    <div className="col-span-2">
                      <span className="text-xs font-semibold text-gray-400 block">Correction Reason</span>
                      <span className="font-medium text-amber-700">{selectedCitation.correctionReason}</span>
                    </div>
                  )}
                  {selectedCitation.ikId && (
                    <div className="col-span-2 border-t border-gray-200/50 pt-2 mt-1">
                      <span className="text-xs font-semibold text-gray-400 block">Indian Kanoon ID</span>
                      <span className="font-mono text-gray-800">{selectedCitation.ikId}</span>
                    </div>
                  )}
                </div>

                {selectedCitation.caseName && selectedCitation.status !== 'REMOVED' && (
                  <div>
                    <span className="text-xs uppercase tracking-wider font-bold text-gray-400 block mb-1">Case Title</span>
                    <p className="text-base font-bold text-gray-900 leading-snug">
                      {selectedCitation.caseName}
                    </p>
                  </div>
                )}

                {selectedCitation.reason && (
                  <div className="p-3 bg-red-50/50 rounded-lg border border-red-100/50 text-sm text-red-700">
                    <span className="font-semibold block mb-0.5">Diagnostic Report:</span>
                    <p className="leading-relaxed">{selectedCitation.reason}</p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-2">
                  <a 
                    href={selectedCitation.ikId 
                      ? `https://indiankanoon.org/doc/${selectedCitation.ikId}/`
                      : `https://indiankanoon.org/search/?formInput=${encodeURIComponent(selectedCitation.corrected || selectedCitation.citation || '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>View Case in Indian Kanoon</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                  <button 
                    onClick={() => setSelectedCitation(null)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}