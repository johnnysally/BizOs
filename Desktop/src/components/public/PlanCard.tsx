import { Check } from 'lucide-react';
import { classNames } from '@/utils/classNames';
import type { PublicPlan } from '@/api/site';

interface Props {
  plan: PublicPlan;
  selected?: boolean;
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
  onClick,
  ctaLabel,
  ctaHref,
  className,
}: Props) {
  const isFree = plan.price.amount === 0;
  const clickable = Boolean(onClick);

  const inner = (
    <>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-slate-900 text-lg">{plan.name}</p>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-brand-600 flex items-center justify-center shrink-0">
            <Check size={12} className="text-white" />
          </div>
        )}
      </div>

      <p className="text-2xl font-bold text-slate-900 mb-1">
        {isFree
          ? 'Free'
          : `${plan.price.currency} ${plan.price.amount.toLocaleString()}`}
        {!isFree && (
          <span className="text-xs font-normal text-slate-500 ml-1">
            {intervalLabel(plan.price.interval)}
          </span>
        )}
      </p>

      {plan.description && (
        <p className="text-xs text-slate-500 mb-4">{plan.description}</p>
      )}

      <ul className="space-y-1.5 text-sm text-slate-600 mb-5">
        <li>• {plan.limits.maxOwners} owner(s)</li>
        <li>• {plan.limits.maxCashiers} cashier(s)</li>
        <li>• {plan.limits.maxProducts.toLocaleString()} products</li>
        {plan.limits.maxAiCallsPerDay > 0 && (
          <li>• {plan.limits.maxAiCallsPerDay} AI calls / day</li>
        )}
        {plan.features.aiInsights && <li>• AI insights</li>}
        {plan.features.multiLocation && <li>• Multi-location</li>}
        {plan.features.api && <li>• API access</li>}
        {plan.trialDays > 0 && (
          <li className="text-brand-700 font-medium">
            • {plan.trialDays}-day free trial
          </li>
        )}
      </ul>

      {ctaLabel && ctaHref && (
        <a
          href={ctaHref}
          className="block w-full text-center px-4 py-2 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition"
        >
          {ctaLabel}
        </a>
      )}
    </>
  );

  const wrapperClass = classNames(
    'p-5 rounded-lg border-2 transition bg-white',
    selected
      ? 'border-brand-500 ring-2 ring-brand-500/20'
      : 'border-slate-200 hover:border-slate-300',
    clickable && 'text-left cursor-pointer',
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