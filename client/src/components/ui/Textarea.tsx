import { forwardRef, TextareaHTMLAttributes } from 'react';
import { classNames } from '@/utils/classNames';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { error, className, rows = 4, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={classNames(
        'block w-full rounded-md border text-sm transition resize-y',
        'bg-surface text-fg',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
        error ? 'border-red-400' : 'border-border',
        'px-3 py-2',
        'disabled:bg-elevated disabled:text-muted disabled:cursor-not-allowed',
        'placeholder:text-muted/70',
        className
      )}
      {...rest}
    />
  );
});