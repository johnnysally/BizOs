import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  Package as PackageIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { classNames } from '@/utils/classNames';
import { useNotifications } from '@/context/NotificationContext';
import { saleApi } from '@/api/sales';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { PAYMENT_LABELS, ROUTES } from '@/utils/constants';
import type { Sale } from '@/types/sale';

const PAGE_SIZE = 20;

type StatusFilter = 'all' | 'paid' | 'refunded' | 'voided';

function statusOf(sale: Sale): 'paid' | 'refunded' | 'voided' | 'pending' {
  if (sale.voided) return 'voided';
  if (sale.paymentStatus === 'refunded') return 'refunded';
  if (sale.paymentStatus === 'pending') return 'pending';
  return 'paid';
}

const STATUS_VARIANT = {
  paid: 'success',
  pending: 'warning',
  refunded: 'info',
  voided: 'danger',
} as const;

export default function Sales() {
  const navigate = useNavigate();
  const { toast } = useNotifications();

  const [items, setItems] = useState<Sale[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [method, setMethod] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await saleApi.list({
        page,
        limit: PAGE_SIZE,
        paymentMethod: method || undefined,
      });
      setItems(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Could not load sales',
      });
    } finally {
      setLoading(false);
    }
  }, [page, method, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let list = items;
    if (status === 'voided') list = list.filter((s) => s.voided);
    else if (status === 'paid') list = list.filter((s) => statusOf(s) === 'paid');
    else if (status === 'refunded') list = list.filter((s) => statusOf(s) === 'refunded');
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.saleNumber.toLowerCase().includes(q) ||
          (s.customerId || '').toLowerCase().includes(q) ||
          (s.cashierId || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, status, debouncedSearch]);

  const revenue = useMemo(
    () => filtered.filter((s) => !s.voided).reduce((sum, s) => sum + s.total, 0),
    [filtered]
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const exportCsv = () => {
    const header = ['Sale', 'Date', 'Total', 'Payment', 'Status'];
    const rows = filtered.map((s) => [
      s.saleNumber,
      new Date(s.createdAt).toISOString(),
      String(s.total),
      s.paymentMethod || '',
      statusOf(s),
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bizos-sales.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast({ type: 'success', message: 'Exported' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-fg">Sales</h1>
          <p className="text-sm text-muted mt-1">
            {total} transaction{total === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Download size={14} />}
            onClick={exportCsv}
          >
            Export
          </Button>
          <Link to={ROUTES.pos}>
            <Button size="sm">New sale</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Revenue" value={formatCurrency(revenue)} hint="Current page" />
        <Kpi label="Transactions" value={String(filtered.length)} hint="Matching filters" />
        <Kpi
          label="Average order"
          value={
            filtered.filter((s) => !s.voided).length
              ? formatCurrency(
                  Math.round(
                    revenue / Math.max(1, filtered.filter((s) => !s.voided).length)
                  )
                )
              : formatCurrency(0)
          }
          hint="Per transaction"
        />
        <Kpi
          label="Voided"
          value={String(filtered.filter((s) => s.voided).length)}
          hint="On this page"
        />
      </div>

      <Card padded={false}>
        <div className="flex flex-col sm:flex-row gap-2 p-4 border-b border-border">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search receipt or ID..."
            icon={<Search size={14} />}
          />
          <Select
            value={method}
            onChange={(e) => {
              setMethod(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All methods' },
              ...Object.entries(PAYMENT_LABELS).map(([code, label]) => ({
                value: code,
                label,
              })),
            ]}
          />
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            options={[
              { value: 'all', label: 'All statuses' },
              { value: 'paid', label: 'Paid' },
              { value: 'refunded', label: 'Refunded' },
              { value: 'voided', label: 'Voided' },
            ]}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-elevated border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted">Sale</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Method</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Total</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-muted">
                    <PackageIcon size={32} className="mx-auto mb-2 opacity-40" />
                    No sales match these filters.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const st = statusOf(s);
                  return (
                    <tr
                      key={s._id}
                      onClick={() => navigate(ROUTES.saleDetail(s._id))}
                      className={classNames(
                        'hover:bg-elevated cursor-pointer transition'
                      )}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-fg">{s.saleNumber}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {s.items.length} item{s.items.length === 1 ? '' : 's'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {PAYMENT_LABELS[s.paymentMethod || ''] || s.paymentMethod || '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-fg">
                        {formatCurrency(s.total, s.currency)}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {formatDateTime(s.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[st]}>{st}</Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-elevated text-sm">
            <span className="text-muted">
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
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