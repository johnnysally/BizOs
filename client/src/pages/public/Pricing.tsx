import { Link } from 'react-router-dom';
import { Check, ShieldCheck, Sparkles, Star, X } from 'lucide-react';
import { useSite } from '@/context/SiteContext';
import { PlanCard } from '@/components/public/PlanCard';
import { CTASection } from '@/components/public/CTASection';
import { Spinner } from '@/components/ui/Spinner';
import { ROUTES } from '@/utils/constants';

const PRICING_FAQS = [
  {
    q: 'Can I change plans later?',
    a: 'Yes. You can move between plans at any time. We keep your data intact and prorate the difference automatically.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'M-Pesa, card (Stripe), and bank transfer are supported. Invoices are sent automatically after purchase.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Subscription fees are non-refundable once a billing period begins, but we will help if there was a billing error or an issue with your account.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Some plans include a trial period. The trial length is shown directly on the relevant plan card.',
  },
];

const FEATURE_HIGHLIGHTS = [
  {
    title: 'Faster operations',
    copy: 'Real-time inventory, invoice automation, and POS workflows built for busy teams.',
    icon: Sparkles,
  },
  {
    title: 'AI business insights',
    copy: 'Turn transactions into actions with reports, recommendations, and smart forecasting.',
    icon: Star,
  },
  {
    title: 'Security-first',
    copy: 'Role-based access, account protection, and billing controls designed for growing businesses.',
    icon: ShieldCheck,
  },
];

function Row({
  label,
  values,
}: {
  label: string;
  values: (string | number | boolean)[];
}) {
  return (
    <tr className="border-b border-slate-200/80 last:border-b-0 dark:border-slate-700/80">
      <td className="px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-4 py-3 text-sm text-center text-slate-700 dark:text-slate-100">
          {typeof v === 'boolean' ? (
            v ? (
              <Check size={16} className="mx-auto text-green-500" />
            ) : (
              <X size={16} className="mx-auto text-slate-400 dark:text-slate-500" />
            )
          ) : (
            <span>{v}</span>
          )}
        </td>
      ))}
    </tr>
  );
}

export default function Pricing() {
  const { plans, status } = useSite();

  if (status === 'loading') {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  const activePlans = plans;
  const recommendedPlanCode =
    activePlans.find((plan) => plan.code === 'starter')?.code ??
    activePlans[0]?.code ??
    '';

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-slate-50 to-white py-18 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),transparent_38%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
              Flexible plans
            </span>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50">
              Grow from startup energy to enterprise control.
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Power your sales, inventory, staff, finance, and AI workflows with a platform designed for real business momentum.
            </p>
          </div>

          <div className="mt-10 flex justify-center gap-3 flex-wrap">
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
              Monthly billing
            </button>
            <button className="rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-300">
              Annual billing
              <span className="ml-2 rounded-full bg-brand-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]">
                save 20%
              </span>
            </button>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {FEATURE_HIGHLIGHTS.map(({ title, copy, icon: Icon }) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70"
              >
                <div className="mb-3 inline-flex rounded-xl bg-brand-500/10 p-2 text-brand-600 dark:text-brand-300">
                  <Icon size={18} />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activePlans.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              No plans are available right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {activePlans.map((plan) => (
                <PlanCard
                  key={plan.code}
                  plan={plan}
                  selected={plan.code === recommendedPlanCode}
                  featured={plan.code === recommendedPlanCode}
                  ctaLabel={`Choose ${plan.name}`}
                  ctaHref={`${ROUTES.register}?plan=${plan.code}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {activePlans.length > 0 && (
        <section className="pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
                Feature comparison
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-50">
                The tools your team actually needs
              </h2>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/40 dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-slate-950/30">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/80">
                    <tr>
                      <th className="px-4 py-4 text-left text-sm font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-300">
                        Feature
                      </th>
                      {activePlans.map((p) => (
                        <th
                          key={p.code}
                          className="px-4 py-4 text-center text-sm font-semibold text-slate-900 dark:text-slate-100"
                        >
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <Row label="Owners" values={activePlans.map((p) => p.limits.maxOwners)} />
                    <Row label="Managers" values={activePlans.map((p) => p.limits.maxManagers)} />
                    <Row label="Cashiers" values={activePlans.map((p) => p.limits.maxCashiers)} />
                    <Row label="Products" values={activePlans.map((p) => p.limits.maxProducts.toLocaleString())} />
                    <Row
                      label="Transactions / month"
                      values={activePlans.map((p) =>
                        p.limits.maxTransactionsPerMonth === 0
                          ? 'Unlimited'
                          : p.limits.maxTransactionsPerMonth.toLocaleString()
                      )}
                    />
                    <Row
                      label="AI calls / day"
                      values={activePlans.map((p) => p.limits.maxAiCallsPerDay.toLocaleString())}
                    />
                    <Row label="AI insights" values={activePlans.map((p) => p.features.aiInsights)} />
                    <Row label="Multi-location" values={activePlans.map((p) => p.features.multiLocation)} />
                    <Row label="API access" values={activePlans.map((p) => p.features.api)} />
                    <Row label="Priority support" values={activePlans.map((p) => p.features.prioritySupport)} />
                    <Row label="Custom domain" values={activePlans.map((p) => p.features.customDomain)} />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
              Common questions
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-50">
              Everything you need to know before you choose
            </h2>
          </div>

          <div className="space-y-3">
            {PRICING_FAQS.map((f, i) => (
              <details
                key={i}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold text-slate-900 dark:text-slate-100">
                  {f.q}
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-open:rotate-180 dark:bg-slate-800 dark:text-slate-300">
                    ▾
                  </span>
                </summary>
                <div className="px-5 pb-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {f.a}
                </div>
              </details>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Need a custom rollout or a larger team setup?{' '}
            <Link to={ROUTES.help} className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
              Talk to our team
            </Link>
          </p>
        </div>
      </section>

      <div className="pb-16">
        <CTASection />
      </div>
    </>
  );
}
