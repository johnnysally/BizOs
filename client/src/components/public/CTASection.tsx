import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSite } from '@/context/SiteContext';
import { ROUTES } from '@/utils/constants';
import { Button } from '@/components/ui/Button';

export function CTASection() {
  const { settings } = useSite();

  return (
    <section className="border-y border-slate-200 bg-slate-50 py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-600">A clearer way forward</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Ready to run your business on{' '}
          {settings?.platformName || 'BizOS'}?
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Get started in minutes. No credit card required.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={ROUTES.register} className="w-full sm:w-auto">
            <Button
              size="lg"
              fullWidth
              icon={<ArrowRight size={18} />}
            >
              Get started
            </Button>
          </Link>
          {settings?.supportPhone && (
            <a
              href={`tel:${settings.supportPhone.replace(/\s+/g, '')}`}
              className="w-full sm:w-auto"
            >
              <Button
                size="lg"
                variant="outline"
                fullWidth
              >
                Call {settings.supportPhone}
              </Button>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}