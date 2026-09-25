import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { classNames } from '@/utils/classNames';

const FAQS = [
  {
    q: 'What is BizOS?',
    a: 'BizOS is a point-of-sale and business management platform for small businesses. It handles sales, inventory, staff, suppliers, invoices, and includes AI insights.',
  },
  {
    q: 'Do I need to pay before I can use it?',
    a: 'You can register for free. If you choose a paid plan, you will receive an invoice and can pay via M-Pesa, card, or bank transfer.',
  },
  {
    q: 'Does it work without internet?',
    a: 'The POS core works offline and syncs when you reconnect. Reports and AI insights need internet.',
  },
  {
    q: 'How do payments work?',
    a: 'You can accept cash, card, and M-Pesa. All methods are configurable per business.',
  },
  {
    q: 'Can I use it for my type of business?',
    a: 'Yes. Retail, restaurants, salons, pharmacies, cosmetics, and general shops are all supported.',
  },
  {
    q: 'Do you support multiple locations?',
    a: 'Yes, on plans that include multi-location. You can manage branches from one dashboard.',
  },
  {
    q: 'How do I contact support?',
    a: 'Email us at support@bizos.co.ke or call +254 700 000 000. We reply within a few hours.',
  },
  {
    q: 'Can I export my data?',
    a: 'Yes. You can export sales, products, and customer data at any time from the app.',
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 py-16 md:py-24 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-2">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className="bg-white border border-slate-200 rounded-lg overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-slate-900">
                    {f.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={classNames(
                      'text-slate-400 transition shrink-0',
                      isOpen && 'rotate-180'
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}