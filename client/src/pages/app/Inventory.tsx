import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Plus, Minus, History as HistoryIcon, Boxes } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { classNames } from '@/utils/classNames';
import { useNotifications } from '@/context/NotificationContext';
import { inventoryApi } from '@/api/inventory';
import { formatCurrency } from '@/utils/currency';
import { relativeTime } from '@/utils/date';
import type { Product } from '@/types/product';
import type { InventoryMovement } from '@/types/inventory';

const PAGE_SIZE = 20;

type View = 'all' | 'low' | 'out';

function stockStatus(p: Product): 'healthy' | 'low' | 'out' {
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
  low: 'Low stock',
  out: 'Out of stock',
} as const;

const MOVEMENT_LABEL: Record<InventoryMovement['type'], string> = {
  in: 'Stock received',
  out: 'Stock issued',
  adjustment: 'Adjustment',
  purchase: 'Purchase',
  purchase_return: 'Purchase return',
  invoice: 'Invoice',
  invoice_return: 'Invoice return',
  sale: 'Sale',
  sale_return: 'Sale return',
};

export default function Inventory() {
  const { toast } = useNotifications();

  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [view, setView] = useState<View>('all');

  const [adjusting, setAdjusting] = useState<Product | null>(null);
  const [historyFor, setHistoryFor] = useState<Product | null>(null);

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
      const res = await inventoryApi.list({
        page,
        limit: PAGE_SIZE,
        lowStock: view === 'low' ? true : undefined,
        search: debouncedSearch || undefined,
      });
      setItems(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Could not load inventory',
      });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, view, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    if (view === 'out') return items.filter((p) => p.stock === 0);
    return items;
  }, [items, view]);

  const stats = useMemo(() => {
    const lowCount = items.filter((p) => stockStatus(p) === 'low').length;
    const outCount = items.filter((p) => p.stock === 0).length;
    const value = items.reduce((sum, p) => sum + p.cost * p.stock, 0);
    return { lowCount, outCount, value };
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-fg">Inventory</h1>
        <p className="text-sm text-muted mt-1">
          Stock levels, adjustments, and movement history.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Stock value" value={formatCurrency(stats.value)} hint="At cost" />
        <KPI label="Products" value={String(total)} hint="In this view" />
        <KPI label="Low stock" value={String(stats.lowCount)} hint="Below reorder" />
        <KPI label="Out of stock" value={String(stats.outCount)} hint="Needs action" />
      </div>

      <Card padded={false}>
        <div className="flex flex-col sm:flex-row gap-2 p-4 border-b border-border">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or SKU..."
            icon={<Search size={14} />}
          />
          <div className="flex gap-1">
            {(['all', 'low', 'out'] as View[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setView(v);
                  setPage(1);
                }}
                className={classNames(
                  'px-3 py-2 rounded-md text-sm font-medium transition whitespace-nowrap',
                  view === v
                    ? 'bg-brand-600 text-white'
                    : 'bg-elevated text-muted hover:text-fg'
                )}
              >
                {v === 'all' ? 'All stock' : v === 'low' ? 'Low stock' : 'Out of stock'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-elevated border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted">Product</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Location</th>
                <th className="px-4 py-3 text-right font-medium text-muted">On hand</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Reorder at</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Value</th>
                <th className="px-4 py-3 text-left font-medium text-muted">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-muted">
                    <Boxes size={32} className="mx-auto mb-2 opacity-40" />
                    No products in this view.
                  </td>
                </tr>
              ) : (
                visible.map((p) => {
                  const s = stockStatus(p);
                  return (
                    <tr key={p._id} className="hover:bg-elevated transition">
                      <td className="px-4 py-3">
                        <p className="font-medium text-fg">{p.name}</p>
                        <p className="text-xs text-muted mt-0.5">{p.sku || '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {p.location || '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-fg">{p.stock}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-muted">
                        {p.lowStockThreshold}
                      </td>
                      <td className="px-4 py-3 text-right text-fg">
                        {formatCurrency(p.cost * p.stock)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[s]}>{STATUS_LABEL[s]}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<Plus size={12} />}
                            onClick={() => setAdjusting(p)}
                          >
                            Adjust
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            icon={<HistoryIcon size={12} />}
                            onClick={() => setHistoryFor(p)}
                          >
                            History
                          </Button>
                        </div>
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

      {adjusting && (
        <AdjustModal
          product={adjusting}
          onClose={() => setAdjusting(null)}
          onSaved={() => {
            setAdjusting(null);
            load();
          }}
        />
      )}

      {historyFor && (
        <HistoryDrawer
          product={historyFor}
          onClose={() => setHistoryFor(null)}
        />
      )}
    </div>
  );
}

function KPI({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-xl font-semibold text-fg mt-1 truncate">{value}</p>
      <p className="text-xs text-muted mt-1">{hint}</p>
    </div>
  );
}

function AdjustModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useNotifications();
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [qty, setQty] = useState('1');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const n = Number(qty);
    if (!Number.isFinite(n) || n <= 0) {
      toast({ type: 'error', message: 'Enter a positive number' });
      return;
    }
    const delta = mode === 'add' ? n : -n;
    if (product.stock + delta < 0) {
      toast({ type: 'error', message: 'Stock cannot go below zero' });
      return;
    }
    setSaving(true);
    try {
      await inventoryApi.adjust({
        productId: product._id,
        qty: delta,
        reason: reason || (mode === 'add' ? 'Stock added' : 'Stock removed'),
      });
      toast({ type: 'success', message: 'Stock adjusted' });
      onSaved();
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Adjust failed',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Adjust ${product.name}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={submit}>
            Apply
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="bg-elevated rounded-md px-3 py-2 text-sm">
          <span className="text-muted">Current stock:</span>{' '}
          <span className="font-semibold text-fg">{product.stock}</span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('add')}
            className={classNames(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition',
              mode === 'add'
                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                : 'border-border bg-surface text-muted hover:bg-elevated'
            )}
          >
            <Plus size={14} />
            Add
          </button>
          <button
            type="button"
            onClick={() => setMode('remove')}
            className={classNames(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition',
              mode === 'remove'
                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                : 'border-border bg-surface text-muted hover:bg-elevated'
            )}
          >
            <Minus size={14} />
            Remove
          </button>
        </div>

        <FormField label="Quantity">
          <Input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </FormField>

        <FormField label="Reason">
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={mode === 'add' ? 'Delivery received' : 'Damaged goods'}
          />
        </FormField>

        <p className="text-xs text-muted">
          New balance will be{' '}
          <span className="font-medium text-fg">
            {product.stock + (mode === 'add' ? Number(qty) || 0 : -(Number(qty) || 0))}
          </span>
          .
        </p>
      </div>
    </Modal>
  );
}

function HistoryDrawer({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const { toast } = useNotifications();
  const [items, setItems] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    inventoryApi
      .history(product._id, { page: 1, limit: 50 })
      .then((res) => {
        if (!active) return;
        setItems(res.data);
      })
      .catch(() => {
        if (!active) return;
        toast({ type: 'error', message: 'Could not load history' });
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [product._id, toast]);

  return (
    <Modal open onClose={onClose} title={`${product.name} — Movement history`} size="lg">
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted py-8 text-center">
          No movements recorded yet.
        </p>
      ) : (
        <ul className="divide-y divide-border -mx-5">
          {items.map((m) => {
            const positive = m.qty > 0;
            return (
              <li key={m._id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fg">
                    {MOVEMENT_LABEL[m.type] || m.type}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {m.reason || 'No reason'} · {relativeTime(m.createdAt)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={classNames(
                      'text-sm font-semibold',
                      positive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {positive ? '+' : ''}
                    {m.qty}
                  </p>
                  {m.balanceAfter != null && (
                    <p className="text-xs text-muted mt-0.5">
                      Balance: {m.balanceAfter}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}