import { ReactNode } from 'react';
import { classNames } from '@/utils/classNames';

type Variant = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

interface Props {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

const variants: Record<Variant, string> = {
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  danger: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
};

const dotColors: Record<Variant, string> = {
  neutral: 'bg-slate-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  brand: 'bg-brand-500',
};

export function Badge({ variant = 'neutral', children, className, dot }: Props) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span className={classNames('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}