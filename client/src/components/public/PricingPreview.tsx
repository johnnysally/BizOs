import { Link } from 'react-router-dom';
import { useSite } from '@/context/SiteContext';
import { PlanCard } from './PlanCard';
import { Spinner } from '@/components/ui/Spinner';
import { ROUTES } from '@/utils/constants';

export function PricingPreview() {
  const { plans, status } = useSite();

  if (status === 'loading') {
    return (
      <section id="pricing" className="scroll-mt-20 py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <Spinner size="lg" />
        </div>
      </section>
    );
  }

  if (!plans.length) return null;

  return (
    <section id="pricing" className="scroll-mt-20 py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Pick the plan that fits. Upgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <PlanCard
              key={plan.code}
              plan={plan}
              ctaLabel={`Choose ${plan.name}`}
              ctaHref={`${ROUTES.register}?plan=${plan.code}`}
            />
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            to={ROUTES.pricing}
            className="text-sm text-brand-600 hover:underline"
          >
            Compare all plans →
          </Link>
        </div>
      </div>
    </section>
  );
}