import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Wallet, FileText } from 'lucide-react';
import { classNames } from '@/utils/classNames';
import { CustomerInvoiceTab } from '@/components/invoices/CustomerInvoiceTab';
import { SubscriptionInvoiceTab } from '@/components/invoices/SubscriptionInvoiceTab';

type Tab = 'customer' | 'subscription';

const TABS: Array<{ id: Tab; label: string; icon: typeof Wallet }> = [
  { id: 'customer', label: 'Customer invoices', icon: FileText },
  { id: 'subscription', label: 'Subscription', icon: Wallet },
];

const VALID: Tab[] = ['customer', 'subscription'];

export default function Invoices() {
  const [params, setParams] = useSearchParams();

  const raw = params.get('tab') as Tab | null;
  const active: Tab = raw && VALID.includes(raw) ? raw : 'customer';

  const setActive = (next: Tab) => {
    const p = new URLSearchParams(params);
    if (next === 'customer') p.delete('tab');
    else p.set('tab', next);
    setParams(p, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-fg">Invoices</h1>
        <p className="text-sm text-muted mt-1">
          Manage customer invoices and your subscription billing.
        </p>
      </div>

      <div className="border-b border-border mb-6">
        <nav className="-mb-px flex gap-1 overflow-x-auto" role="tablist">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(tab.id)}
                className={classNames(
                  'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition',
                  isActive
                    ? 'border-brand-600 text-brand-700 dark:text-brand-300'
                    : 'border-transparent text-muted hover:text-fg hover:border-border'
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {active === 'customer' && <CustomerInvoiceTab />}
      {active === 'subscription' && <SubscriptionInvoiceTab />}
    </div>
  );
}