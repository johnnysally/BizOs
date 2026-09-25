import {
  Building2,
  Calculator,
  Receipt,
  CreditCard,
  Wallet,
  Palette,
} from 'lucide-react';
import { classNames } from '@/utils/classNames';
import type { SettingsTab } from '@/pages/app/Settings';

interface Props {
  active: SettingsTab;
  onChange: (tab: SettingsTab) => void;
}

const ITEMS: Array<{
  id: SettingsTab;
  label: string;
  description: string;
  icon: typeof Building2;
}> = [
  { id: 'business', label: 'Business', description: 'Identity & contact', icon: Building2 },
  { id: 'finance', label: 'Finance', description: 'Tax, pricing, loyalty', icon: Calculator },
  { id: 'receipt', label: 'Receipt', description: 'Templates & printing', icon: Receipt },
  { id: 'payments', label: 'Payments', description: 'Accepted methods', icon: CreditCard },
  { id: 'billing', label: 'Billing', description: 'Plan & invoices', icon: Wallet },
  { id: 'appearance', label: 'Appearance', description: 'Theme & layout', icon: Palette },
];

export function SettingsNav({ active, onChange }: Props) {
  return (
    <nav className="bg-surface border border-border rounded-lg p-2 h-fit md:sticky md:top-6">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={classNames(
              'w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-left transition',
              isActive
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                : 'text-muted hover:bg-elevated hover:text-fg'
            )}
          >
            <Icon size={18} className="shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-medium leading-none">{item.label}</p>
              <p className="text-xs mt-1 opacity-80 leading-none truncate">
                {item.description}
              </p>
            </div>
          </button>
        );
      })}
    </nav>
  );
}