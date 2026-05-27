'use client';

interface StatusBadgeProps {
  status: 'VERIFIED' | 'CORRECTED' | 'UNVERIFIED' | 'REMOVED';
  tooltip?: string;
  className?: string;
}

export default function StatusBadge({ status, tooltip, className = '' }: StatusBadgeProps) {
  const config = {
    VERIFIED: {
      label: '[VERIFIED]',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      icon: '✓'
    },
    CORRECTED: {
      label: '[CORRECTED]',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      icon: '⚠'
    },
    UNVERIFIED: {
      label: '[UNVERIFIED]',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
      icon: '?'
    },
    REMOVED: {
      label: '[REMOVED]',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      icon: '✕'
    }
  } as const;

  const { label, bgColor, textColor, borderColor, icon } = config[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold ${bgColor} ${textColor} border ${borderColor} ${className}`}
      title={tooltip}
    >
      <span className="text-[10px] opacity-70">{icon}</span>
      {label}
    </span>
  );
}