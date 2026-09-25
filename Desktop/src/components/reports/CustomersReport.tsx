import { useEffect, useMemo, useState } from 'react';
import { Printer, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/context/NotificationContext';
import { useClient } from '@/context/ClientContext';
import { customerApi } from '@/api/customers';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { printHtml } from '@/utils/printHtml';
import { reportsHtml } from '@/utils/reportsHtml';
import type { Customer } from '@/types/customer';

const TIER_VARIANT = {
  none: 'neutral',
  bronze: 'warning',
  silver: 'info',
  gold: 'success',
} as const;

export function CustomersReport() {
  const { settings } = useClient();
  const { toast } = useNotifications();
  const currency = (settings.currency as string) || 'KES';

  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    customerApi
      .list({ page: 1, limit: 200 })
      .then((res) => {
        if (active) setCustomers(res.data);
      })
      .catch(() =>
        toast({ type: 'error', message: 'Could not load customers report' })
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [toast]);

  const sorted = useMemo(
    () => [...customers].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0)),
    [customers]
  );

  const summary = useMemo(() => {
    const totalSpend = customers.reduce((s, c) => s + (c.totalSpent || 0), 0);
    const totalPoints = customers.reduce((s, c) => s + (c.points || 0), 0);
    const active = customers.filter((c) => c.active).length;
    return { totalSpend, totalPoints, active };
  }, [customers]);

  const rows = useMemo(
    () =>
      sorted.map((c) => [
        c.name,
        c.phone || '—',
        c.email || '—',
        String(c.points || 0),
        c.loyaltyTier,
        formatCurrency(c.totalSpent || 0, currency),
        c.lastPurchaseAt ? formatDate(c.lastPurchaseAt) : 'Never',
      ]),
    [sorted, currency]
  );

  const print = () => {
    printHtml(
      reportsHtml({
        meta: {
          businessName: 'BizOS',
          currency,
          rangeLabel: 'Customer snapshot',
          generatedAt: new Date().toISOString(),
        },
        sections: [
          {
            kind: 'summary',
            title: 'Customer summary',
            rows: [
              { label: 'Total customers', value: String(customers.length) },
              { label: 'Active', value: String(summary.active) },
              { label: 'Lifetime spend', value: formatCurrency(summary.totalSpend, currency) },
              { label: 'Points issued', value: summary.totalPoints.toLocaleString() },
            ],
          },
          {
            kind: 'table',
            title: 'Top customers by spend',
            columns: ['Name', 'Phone', 'Email', 'Points', 'Tier', 'Spend', 'Last purchase'],
            rows,
          },
        ],
      }),
      { title: 'Customers report', width: 1000, height: 800 }
    );
  };

  const exportCsv = () => {
    const header = ['Name', 'Phone', 'Email', 'Points', 'Tier', 'Spend', 'Last purchase'];
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers-report.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ type: 'success', message: 'Customers report exported' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" icon={<Printer size={14} />} onClick={print}>
          Print
        </Button>
        <Button size="sm" variant="outline" icon={<Download size={14} />} onClick={exportCsv}>
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Customers" value={String(customers.length)} hint="Total accounts" />
        <Kpi label="Active" value={String(summary.active)} hint="Enabled" />
        <Kpi label="Lifetime spend" value={formatCurrency(summary.totalSpend, currency)} hint="All customers" />
        <Kpi label="Points issued" value={summary.totalPoints.toLocaleString()} hint="Outstanding" />
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-elevated border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Contact</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Points</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Tier</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Lifetime spend</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Last purchase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted">
                    No customers yet.
                  </td>
                </tr>
              ) : (
                sorted.map((c) => (
                  <tr key={c._id} className="hover:bg-elevated">
                    <td className="px-4 py-3 text-fg truncate max-w-[200px]">{c.name}</td>
                    <td className="px-4 py-3 text-muted truncate max-w-[200px]">
                      {c.phone || c.email || '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-fg">
                      {(c.points || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {c.loyaltyTier !== 'none' ? (
                        <Badge variant={TIER_VARIANT[c.loyaltyTier]}>{c.loyaltyTier}</Badge>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-fg">
                      {formatCurrency(c.totalSpent || 0, currency)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted text-xs">
                      {c.lastPurchaseAt ? formatDate(c.lastPurchaseAt) : 'Never'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-xl font-semibold text-fg mt-1 truncate">{value}</p>
      <p className="text-xs text-muted mt-1">{hint}</p>
    </div>
  );
}