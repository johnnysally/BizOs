import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '@/context/SiteContext';
import { LegalModal } from '@/components/public/LegalModal';
import { LEGAL_TYPES, ROUTES } from '@/utils/constants';
import type { LegalType } from '@/types/legal';

export function PublicFooter() {
  const { settings } = useSite();
  const [legal, setLegal] = useState<LegalType | null>(null);
  const year = new Date().getFullYear();
  const platformName = settings?.platformName || 'BizOS';

  return (
    <>
      <footer className="bg-slate-900 text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          {/* Top: brand + columns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
            {/* Brand block */}
            <div className="md:col-span-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
                  B
                </div>
                <span className="font-semibold text-white text-base">
                  {platformName}
                </span>
              </div>
              <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
                Run your whole business from one place. Point of sale,
                inventory, staff, suppliers, invoices and AI insights.
              </p>
            </div>

            {/* Product column */}
            <div className="md:col-span-2">
              <p className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
                Product
              </p>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    to={ROUTES.pricing}
                    className="text-slate-400 hover:text-white transition"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.help}
                    className="text-slate-400 hover:text-white transition"
                  >
                    Help center
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.downloads}
                    className="text-slate-400 hover:text-white transition"
                  >
                    Resources
                  </Link>
                </li>
                <li>
                  <Link
                    to={ROUTES.register}
                    className="text-slate-400 hover:text-white transition"
                  >
                    Get started
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support column */}
            <div className="md:col-span-3">
              <p className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
                Support
              </p>
              <ul className="space-y-3 text-sm">
                {settings?.supportEmail && (
                  <li>
                    <a
                      href={`mailto:${settings.supportEmail}`}
                      className="text-slate-400 hover:text-white transition"
                    >
                      {settings.supportEmail}
                    </a>
                  </li>
                )}
                {settings?.supportPhone && (
                  <li>
                    <a
                      href={`tel:${settings.supportPhone.replace(/\s+/g, '')}`}
                      className="text-slate-400 hover:text-white transition"
                    >
                      {settings.supportPhone}
                    </a>
                  </li>
                )}
                <li>
                  <Link
                    to={ROUTES.help}
                    className="text-slate-400 hover:text-white transition"
                  >
                    Contact us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal column */}
            <div className="md:col-span-3">
              <p className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
                Legal
              </p>
              <ul className="space-y-3 text-sm">
                {LEGAL_TYPES.map((type) => (
                  <li key={type}>
                    <button
                      type="button"
                      onClick={() => setLegal(type)}
                      className="text-slate-400 hover:text-white transition capitalize text-left"
                    >
                      {type}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              © {year} {platformName}. All rights reserved.
            </p>
            <p className="text-xs text-slate-500">Made in Kenya</p>
          </div>
        </div>
      </footer>

      <LegalModal
        open={!!legal}
        onClose={() => setLegal(null)}
        type={legal || 'terms'}
      />
    </>
  );
}