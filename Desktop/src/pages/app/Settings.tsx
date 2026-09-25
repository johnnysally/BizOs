import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';
import { SettingsNav } from '@/components/settings/SettingsNav';
import { BusinessTab } from '@/components/settings/BusinessTab';
import { FinanceTab } from '@/components/settings/FinanceTab';
import { ReceiptTab } from '@/components/settings/ReceiptTab';
import { PaymentsTab } from '@/components/settings/PaymentsTab';
import { BillingTab } from '@/components/settings/BillingTab';
import { AppearanceTab } from '@/components/settings/AppearanceTab';

export type SettingsTab =
  | 'business'
  | 'finance'
  | 'receipt'
  | 'payments'
  | 'billing'
  | 'appearance';

const VALID: SettingsTab[] = [
  'business',
  'finance',
  'receipt',
  'payments',
  'billing',
  'appearance',
];

export default function Settings() {
  const { user, status: authStatus } = useAuth();
  const [params, setParams] = useSearchParams();
  const [dirty, setDirty] = useState(false);

  const rawTab = params.get('tab') as SettingsTab | null;
  const tab: SettingsTab = rawTab && VALID.includes(rawTab) ? rawTab : 'business';

  const setTab = (next: SettingsTab) => {
    if (dirty && !window.confirm('You have unsaved changes. Leave this tab?')) return;
    const nextParams = new URLSearchParams(params);
    if (next === 'business') nextParams.delete('tab');
    else nextParams.set('tab', next);
    setParams(nextParams, { replace: true });
    setDirty(false);
  };

  if (authStatus === 'loading' || authStatus === 'idle') {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user?.role !== 'owner') {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <h1 className="text-xl font-semibold text-fg">Access denied</h1>
          <p className="text-sm text-muted mt-2">
            Only the workspace owner can change settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-fg">Settings</h1>
        <p className="text-sm text-muted mt-1">
          Configure how BizOS works for your business.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        <SettingsNav active={tab} onChange={setTab} />

        <div className="min-w-0">
          {tab === 'business' && <BusinessTab onDirtyChange={setDirty} />}
          {tab === 'finance' && <FinanceTab onDirtyChange={setDirty} />}
          {tab === 'receipt' && <ReceiptTab onDirtyChange={setDirty} />}
          {tab === 'payments' && <PaymentsTab />}
          {tab === 'billing' && <BillingTab />}
          {tab === 'appearance' && <AppearanceTab />}
        </div>
      </div>
    </div>
  );
}