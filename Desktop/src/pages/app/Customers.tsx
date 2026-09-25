import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Archive,
  Star,
  Users as UsersIcon,
  Sparkles,
  History as HistoryIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { classNames } from '@/utils/classNames';
import { useNotifications } from '@/context/NotificationContext';
import { customerApi } from '@/api/customers';
import { loyaltyApi } from '@/api/loyalty';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime, relativeTime } from '@/utils/date';
import type { Customer } from '@/types/customer';
import type { LoyaltyTransaction } from '@/api/loyalty';

const PAGE_SIZE = 20;

const TIER_VARIANT = {
  none: 'neutral',
  bronze: 'warning',
  silver: 'info',
  gold: 'success',
} as const;

const MOVEMENT_LABEL: Record<string, string> = {
  earn: 'Points earned',
  redeem: 'Points redeemed',
  adjust: 'Manual adjustment',
  expire: 'Expired',
  refund: 'Reversed',
};

export default function Customers() {
  const { toast } = useNotifications();

  const [items, setItems] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [selected, setSelected] = useState<Customer | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);

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
      const res = await customerApi.list({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      setItems(res.data);
      setTotal(res.meta.total);
      if (res.data.length && !selected) setSelected(res.data[0]);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Could not load customers',
      });
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, toast, selected]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  const stats = useMemo(() => {
    const totalSpend = items.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const totalPoints = items.reduce((sum, c) => sum + (c.points || 0), 0);
    const withPoints = items.filter((c) => c.points > 0).length;
    return { totalSpend, totalPoints, withPoints };
  }, [items]);

  const archive = async (customer: Customer) => {
    if (!window.confirm(`Archive ${customer.name}?`)) return;
    try {
      await customerApi.remove(customer._id);
      toast({ type: 'success', message: 'Customer archived' });
      setSelected(null);
      load();
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Archive failed',
      });
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-fg">Customers</h1>
          <p className="text-sm text-muted mt-1">
            {total} customer{total === 1 ? '' : 's'}
          </p>
        </div>
        <Button
          icon={<Plus size={16} />}
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Add customer
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Total customers" value={String(total)} hint="All accounts" />
        <Kpi label="Lifetime spend" value={formatCurrency(stats.totalSpend)} hint="This page" />
        <Kpi label="Points issued" value={stats.totalPoints.toLocaleString()} hint="Outstanding balance" />
        <Kpi label="Loyalty members" value={String(stats.withPoints)} hint="Have points" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        <Card padded={false}>
          <div className="p-4 border-b border-border">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone or email..."
              icon={<Search size={14} />}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-elevated border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Contact</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Spent</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Points</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Last purchase</th>
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
                      <UsersIcon size={32} className="mx-auto mb-2 opacity-40" />
                      No customers yet.
                    </td>
                  </tr>
                ) : (
                  items.map((c) => (
                    <tr
                      key={c._id}
                      onClick={() => setSelected(c)}
                      className={classNames(
                        'hover:bg-elevated cursor-pointer transition',
                        selected?._id === c._id && 'bg-brand-50 dark:bg-brand-500/10'
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-fg">{c.name}</span>
                          {c.loyaltyTier !== 'none' && (
                            <Badge variant={TIER_VARIANT[c.loyaltyTier]}>
                              {c.loyaltyTier}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {c.phone || c.email || '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-fg">
                        {formatCurrency(c.totalSpent)}
                      </td>
                      <td className="px-4 py-3 text-right text-fg">
                        {(c.points || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {c.lastPurchaseAt ? relativeTime(c.lastPurchaseAt) : 'Never'}
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
                Page {page} of {totalPages}
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

        {selected && (
          <CustomerDetail
            customer={selected}
            onEdit={() => {
              setEditing(selected);
              setFormOpen(true);
            }}
            onArchive={() => archive(selected)}
            onAdjust={() => setAdjustOpen(true)}
            onRefresh={load}
          />
        )}
      </div>

      {formOpen && (
        <CustomerFormModal
          customer={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
            load();
          }}
        />
      )}

      {adjustOpen && selected && (
        <AdjustPointsModal
          customer={selected}
          onClose={() => setAdjustOpen(false)}
          onSaved={() => {
            setAdjustOpen(false);
            load();
          }}
        />
      )}
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

function CustomerDetail({
  customer,
  onEdit,
  onArchive,
  onAdjust,
  onRefresh,
}: {
  customer: Customer;
  onEdit: () => void;
  onArchive: () => void;
  onAdjust: () => void;
  onRefresh: () => void;
}) {
  const { toast } = useNotifications();
  const [tab, setTab] = useState<'overview' | 'loyalty'>('overview');
  const [balance, setBalance] = useState<{ points: number; tier: string } | null>(null);
  const [history, setHistory] = useState<LoyaltyTransaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    let active = true;
    loyaltyApi
      .getBalance(customer._id)
      .then((b) => {
        if (active) setBalance({ points: b.points, tier: b.tier });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [customer._id]);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await loyaltyApi.getHistory(customer._id, { page: 1, limit: 20 });
      setHistory(res.data);
    } catch {
      /* silent */
    } finally {
      setLoadingHistory(false);
    }
  }, [customer._id]);

  useEffect(() => {
    if (tab === 'loyalty') loadHistory();
  }, [tab, loadHistory]);

  return (
    <Card padded={false}>
      <div className="p-5 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-fg truncate">
              {customer.name}
            </h2>
            <p className="text-xs text-muted mt-1 truncate">
              {customer.phone || customer.email || 'No contact'}
            </p>
          </div>
          {customer.loyaltyTier !== 'none' && (
            <Badge variant={TIER_VARIANT[customer.loyaltyTier]}>
              {customer.loyaltyTier}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <Button size="sm" variant="outline" onClick={onEdit} fullWidth>
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Archive size={12} />}
            onClick={onArchive}
            fullWidth
          >
            Archive
          </Button>
        </div>
      </div>

      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setTab('overview')}
          className={classNames(
            'flex-1 px-4 py-2.5 text-sm font-medium transition',
            tab === 'overview'
              ? 'text-brand-700 dark:text-brand-300 border-b-2 border-brand-600'
              : 'text-muted hover:text-fg'
          )}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setTab('loyalty')}
          className={classNames(
            'flex-1 px-4 py-2.5 text-sm font-medium transition',
            tab === 'loyalty'
              ? 'text-brand-700 dark:text-brand-300 border-b-2 border-brand-600'
              : 'text-muted hover:text-fg'
          )}
        >
          Loyalty
        </button>
      </div>

      {tab === 'overview' && (
        <div className="p-5 space-y-2 text-sm">
          <Row label="Lifetime spend" value={formatCurrency(customer.totalSpent)} />
          <Row label="Current points" value={String(balance?.points ?? customer.points ?? 0)} />
          <Row label="Tier" value={balance?.tier ?? customer.loyaltyTier} />
          <Row label="Last purchase" value={customer.lastPurchaseAt ? formatDateTime(customer.lastPurchaseAt) : 'Never'} />
          {customer.address && <Row label="Address" value={customer.address} />}
          {customer.notes && (
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-muted mb-1">Notes</p>
              <p className="text-sm text-fg">{customer.notes}</p>
            </div>
          )}
          <Row label="Member since" value={formatDateTime(customer.createdAt)} />
        </div>
      )}

      {tab === 'loyalty' && (
        <div className="p-5 space-y-4">
          <div className="rounded-lg bg-elevated p-4 text-center">
            <p className="text-xs text-muted uppercase tracking-wider">Points balance</p>
            <p className="text-3xl font-semibold text-fg mt-1">
              {(balance?.points ?? customer.points ?? 0).toLocaleString()}
            </p>
            {balance?.tier && balance.tier !== 'none' && (
              <Badge variant={TIER_VARIANT[balance.tier as keyof typeof TIER_VARIANT]}>
                {balance.tier}
              </Badge>
            )}
          </div>

          <Button
            variant="outline"
            fullWidth
            icon={<Sparkles size={14} />}
            onClick={onAdjust}
          >
            Adjust points
          </Button>

          <div className="pt-3 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <HistoryIcon size={14} className="text-muted" />
              <p className="text-xs font-medium text-muted uppercase tracking-wider">
                Recent activity
              </p>
            </div>
            {loadingHistory ? (
              <div className="flex justify-center py-6">
                <Spinner />
              </div>
            ) : history.length === 0 ? (
              <p className="text-sm text-muted text-center py-6">
                No loyalty activity yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {history.map((tx) => (
                  <li key={tx._id} className="py-2.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-fg">
                        {MOVEMENT_LABEL[tx.type] || tx.type}
                      </p>
                      <p className="text-xs text-muted mt-0.5 truncate">
                        {tx.reason || relativeTime(tx.createdAt)}
                      </p>
                    </div>
                    <span
                      className={classNames(
                        'text-sm font-semibold shrink-0',
                        tx.points > 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {tx.points > 0 ? '+' : ''}
                      {tx.points}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="text-fg text-right truncate">{value}</span>
    </div>
  );
}

function CustomerFormModal({
  customer,
  onClose,
  onSaved,
}: {
  customer: Customer | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useNotifications();
  const isEdit = Boolean(customer);
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    address: customer?.address || '',
    notes: customer?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name.trim()) {
      toast({ type: 'error', message: 'Name is required' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };
      if (isEdit && customer) {
        await customerApi.update(customer._id, payload);
        toast({ type: 'success', message: 'Customer updated' });
      } else {
        await customerApi.create(payload);
        toast({ type: 'success', message: 'Customer added' });
      }
      onSaved();
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Save failed',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? 'Edit customer' : 'Add customer'}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={submit}>
            {isEdit ? 'Save changes' : 'Create'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Name" required>
          <Input
            autoFocus
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </FormField>
        <FormField label="Phone">
          <Input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+254..."
          />
        </FormField>
        <FormField label="Email">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </FormField>
        <FormField label="Address">
          <Input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </FormField>
        <FormField label="Notes">
          <Input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Any details worth remembering"
          />
        </FormField>
      </div>
    </Modal>
  );
}

function AdjustPointsModal({
  customer,
  onClose,
  onSaved,
}: {
  customer: Customer;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useNotifications();
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const n = Number(points);
    if (!Number.isFinite(n) || n <= 0) {
      toast({ type: 'error', message: 'Enter a positive number' });
      return;
    }
    const delta = mode === 'add' ? n : -n;
    setSaving(true);
    try {
      await loyaltyApi.adjust(customer._id, delta, reason || undefined);
      toast({ type: 'success', message: 'Points adjusted' });
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
      title={`Adjust points — ${customer.name}`}
      size="md"
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
        <div className="rounded-md bg-elevated px-3 py-2 text-sm">
          <span className="text-muted">Current balance: </span>
          <span className="font-medium text-fg">{customer.points.toLocaleString()} pts</span>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('add')}
            className={classNames(
              'flex-1 px-4 py-2 rounded-md border text-sm font-medium transition',
              mode === 'add'
                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                : 'border-border bg-surface text-muted hover:bg-elevated'
            )}
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setMode('remove')}
            className={classNames(
              'flex-1 px-4 py-2 rounded-md border text-sm font-medium transition',
              mode === 'remove'
                ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                : 'border-border bg-surface text-muted hover:bg-elevated'
            )}
          >
            Remove
          </button>
        </div>

        <FormField label="Points">
          <Input
            type="number"
            min="1"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
          />
        </FormField>

        <FormField label="Reason">
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={mode === 'add' ? 'Goodwill bonus' : 'Correction'}
          />
        </FormField>
      </div>
    </Modal>
  );
}