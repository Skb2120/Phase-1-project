import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  helper?: string;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  icon?: ReactNode;
}

export function MetricCard({ label, value, helper, tone = 'default', icon }: MetricCardProps) {
  const toneStyles = {
    default: 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
    success: 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/25',
    warning: 'border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/25',
    danger: 'border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/25',
    info: 'border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/25',
  };

  return (
    <div className={`rounded-2xl border p-4 shadow-soft ${toneStyles[tone]}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</span>
        {icon}
      </div>
      <div className="text-3xl font-bold text-slate-900 dark:text-white">{value}</div>
      {helper ? <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">{helper}</div> : null}
    </div>
  );
}
