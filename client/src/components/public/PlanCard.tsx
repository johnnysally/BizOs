import { Check } from 'lucide-react';
import { classNames } from '@/utils/classNames';
import type { PublicPlan } from '@/api/site';

interface Props {
  plan: PublicPlan;
  selected?: boolean;
  featured?: boolean;
  onClick?: () => void;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

function intervalLabel(interval: string) {
  if (interval === 'once') return 'one-time';
  if (interval === 'year') return 'per year';
  return 'per month';
}

export function PlanCard({
  plan,
  selected,
  featured,
  onClick,
  ctaLabel,
  ctaHref,
  className,
}: Props) {
  const isFree = plan.price.amount === 0;
  const clickable = Boolean(onClick);

  const inner = (
    <>
      <div className="mb-1.5 flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-fg sm:text-sm">{plan.name}</p>
          {plan.description && (
            <p className="mt-1 text-[9px] leading-relaxed text-muted sm:text-[10px]">{plan.description}</p>
          )}
        </div>

        {featured && (
          <span className="inline-flex items-center rounded-full border border-brand-500/30 bg-brand-500/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-300">
            Popular
          </span>
        )}
      </div>

      <div className="mb-2">
        <p className="text-lg font-bold leading-none text-fg sm:text-xl">
          {isFree
            ? 'Free'
            : `${plan.price.currency} ${plan.price.amount.toLocaleString()}`}
        </p>
        {!isFree && (
          <p className="mt-1.5 text-[8px] font-medium uppercase tracking-[0.14em] text-muted sm:text-[9px]">
            {intervalLabel(plan.price.interval)}
          </p>
        )}
      </div>

      <ul className="mb-2 space-y-1 text-[9px] text-muted sm:text-[10px]">
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          {plan.limits.maxOwners} owner(s)
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          {plan.limits.maxCashiers} cashier(s)
        </li>
        <li className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          {plan.limits.maxProducts.toLocaleString()} products
        </li>
        {plan.limits.maxAiCallsPerDay > 0 && (
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            {plan.limits.maxAiCallsPerDay} AI calls / day
          </li>
        )}
        {plan.features.aiInsights && (
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            AI insights
          </li>
        )}
        {plan.features.multiLocation && (
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            Multi-location
          </li>
        )}
        {plan.features.api && (
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
            API access
          </li>
        )}
        {plan.trialDays > 0 && (
          <li className="flex items-center gap-2 text-brand-700 font-medium">
            <Check size={14} className="text-brand-600" />
            {plan.trialDays}-day free trial
          </li>
        )}
      </ul>

      {ctaLabel && ctaHref && (
        <a
          href={ctaHref}
          className={classNames(
            'block w-full text-center px-4 py-3 rounded-xl text-sm font-semibold transition',
            selected
              ? 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-500/20'
              : 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700'
          )}
        >
          {ctaLabel}
        </a>
      )}
    </>
  );

  const wrapperClass = classNames(
    'relative w-full p-4 rounded-2xl border text-left transition-all duration-200',
    selected
      ? 'border-brand-400 bg-brand-500/10 shadow-[0_0_0_1px_rgba(96,165,250,0.2)] ring-1 ring-brand-500/20'
      : 'border-border bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-slate-500',
    clickable && 'cursor-pointer hover:-translate-y-0.5',
    className
  );

  if (clickable) {
    return (
      <button type="button" onClick={onClick} className={wrapperClass}>
        {inner}
      </button>
    );
  }

  return <div className={wrapperClass}>{inner}</div>;
}
