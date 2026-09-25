import { classNames } from '@/utils/classNames';

interface Props {
  variant?: 'mark' | 'full' | 'stacked';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  to?: string;
  className?: string;
  brandName?: string;
  brandTagline?: string;
  logoUrl?: string | null;
  onClick?: () => void;
}

const sizes = {
  sm: { mark: 'w-6 h-6 text-[10px] rounded-md', text: 'text-sm', sub: 'text-[10px]' },
  md: { mark: 'w-8 h-8 text-xs rounded-lg', text: 'text-base', sub: 'text-[11px]' },
  lg: { mark: 'w-10 h-10 text-base rounded-lg', text: 'text-lg', sub: 'text-xs' },
  xl: { mark: 'w-14 h-14 text-2xl rounded-xl', text: 'text-2xl', sub: 'text-sm' },
};

export function Logo({
  variant = 'full',
  size = 'md',
  to,
  className,
  brandName = 'BizOS',
  brandTagline = 'Business OS',
  logoUrl,
  onClick,
}: Props) {
  const s = sizes[size];

  const mark = logoUrl ? (
    <img
      src={logoUrl}
      alt={brandName}
      className={classNames(s.mark, 'object-contain')}
    />
  ) : (
    <div
      className={classNames(
        s.mark,
        'bg-brand-600 text-white font-bold flex items-center justify-center shrink-0'
      )}
    >
      {brandName.charAt(0).toUpperCase()}
    </div>
  );

  const text = (
    <div className="flex flex-col leading-none min-w-0">
      <span
        className={classNames(
          s.text,
          'font-semibold text-slate-900 dark:text-slate-100 truncate'
        )}
      >
        {brandName}
      </span>
      {variant !== 'mark' && (
        <span
          className={classNames(
            s.sub,
            'text-slate-500 dark:text-slate-400 mt-0.5 truncate'
          )}
        >
          {brandTagline}
        </span>
      )}
    </div>
  );

  const inner =
    variant === 'mark' ? (
      mark
    ) : variant === 'stacked' ? (
      <div className="flex flex-col items-center gap-2">
        {mark}
        <div className="text-center">{text}</div>
      </div>
    ) : (
      <div className="flex items-center gap-2 min-w-0">
        {mark}
        {text}
      </div>
    );

  if (to) {
    return (
      <a
        href={to}
        onClick={onClick}
        className={classNames(
          'inline-flex items-center hover:opacity-90 transition',
          className
        )}
      >
        {inner}
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={classNames(
          'inline-flex items-center hover:opacity-90 transition',
          className
        )}
      >
        {inner}
      </button>
    );
  }

  return <div className={classNames('inline-flex items-center', className)}>{inner}</div>;
}