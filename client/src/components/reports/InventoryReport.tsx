import { useEffect, useMemo, useState } from 'react';
import { Printer, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/context/NotificationContext';
import { useClient } from '@/context/ClientContext';
import { inventoryApi } from '@/api/inventory';
import { formatCurrency } from '@/utils/currency';
import { printHtml } from '@/utils/printHtml';
import { reportsHtml } from '@/utils/reportsHtml';
import type { Product } from '@/types/product';

function statusOf(p: Product): 'healthy' | 'low' | 'out' {
  if (p.stock === 0) return 'out';
  if (p.stock <= p.lowStockThreshold) return 'low';
  return 'healthy';
}

const STATUS_VARIANT = {
  healthy: 'success',
  low: 'warning',
  out: 'danger',
} as const;

const STATUS_LABEL = {
  healthy: 'Healthy',
  low: 'Low',
  out: 'Out',
} as const;

export function InventoryReport() {
  const { settings } = useClient();
  const { toast } = useNotifications();
  const currency = (settings.currency as string) || 'KES';

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    inventoryApi
      .list({ page: 1, limit: 200 })
      .then((res) => {
        if (active) setProducts(res.data);
      })
      .catch(() =>
        toast({ type: 'error', message: 'Could not load inventory report' })
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [toast]);

  const summary = useMemo(() => {
    const totalValue = products.reduce((s, p) => s + p.cost * p.stock, 0);
    const retailValue = products.reduce((s, p) => s + p.price * p.stock, 0);
    const low = products.filter((p) => statusOf(p) === 'low').length;
    const out = products.filter((p) => statusOf(p) === 'out').length;
    return { totalValue, retailValue, low, out };
  }, [products]);

  const rows = useMemo(
    () =>
      products.map((p) => [
        p.name,
        p.sku || '—',
        p.category || '—',
        p.location || '—',
        String(p.stock),
        String(p.lowStockThreshold),
        formatCurrency(p.cost, currency),
        formatCurrency(p.cost * p.stock, currency),
        STATUS_LABEL[statusOf(p)],
      ]),
    [products, currency]
  );

  const print = () => {
    printHtml(
      reportsHtml({
        meta: {
          businessName: 'BizOS',
          currency,
          rangeLabel: 'Current inventory snapshot',
          generatedAt: new Date().toISOString(),
        },
        sections: [
          {
            kind: 'summary',
            title: 'Valuation summary',
            rows: [
              { label: 'Products', value: String(products.length) },
              { label: 'Stock value (cost)', value: formatCurrency(summary.totalValue, currency) },
              { label: 'Retail value', value: formatCurrency(summary.retailValue, currency) },
              { label: 'Low stock', value: String(summary.low) },
              { label: 'Out of stock', value: String(summary.out) },
            ],
          },
          {
            kind: 'table',
            title: 'Product stock',
            columns: ['Product', 'SKU', 'Category', 'Location', 'Qty', 'Reorder', 'Cost', 'Value', 'Status'],
            rows,
          },
        ],
      }),
      { title: 'Inventory report', width: 1000, height: 800 }
    );
  };

  const exportCsv = () => {
    const header = ['Product', 'SKU', 'Category', 'Location', 'Qty', 'Reorder', 'Cost', 'Value', 'Status'];
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory-report.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ type: 'success', message: 'Inventory report exported' });
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
        <Kpi label="Products" value={String(products.length)} hint="Tracked items" />
        <Kpi label="Stock value" value={formatCurrency(summary.totalValue, currency)} hint="At cost" />
        <Kpi label="Low stock" value={String(summary.low)} hint="Below reorder" />
        <Kpi label="Out of stock" value={String(summary.out)} hint="Needs action" />
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-elevated border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted">Product</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Category</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Qty</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Reorder</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Value</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted">
                    No products in inventory.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const s = statusOf(p);
                  return (
                    <tr key={p._id} className="hover:bg-elevated">
                      <td className="px-4 py-3">
                        <p className="text-fg">{p.name}</p>
                        <p className="text-xs text-muted mt-0.5">{p.sku || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-muted">{p.category || '—'}</td>
                      <td className="px-4 py-3 text-right text-fg">{p.stock}</td>
                      <td className="px-4 py-3 text-right text-muted">{p.lowStockThreshold}</td>
                      <td className="px-4 py-3 text-right text-fg">
                        {formatCurrency(p.cost * p.stock, currency)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[s]}>{STATUS_LABEL[s]}</Badge>
                      </td>
                    </tr>
                  );
                })
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