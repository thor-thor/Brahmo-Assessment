'use client';

export default function ActionButtons({
  onAskGeneric,
  onAskVerified,
  loading
}: {
  onAskGeneric: () => Promise<void>;
  onAskVerified: () => Promise<void>;
  loading: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <button
        type="button"
        onClick={onAskGeneric}
        disabled={loading}
        className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl
                 transition-all duration-200 border border-gray-200 shadow-sm cursor-pointer hover:shadow-md
                 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span>Ask Generic AI</span>
        <span className="text-xs font-normal opacity-75">(No verification safety)</span>
      </button>

      <button
        type="button"
        onClick={onAskVerified}
        disabled={loading}
        className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                 text-white font-bold rounded-xl transition-all duration-200 border border-blue-500 shadow-md 
                 cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 
                 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Securing pipeline...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Ask with Citation Verification</span>
          </>
        )}
      </button>
    </div>
  );
}