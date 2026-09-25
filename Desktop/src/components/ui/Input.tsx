import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { classNames } from '@/utils/classNames';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { error, icon, className, ...rest },
  ref
) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={classNames(
          'block w-full rounded-md border text-sm transition',
          'bg-surface text-fg',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
            : 'border-border',
          icon ? 'pl-10 pr-3 py-2' : 'px-3 py-2',
          'disabled:bg-elevated disabled:text-muted disabled:cursor-not-allowed',
          'placeholder:text-muted/70',
          className
        )}
        {...rest}
      />
    </div>
  );
});