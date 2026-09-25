import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Truck,
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
import { useClient } from '@/context/ClientContext';
import { purchaseOrderApi } from '@/api/purchaseOrders';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { ROUTES } from '@/utils/constants';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchaseOrder';

const PAGE_SIZE = 20;

const STATUS_VARIANT: Record<
  PurchaseOrderStatus,
  'neutral' | 'info' | 'warning' | 'success' | 'danger'
> = {
  draft: 'neutral',
  sent: 'info',
  partial: 'warning',
  received: 'success',
  cancelled: 'danger',
};

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { settings } = useClient();
  const { toast } = useNotifications();
  const currency = (settings.currency as string) || 'KES';

  const supplierFilter = params.get('supplier') || '';

  const [items, setItems] = useState<PurchaseOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await purchaseOrderApi.list({
        page,
        limit: PAGE_SIZE,
        status: status ? (status as PurchaseOrderStatus) : undefined,
        supplierId: supplierFilter || undefined,
        search: debouncedSearch || undefined,
      });
      setItems(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Could not load orders',
      });
    } finally {
      setLoading(false);
    }
  }, [page, status, debouncedSearch, supplierFilter, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const open = items.filter(
      (o) => o.status === 'draft' || o.status === 'sent' || o.status === 'partial'
    ).length;
    const value = items.reduce((s, o) => s + o.total, 0);
    return { open, value };
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-fg">Purchase orders</h1>
          <p className="text-sm text-muted mt-1">
            {total} order{total === 1 ? '' : 's'}
            {supplierFilter && ' · filtered by supplier'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={ROUTES.suppliers}>
            <Button size="sm" variant="outline" icon={<Truck size={14} />}>
              Suppliers
            </Button>
          </Link>
          <Link
            to={
              supplierFilter
                ? `${ROUTES.purchaseOrderNew}?supplier=${supplierFilter}`
                : ROUTES.purchaseOrderNew
            }
          >
            <Button icon={<Plus size={16} />}>New order</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Open orders" value={String(stats.open)} hint="Not yet received" />
        <Kpi label="Total value" value={formatCurrency(stats.value, currency)} hint="This page" />
        <Kpi
          label="Drafts"
          value={String(items.filter((o) => o.status === 'draft').length)}
          hint="Not sent"
        />
        <Kpi
          label="Received"
          value={String(items.filter((o) => o.status === 'received').length)}
          hint="Complete"
        />
      </div>

      <Card padded={false}>
        <div className="flex flex-col sm:flex-row gap-2 p-4 border-b border-border">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PO number or supplier..."
            icon={<Search size={14} />}
          />
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All statuses' },
              { value: 'draft', label: 'Draft' },
              { value: 'sent', label: 'Sent' },
              { value: 'partial', label: 'Partial' },
              { value: 'received', label: 'Received' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-elevated border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted">PO number</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Supplier</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Expected</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Total</th>
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
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center text-muted">
                    <PackageIcon size={32} className="mx-auto mb-2 opacity-40" />
                    No purchase orders yet.
                  </td>
                </tr>
              ) : (
                items.map((po) => (
                  <tr
                    key={po._id}
                    onClick={() => navigate(ROUTES.purchaseOrderDetail(po._id))}
                    className="hover:bg-elevated cursor-pointer transition"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-fg font-mono text-xs">
                        {po.poNumber}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {po.items.length} item{po.items.length === 1 ? '' : 's'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-fg truncate max-w-[200px]">
                      {po.supplierSnapshot.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {po.expectedAt ? formatDate(po.expectedAt) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-fg">
                      {formatCurrency(po.total, po.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[po.status]}>{po.status}</Badge>
                    </td>
                  </tr>
                ))
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