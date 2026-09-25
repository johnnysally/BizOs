import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-20 w-[500px] h-[400px] rounded-full bg-brand-100/40 blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left column: copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />
              Built for the business in motion
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              Every sale is a signal.
              <br />
              <span className="text-brand-600">Make it count.</span>
            </h1>

            <p className="mt-5 text-base text-slate-600 max-w-lg">
              Point of sale, inventory, staff, suppliers, invoices and AI
              insights — everything your business needs, in one place.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={ROUTES.register}>
                <Button size="md" icon={<ArrowRight size={16} />}>
                  Get started free
                </Button>
              </Link>
              <a href="#how">
                <Button
                  size="md"
                  variant="outline"
                  icon={<ChevronRight size={16} />}
                >
                  See how it works
                </Button>
              </a>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              No credit card required · Plans from KES 1,500
            </p>
          </div>

          {/* Right column: compact visual */}
          <div className="relative">
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
              {/* header */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-brand-600 flex items-center justify-center text-white text-[10px] font-bold">
                    B
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700">
                    BizOS POS
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
                  <span className="w-1 h-1 rounded-full bg-green-500" />
                  Live
                </span>
              </div>

              {/* body */}
              <div className="p-3">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { name: 'Twin Cable', price: 'KES 8,500', color: 'bg-blue-500' },
                    { name: 'LED Bulb', price: 'KES 320', color: 'bg-amber-500' },
                    { name: 'Switch', price: 'KES 480', color: 'bg-red-500' },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className="p-2 border border-slate-200 rounded-md bg-white"
                    >
                      <div className={`w-4 h-4 rounded ${p.color} mb-1.5`} />
                      <p className="text-[10px] font-semibold text-slate-900 leading-tight truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] font-bold text-slate-900 mt-0.5">
                        {p.price}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">
                      Current sale
                    </p>
                    <p className="text-[11px] text-slate-600">
                      3 items · KES 10,602
                    </p>
                  </div>
                  <div className="shrink-0 px-2.5 py-1 rounded-md bg-brand-600 text-white text-[10px] font-semibold flex items-center gap-1">
                    Charge
                    <ArrowRight size={10} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}