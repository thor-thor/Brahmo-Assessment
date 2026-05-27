'use client';

export default function QueryInput({
  value,
  onChange,
  placeholder = '',
  rows = 4
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
        <span>✍️</span> Enter your legal question
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Describe your legal matter or paste an drafted text to verify citations..."}
        rows={rows}
        className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-white text-gray-800 text-sm leading-relaxed
                 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs
                 placeholder-gray-400 transition-all duration-200 resize-y min-h-[100px]"
      />
    </div>
  );
}