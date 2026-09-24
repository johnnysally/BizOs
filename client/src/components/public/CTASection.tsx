import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useSite } from '@/context/SiteContext';
import { ROUTES } from '@/utils/constants';
import { Button } from '@/components/ui/Button';

export function CTASection() {
  const { settings } = useSite();

  return (
    <section className="bg-slate-900 py-16 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Ready to run your business on{' '}
          {settings?.platformName || 'BizOS'}?
        </h2>
        <p className="mt-4 text-lg text-slate-300">
          Get started in minutes. No credit card required.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to={ROUTES.register} className="w-full sm:w-auto">
            <Button
              size="lg"
              fullWidth
              icon={<ArrowRight size={18} />}
              className="!bg-white !text-slate-900 hover:!bg-slate-100"
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
                variant="ghost"
                fullWidth
                className="!text-white hover:!bg-white/10"
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