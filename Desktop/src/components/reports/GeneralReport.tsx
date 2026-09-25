import { useEffect, useMemo, useState } from 'react';
import { Printer, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/context/NotificationContext';
import { useClient } from '@/context/ClientContext';
import { reportApi, SalesSummary, TopProduct, StaffPerformance } from '@/api/reports';
import { customerApi } from '@/api/customers';
import { inventoryApi } from '@/api/inventory';
import { formatCurrency } from '@/utils/currency';
import { printHtml } from '@/utils/printHtml';
import { reportsHtml } from '@/utils/reportsHtml';
import type { Customer } from '@/types/customer';
import type { Product } from '@/types/product';

const RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'quarter', label: 'This quarter' },
];

export function GeneralReport() {
  const { settings } = useClient();
  const { toast } = useNotifications();
  const currency = (settings.currency as string) || 'KES';

  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [staff, setStaff] = useState<StaffPerformance[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      reportApi.salesSummary({ period }).catch(() => null),
      reportApi.topProducts({ period, limit: 5 }).catch(() => []),
      reportApi.staff({ period }).catch(() => []),
      customerApi.list({ page: 1, limit: 200 }).catch(() => ({ data: [] })),
      inventoryApi.list({ page: 1, limit: 200 }).catch(() => ({ data: [] })),
    ])
      .then(([s, tp, st, cs, pr]) => {
        if (!active) return;
        setSummary(s);
        setTopProducts(tp);
        setStaff(st);
        setCustomers((cs as { data: Customer[] }).data || []);
        setProducts((pr as { data: Product[] }).data || []);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [period]);

  const topCustomer = useMemo(
    () =>
      [...customers].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))[0] ||
      null,
    [customers]
  );

  const topCashier = staff[0] || null;

  const lowStock = useMemo(
    () => products.filter((p) => p.stock <= p.lowStockThreshold),
    [products]
  );

  const rangeLabel = RANGES.find((r) => r.value === period)?.label || period;

  const avgBasket =
    summary && summary.totalTransactions > 0
      ? Math.round(summary.totalSales / summary.totalTransactions)
      : 0;

  const print = () => {
    printHtml(
      reportsHtml({
        meta: {
          businessName: 'BizOS',
          currency,
          rangeLabel,
          generatedAt: new Date().toISOString(),
        },
        sections: [
          {
            kind: 'summary',
            title: 'Overview',
            rows: [
              { label: 'Revenue', value: formatCurrency(summary?.totalSales || 0, currency) },
              { label: 'Transactions', value: String(summary?.totalTransactions || 0) },
              { label: 'Average basket', value: formatCurrency(avgBasket, currency) },
              { label: 'Discounts given', value: formatCurrency(summary?.totalDiscount || 0, currency) },
              { label: 'VAT collected', value: formatCurrency(summary?.totalTax || 0, currency) },
            ],
          },
          {
            kind: 'summary',
            title: 'Highlights',
            rows: [
              { label: 'Top product', value: topProducts[0]?.name || '—' },
              { label: 'Top customer', value: topCustomer?.name || '—' },
              { label: 'Top cashier', value: topCashier?.name || '—' },
              { label: 'Low-stock items', value: String(lowStock.length) },
              { label: 'Total customers', value: String(customers.length) },
              { label: 'Products tracked', value: String(products.length) },
            ],
          },
          {
            kind: 'table',
            title: 'Top 5 products',
            columns: ['Product', 'Qty sold', 'Revenue'],
            rows: topProducts.map((p) => [
              p.name,
              String(p.qty),
              formatCurrency(p.revenue, currency),
            ]),
          },
        ],
      }),
      { title: `General report — ${rangeLabel}`, width: 900, height: 800 }
    );
  };

  const exportCsv = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Period', rangeLabel],
      ['Revenue', formatCurrency(summary?.totalSales || 0, currency)],
      ['Transactions', String(summary?.totalTransactions || 0)],
      ['Average basket', formatCurrency(avgBasket, currency)],
      ['Discounts', formatCurrency(summary?.totalDiscount || 0, currency)],
      ['VAT', formatCurrency(summary?.totalTax || 0, currency)],
      ['Top product', topProducts[0]?.name || '—'],
      ['Top customer', topCustomer?.name || '—'],
      ['Top cashier', topCashier?.name || '—'],
      ['Low stock items', String(lowStock.length)],
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `general-report-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ type: 'success', message: 'General report exported' });
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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Revenue" value={formatCurrency(summary?.totalSales || 0, currency)} hint={rangeLabel} />
        <Kpi label="Transactions" value={String(summary?.totalTransactions || 0)} hint="Completed sales" />
        <Kpi label="Avg basket" value={formatCurrency(avgBasket, currency)} hint="Per transaction" />
        <Kpi label="Low stock" value={String(lowStock.length)} hint="Needs attention" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Top product">
          {topProducts[0] ? (
            <>
              <p className="text-base font-semibold text-fg truncate">
                {topProducts[0].name}
              </p>
              <p className="text-sm text-muted mt-1">
                {topProducts[0].qty} sold · {formatCurrency(topProducts[0].revenue, currency)}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">No product sales in this period.</p>
          )}
        </Card>

        <Card title="Top customer">
          {topCustomer ? (
            <>
              <p className="text-base font-semibold text-fg truncate">
                {topCustomer.name}
              </p>
              <p className="text-sm text-muted mt-1">
                {formatCurrency(topCustomer.totalSpent || 0, currency)} lifetime
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">No customers yet.</p>
          )}
        </Card>

        <Card title="Top cashier">
          {topCashier ? (
            <>
              <p className="text-base font-semibold text-fg truncate">
                {topCashier.name || 'Unknown'}
              </p>
              <p className="text-sm text-muted mt-1">
                {topCashier.transactions} sales · {formatCurrency(topCashier.totalSales, currency)}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">No cashier activity in this period.</p>
          )}
        </Card>
      </div>

      <Card title="Financial summary" description={rangeLabel}>
        <div className="space-y-2 text-sm">
          <Row label="Revenue" value={formatCurrency(summary?.totalSales || 0, currency)} />
          <Row label="Discounts given" value={formatCurrency(summary?.totalDiscount || 0, currency)} />
          <Row label="VAT collected" value={formatCurrency(summary?.totalTax || 0, currency)} />
          <div className="flex items-center justify-between pt-2 border-t border-border font-semibold text-fg">
            <span>Average basket</span>
            <span>{formatCurrency(avgBasket, currency)}</span>
          </div>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className="text-fg">{value}</span>
    </div>
  );
}