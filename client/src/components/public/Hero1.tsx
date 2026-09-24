import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
            Built for small businesses in Africa
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900">
            Run your whole business
            <br />
            <span className="text-brand-600">from one place.</span>
          </h1>

          <p className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto">
            Point of sale, inventory, staff, suppliers, invoices and AI insights.
            Everything you need to sell, track, and grow.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to={ROUTES.register} className="w-full sm:w-auto">
              <Button size="lg" fullWidth icon={<ArrowRight size={18} />}>
                Get started
              </Button>
            </Link>
            <a href="#how" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" fullWidth>
                See how it works
              </Button>
            </a>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            No credit card required. Plans from KES 1,500.
          </p>
        </div>
      </div>
    </section>
  );
}