import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { useSite } from '@/context/SiteContext';
import { PlanCard } from '@/components/public/PlanCard';
import { FAQ } from '@/components/public/FAQ';
import { CTASection } from '@/components/public/CTASection';
import { Spinner } from '@/components/ui/Spinner';
import { ROUTES } from '@/utils/constants';

const PRICING_FAQS = [
  {
    q: 'Can I change plans later?',
    a: 'Yes. Contact support and we will move you to a different plan. Your data is preserved.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'M-Pesa, card (Stripe), and bank transfer. You will receive an invoice after you choose a plan.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'Subscriptions are non-refundable once a billing period starts. Contact support if you were charged in error.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Some plans include a trial period. The trial length is shown on the plan card.',
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
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className="px-4 py-3 text-sm text-slate-600">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-4 py-3 text-sm text-center">
          {typeof v === 'boolean' ? (
            v ? (
              <Check size={16} className="text-green-600 inline" />
            ) : (
              <X size={16} className="text-slate-300 inline" />
            )
          ) : (
            <span className="text-slate-900">{v}</span>
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

  return (
    <>
      <section className="bg-gradient-to-b from-slate-50 to-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
            Simple, honest pricing
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Choose the plan that fits your business. Upgrade anytime.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activePlans.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No plans are available right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {activePlans.map((plan) => (
                <PlanCard
                  key={plan.code}
                  plan={plan}
                  ctaLabel={`Choose ${plan.name}`}
                  ctaHref={`${ROUTES.register}?plan=${plan.code}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {activePlans.length > 0 && (
        <section className="pb-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
              Compare features
            </h2>

            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-slate-500">
                        Feature
                      </th>
                      {activePlans.map((p) => (
                        <th
                          key={p.code}
                          className="px-4 py-3 text-sm font-semibold text-slate-900 text-center"
                        >
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <Row
                      label="Owners"
                      values={activePlans.map((p) => p.limits.maxOwners)}
                    />
                    <Row
                      label="Managers"
                      values={activePlans.map((p) => p.limits.maxManagers)}
                    />
                    <Row
                      label="Cashiers"
                      values={activePlans.map((p) => p.limits.maxCashiers)}
                    />
                    <Row
                      label="Products"
                      values={activePlans.map((p) =>
                        p.limits.maxProducts.toLocaleString()
                      )}
                    />
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
                      values={activePlans.map((p) =>
                        p.limits.maxAiCallsPerDay.toLocaleString()
                      )}
                    />
                    <Row
                      label="AI insights"
                      values={activePlans.map((p) => p.features.aiInsights)}
                    />
                    <Row
                      label="Multi-location"
                      values={activePlans.map((p) => p.features.multiLocation)}
                    />
                    <Row
                      label="API access"
                      values={activePlans.map((p) => p.features.api)}
                    />
                    <Row
                      label="Priority support"
                      values={activePlans.map((p) => p.features.prioritySupport)}
                    />
                    <Row
                      label="Custom domain"
                      values={activePlans.map((p) => p.features.customDomain)}
                    />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Pricing questions
          </h2>
          <div className="space-y-2">
            {PRICING_FAQS.map((f, i) => (
              <details
                key={i}
                className="bg-white border border-slate-200 rounded-lg group"
              >
                <summary className="px-5 py-4 text-sm font-medium text-slate-900 cursor-pointer list-none flex items-center justify-between">
                  {f.q}
                  <span className="text-slate-400 group-open:rotate-180 transition">
                    ▾
                  </span>
                </summary>
                <div className="px-5 pb-4 text-sm text-slate-600">{f.a}</div>
              </details>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500 mt-8">
            Still have questions?{' '}
            <Link to={ROUTES.help} className="text-brand-600 hover:underline">
              Visit our help center
            </Link>
          </p>
        </div>
      </section>

      <CTASection />
    </>
  );
}