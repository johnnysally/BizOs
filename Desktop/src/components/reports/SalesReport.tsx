import { useEffect, useMemo, useState } from 'react';
import { Printer, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/context/NotificationContext';
import { useClient } from '@/context/ClientContext';
import { reportApi, SalesSummary, TopProduct } from '@/api/reports';
import { saleApi } from '@/api/sales';
import { formatCurrency } from '@/utils/currency';
import { formatDate, formatDateTime } from '@/utils/date';
import { printHtml } from '@/utils/printHtml';
import { reportsHtml, salesSummarySection, topProductsSection } from '@/utils/reportsHtml';
import { PAYMENT_LABELS } from '@/utils/constants';
import type { Sale } from '@/types/sale';

const RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'quarter', label: 'This quarter' },
];

export function SalesReport() {
  const { settings } = useClient();
  const { toast } = useNotifications();
  const currency = (settings.currency as string) || 'KES';

  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      reportApi.salesSummary({ period }).catch(() => null),
      reportApi.topProducts({ period, limit: 10 }).catch(() => []),
      saleApi.list({ page: 1, limit: 50, period }).catch(() => ({ data: [] })),
    ])
      .then(([s, p, list]) => {
        if (!active) return;
        setSummary(s);
        setTopProducts(p);
        setSales((list as { data: Sale[] }).data || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [period]);

  const rows = useMemo(
    () =>
      sales.map((s) => [
        s.saleNumber,
        s.customerId ? s.customerId.slice(-6) : 'Walk-in',
        PAYMENT_LABELS[s.paymentMethod || ''] || s.paymentMethod || '—',
        formatCurrency(s.total, s.currency || currency),
        s.voided ? 'voided' : s.paymentStatus || 'paid',
        formatDateTime(s.createdAt),
      ]),
    [sales, currency]
  );

  const rangeLabel = RANGES.find((r) => r.value === period)?.label || period;

  const print = () => {
    if (!summary) return;
    printHtml(
      reportsHtml({
        meta: {
          businessName: (settings as { platformName?: string }).platformName || 'BizOS',
          currency,
          rangeLabel,
          generatedAt: new Date().toISOString(),
        },
        sections: [
          salesSummarySection({
            totalSales: summary.totalSales,
            totalTransactions: summary.totalTransactions,
            totalDiscount: summary.totalDiscount,
            totalTax: summary.totalTax,
            currency,
          }),
          topProductsSection({
            rows: topProducts.map((p) => ({
              name: p.name,
              qty: p.qty,
              revenue: p.revenue,
            })),
            currency,
          }),
          {
            kind: 'table',
            title: 'Recent sales',
            columns: ['Sale', 'Customer', 'Method', 'Total', 'Status', 'Date'],
            rows,
          },
        ],
      }),
      { title: `Sales report — ${rangeLabel}`, width: 900, height: 800 }
    );
  };

  const exportCsv = () => {
    const header = ['Sale', 'Customer', 'Method', 'Total', 'Status', 'Date'];
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ type: 'success', message: 'Sales report exported' });
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          options={RANGES}
          className="sm:w-48"
        />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" icon={<Printer size={14} />} onClick={print}>
            Print
          </Button>
          <Button size="sm" variant="outline" icon={<Download size={14} />} onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi label="Revenue" value={formatCurrency(summary.totalSales, currency)} hint={rangeLabel} />
          <Kpi label="Transactions" value={String(summary.totalTransactions)} hint="Completed sales" />
          <Kpi
            label="Avg order"
            value={formatCurrency(
              summary.totalTransactions > 0
                ? Math.round(summary.totalSales / summary.totalTransactions)
                : 0,
              currency
            )}
            hint="Per transaction"
          />
          <Kpi label="Discounts" value={formatCurrency(summary.totalDiscount, currency)} hint="Total given" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Recent sales" description={`${sales.length} shown`}>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead className="bg-elevated border-y border-border">
                <tr>
                  <th className="px-5 py-2 text-left font-medium text-muted">Sale</th>
                  <th className="px-5 py-2 text-left font-medium text-muted">Method</th>
                  <th className="px-5 py-2 text-right font-medium text-muted">Total</th>
                  <th className="px-5 py-2 text-right font-medium text-muted">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-muted">
                      No sales in this period.
                    </td>
                  </tr>
                ) : (
                  sales.slice(0, 15).map((s) => (
                    <tr key={s._id}>
                      <td className="px-5 py-2.5 text-fg font-mono text-xs truncate max-w-[140px]">
                        {s.saleNumber}
                      </td>
                      <td className="px-5 py-2.5 text-muted truncate">
                        {PAYMENT_LABELS[s.paymentMethod || ''] || s.paymentMethod || '—'}
                      </td>
                      <td className="px-5 py-2.5 text-right text-fg">
                        {formatCurrency(s.total, s.currency || currency)}
                      </td>
                      <td className="px-5 py-2.5 text-right text-muted text-xs">
                        {formatDate(s.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Top products" description="By revenue">
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">
              No products sold in this period.
            </p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((p, i) => (
                <li key={p._id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 text-xs font-semibold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-fg truncate">{p.name}</p>
                    <p className="text-xs text-muted">
                      {p.qty} sold · {formatCurrency(p.revenue, currency)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
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