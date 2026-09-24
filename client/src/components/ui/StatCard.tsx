import { ReactNode } from 'react';
import { classNames } from '@/utils/classNames';

interface Props {
  label: string;
  value: ReactNode;
  delta?: { value: number; positive?: boolean };
  icon?: ReactNode;
  hint?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  delta,
  icon,
  hint,
  className,
}: Props) {
  return (
    <div
      className={classNames(
        'bg-surface border border-border rounded-lg p-5',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-fg truncate">
            {value}
          </p>
          {(delta || hint) && (
            <div className="mt-1 flex items-center gap-2 text-xs">
              {delta && (
                <span
                  className={classNames(
                    'font-medium',
                    delta.positive !== false
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  )}
                >
                  {delta.positive !== false ? '▲' : '▼'} {Math.abs(delta.value)}%
                </span>
              )}
              {hint && <span className="text-muted">{hint}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className="shrink-0 w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}