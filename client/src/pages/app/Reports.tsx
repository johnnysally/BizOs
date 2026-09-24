import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart3, TrendingUp, Boxes, Users, FileText } from 'lucide-react';
import { classNames } from '@/utils/classNames';
import { SalesReport } from '@/components/reports/SalesReport';
import { InventoryReport } from '@/components/reports/InventoryReport';
import { CustomersReport } from '@/components/reports/CustomersReport';
import { StaffReport } from '@/components/reports/StaffReport';
import { GeneralReport } from '@/components/reports/GeneralReport';

type ReportTab = 'sales' | 'inventory' | 'customers' | 'staff' | 'general';

const TABS: Array<{
  id: ReportTab;
  label: string;
  icon: typeof BarChart3;
}> = [
  { id: 'sales', label: 'Sales', icon: TrendingUp },
  { id: 'inventory', label: 'Inventory', icon: Boxes },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'staff', label: 'Staff', icon: BarChart3 },
  { id: 'general', label: 'General', icon: FileText },
];

const VALID: ReportTab[] = ['sales', 'inventory', 'customers', 'staff', 'general'];

export default function Reports() {
  const [params, setParams] = useSearchParams();

  const raw = params.get('tab') as ReportTab | null;
  const active: ReportTab = raw && VALID.includes(raw) ? raw : 'sales';

  const setActive = (next: ReportTab) => {
    const p = new URLSearchParams(params);
    if (next === 'sales') p.delete('tab');
    else p.set('tab', next);
    setParams(p, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-fg">Reports</h1>
        <p className="text-sm text-muted mt-1">
          Generate, print, and export performance reports.
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

      {active === 'sales' && <SalesReport />}
      {active === 'inventory' && <InventoryReport />}
      {active === 'customers' && <CustomersReport />}
      {active === 'staff' && <StaffReport />}
      {active === 'general' && <GeneralReport />}
    </div>
  );
}