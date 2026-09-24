import { ReactNode } from 'react';
import { classNames } from '@/utils/classNames';

interface Props {
  title?: string;
  description?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

export function Card({
  title,
  description,
  actions,
  footer,
  children,
  className,
  padded = true,
}: Props) {
  return (
    <div className={classNames('bg-surface border border-border rounded-lg', className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-fg">{title}</h3>
            )}
            {description && (
              <p className="text-sm text-muted mt-0.5">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-border bg-elevated rounded-b-lg">
          {footer}
        </div>
      )}
    </div>
  );
}