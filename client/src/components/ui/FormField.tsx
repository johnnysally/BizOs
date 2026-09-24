import { ReactNode } from 'react';
import { classNames } from '@/utils/classNames';

interface Props {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  hint,
  error,
  required,
  children,
  className,
}: Props) {
  return (
    <div className={classNames('space-y-1.5', className)}>
      {label && (
        <label className="block text-sm font-medium text-fg">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}