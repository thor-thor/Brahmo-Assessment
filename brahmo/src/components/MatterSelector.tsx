'use client';

import { useState } from 'react';

interface LegalMatter {
  id?: number;
  matter_name: string;
  practice_area?: string;
  court?: string;
  description?: string;
  sample_query: string;
}

export default function MatterSelector({
  onSelect,
  selected,
  matters = []
}: {
  onSelect: (matterName: string, query: string) => void;
  selected: string | null;
  matters?: LegalMatter[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  const displayMatters: LegalMatter[] = matters.length > 0 ? matters : [
    { matter_name: 'Rajesh Kumar — Anticipatory Bail', sample_query: 'Key SC precedents on anticipatory bail in economic offences', practice_area: 'Criminal', court: 'Supreme Court' },
    { matter_name: 'Criminal Complaint — Cheating Case', sample_query: 'Draft a complaint for cheating under Section 420 IPC with criminal breach of trust under Section 406 IPC', practice_area: 'Criminal', court: 'District Court' },
    { matter_name: 'NDPS Act Bail Research', sample_query: 'Summarize SC approach to bail in NDPS cases over last 5 years', practice_area: 'Criminal', court: 'Supreme Court' },
    { matter_name: 'Delhi HC Criminal Revision', sample_query: 'Key Delhi HC decisions on Section 482 BNSS powers in last 2 years', practice_area: 'Criminal', court: 'Delhi High Court' },
    { matter_name: 'Corporate NDA Review', sample_query: 'Review NDA and flag missing clauses for Indian law', practice_area: 'Corporate', court: 'N/A' },
    { matter_name: 'Shareholders Dispute', sample_query: 'Grounds for NCLT petition — oppression and mismanagement', practice_area: 'Corporate', court: 'NCLT' },
    { matter_name: 'Property Dispute', sample_query: 'Specific performance of immovable property sale agreement', practice_area: 'Civil', court: 'District Court' },
    { matter_name: 'Family Law', sample_query: 'Grounds for contested divorce under Hindu Marriage Act Section 13', practice_area: 'Family', court: 'District Court' }
  ];

  const selectedMatter = displayMatters.find(m => m.matter_name === selected);

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
        <span>📂</span> Select a Legal Matter template
      </label>
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex justify-between items-center px-4 py-3.5 border border-gray-200 rounded-xl 
                     bg-white hover:bg-gray-50/50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                     transition-all duration-200 shadow-xs cursor-pointer ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : ''}`}
        >
          <div className="flex flex-col items-start text-left">
            <span className="text-gray-800 font-semibold text-sm">
              {selected || 'Select a legal matter template...'}
            </span>
            {selectedMatter && 'practice_area' in selectedMatter && (
              <span className="text-xs text-gray-400 font-medium mt-0.5">
                {selectedMatter.practice_area} • {selectedMatter.court}
              </span>
            )}
          </div>
          <svg className="w-5 h-5 text-gray-400 transition-transform duration-300" 
               xmlns="http://www.w3.org/2000/svg" 
               fill="none" 
               viewBox="0 0 24 24" 
               stroke="currentColor"
               style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1.5 w-full max-h-64 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-xl animate-in slide-in-from-top-1.5 duration-200">
            {displayMatters.map((matter, idx) => (
              <div
                key={matter.matter_name || idx}
                onClick={() => {
                  onSelect(matter.matter_name, matter.sample_query);
                  setIsOpen(false);
                }}
                className={`px-4 py-3 text-sm hover:bg-blue-50/40 hover:text-blue-800 transition-colors
                         ${selected === matter.matter_name ? 'bg-blue-50/60 text-blue-900 font-bold' : 'text-gray-700'}
                         cursor-pointer border-b border-gray-50 last:border-0`}
              >
                <div className="font-semibold text-sm">{matter.matter_name}</div>
                { 'description' in matter && (
                  <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{matter.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}