import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  label: string;
  tone?: 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'primary';
  icon?: React.ReactNode;
}

export function StatusBadge({ label, tone = 'neutral', icon }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    success: 'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300',
    danger: 'bg-red-100 text-red-700 ring-red-200 dark:bg-red-950/50 dark:text-red-300',
    warning: 'bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300',
    info: 'bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-300',
    primary: 'bg-violet-100 text-violet-700 ring-violet-200 dark:bg-violet-950/50 dark:text-violet-300',
    neutral: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200',
  };

  return (
    <span className={cn('inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', styles[tone])}>
      {icon}
      {label}
    </span>
  );
}
