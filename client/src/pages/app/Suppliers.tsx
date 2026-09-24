import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  Archive,
  Truck,
  Phone,
  Mail,
  MapPin,
  Package as PackageIcon,
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
import { useClient } from '@/context/ClientContext';
import { supplierApi } from '@/api/suppliers';
import { formatCurrency } from '@/utils/currency';
import { formatDate, relativeTime } from '@/utils/date';
import { ROUTES, PAYMENT_LABELS } from '@/utils/constants';
import type { Supplier } from '@/types/supplier';

const PAGE_SIZE = 20;

export default function Suppliers() {
  const { settings } = useClient();
  const { toast } = useNotifications();
  const currency = (settings.currency as string) || 'KES';

  const [items, setItems] = useState<Supplier[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [selected, setSelected] = useState<Supplier | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

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
      const res = await supplierApi.list({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        active: true,
      });
      setItems(res.data);
      setTotal(res.meta.total);
      if (res.data.length && !selected) setSelected(res.data[0]);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Could not load suppliers',
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
    const totalSpend = items.reduce((s, x) => s + (x.totalSpent || 0), 0);
    const withOrders = items.filter((s) => s.lastOrderAt).length;
    return { totalSpend, withOrders };
  }, [items]);

  const archive = async (s: Supplier) => {
    if (!window.confirm(`Archive ${s.name}?`)) return;
    try {
      await supplierApi.remove(s._id);
      toast({ type: 'success', message: 'Supplier archived' });
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
          <h1 className="text-2xl font-semibold text-fg">Suppliers</h1>
          <p className="text-sm text-muted mt-1">
            {total} supplier{total === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={ROUTES.purchaseOrders}>
            <Button size="sm" variant="outline" icon={<PackageIcon size={14} />}>
              Purchase orders
            </Button>
          </Link>
          <Button
            icon={<Plus size={16} />}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add supplier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Suppliers" value={String(total)} hint="Active vendors" />
        <Kpi
          label="Lifetime spend"
          value={formatCurrency(stats.totalSpend, currency)}
          hint="This page"
        />
        <Kpi label="With orders" value={String(stats.withOrders)} hint="Have purchase history" />
        <Kpi
          label="Avg per vendor"
          value={formatCurrency(
            items.length > 0 ? Math.round(stats.totalSpend / items.length) : 0,
            currency
          )}
          hint="Lifetime"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
        <Card padded={false}>
          <div className="p-4 border-b border-border">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, email, contact..."
              icon={<Search size={14} />}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-elevated border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted">Supplier</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Contact</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Lifetime spend</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Last order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center">
                      <Spinner />
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center text-muted">
                      <Truck size={32} className="mx-auto mb-2 opacity-40" />
                      No suppliers yet.
                    </td>
                  </tr>
                ) : (
                  items.map((s) => (
                    <tr
                      key={s._id}
                      onClick={() => setSelected(s)}
                      className={classNames(
                        'hover:bg-elevated cursor-pointer transition',
                        selected?._id === s._id && 'bg-brand-50 dark:bg-brand-500/10'
                      )}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-fg">{s.name}</p>
                        {s.contactName && (
                          <p className="text-xs text-muted mt-0.5">{s.contactName}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {s.phone || s.email || '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-fg">
                        {formatCurrency(s.totalSpent || 0, currency)}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {s.lastOrderAt ? relativeTime(s.lastOrderAt) : 'Never'}
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

        {selected && (
          <SupplierDetail
            supplier={selected}
            currency={currency}
            onEdit={() => {
              setEditing(selected);
              setFormOpen(true);
            }}
            onArchive={() => archive(selected)}
          />
        )}
      </div>

      {formOpen && (
        <SupplierFormModal
          supplier={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => {
            setFormOpen(false);
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

function SupplierDetail({
  supplier,
  currency,
  onEdit,
  onArchive,
}: {
  supplier: Supplier;
  currency: string;
  onEdit: () => void;
  onArchive: () => void;
}) {
  const { toast } = useNotifications();
  const [tab, setTab] = useState<'overview' | 'orders'>('overview');
  const [orders, setOrders] = useState<
    Array<{
      _id: string;
      poNumber: string;
      status: string;
      total: number;
      createdAt: string;
    }>
  >([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (tab !== 'orders') return;
    let active = true;
    setLoadingOrders(true);
    supplierApi
      .orders(supplier._id, { page: 1, limit: 20 })
      .then((res) => {
        if (!active) return;
        setOrders(
          (res.data as Array<{
            _id: string;
            poNumber: string;
            status: string;
            total: number;
            createdAt: string;
          }>) || []
        );
      })
      .catch(() =>
        toast({ type: 'error', message: 'Could not load supplier orders' })
      )
      .finally(() => active && setLoadingOrders(false));
    return () => {
      active = false;
    };
  }, [tab, supplier._id, toast]);

  return (
    <Card padded={false}>
      <div className="p-5 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-fg truncate">
              {supplier.name}
            </h2>
            {supplier.contactName && (
              <p className="text-xs text-muted mt-1">{supplier.contactName}</p>
            )}
          </div>
          <Badge variant={supplier.active ? 'success' : 'neutral'}>
            {supplier.active ? 'Active' : 'Archived'}
          </Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`${ROUTES.purchaseOrders}?supplier=${supplier._id}`} className="flex-1">
            <Button size="sm" fullWidth icon={<Plus size={12} />}>
              New order
            </Button>
          </Link>
          <Button size="sm" variant="outline" onClick={onEdit}>
            Edit
          </Button>
          <Button size="sm" variant="outline" icon={<Archive size={12} />} onClick={onArchive}>
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
          onClick={() => setTab('orders')}
          className={classNames(
            'flex-1 px-4 py-2.5 text-sm font-medium transition',
            tab === 'orders'
              ? 'text-brand-700 dark:text-brand-300 border-b-2 border-brand-600'
              : 'text-muted hover:text-fg'
          )}
        >
          Orders
        </button>
      </div>

      {tab === 'overview' && (
        <div className="p-5 space-y-4 text-sm">
          <div className="space-y-2">
            {supplier.phone && (
              <div className="flex items-center gap-2 text-muted">
                <Phone size={14} className="shrink-0" />
                <span className="truncate">{supplier.phone}</span>
              </div>
            )}
            {supplier.email && (
              <div className="flex items-center gap-2 text-muted">
                <Mail size={14} className="shrink-0" />
                <span className="truncate">{supplier.email}</span>
              </div>
            )}
            {supplier.address && (
              <div className="flex items-center gap-2 text-muted">
                <MapPin size={14} className="shrink-0" />
                <span className="truncate">{supplier.address}</span>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-3 space-y-2">
            <Row
              label="Lifetime spend"
              value={formatCurrency(supplier.totalSpent || 0, currency)}
            />
            <Row
              label="Last order"
              value={supplier.lastOrderAt ? formatDate(supplier.lastOrderAt) : 'Never'}
            />
            <Row label="Added" value={formatDate(supplier.createdAt)} />
          </div>

          {supplier.notes && (
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted mb-1">Notes</p>
              <p className="text-sm text-fg whitespace-pre-wrap">{supplier.notes}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div className="p-5">
          {loadingOrders ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">
              No purchase orders for this supplier yet.
            </p>
          ) : (
            <ul className="divide-y divide-border -mx-5">
              {orders.map((po) => (
                <li key={po._id}>
                  <Link
                    to={ROUTES.purchaseOrderDetail(po._id)}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-elevated transition"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-fg font-mono truncate">
                        {po.poNumber}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        {relativeTime(po.createdAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-fg">
                        {formatCurrency(po.total, currency)}
                      </p>
                      <p className="text-xs text-muted capitalize">{po.status}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
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

function SupplierFormModal({
  supplier,
  onClose,
  onSaved,
}: {
  supplier: Supplier | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { toast } = useNotifications();
  const isEdit = Boolean(supplier);
  const [form, setForm] = useState({
    name: supplier?.name || '',
    contactName: supplier?.contactName || '',
    phone: supplier?.phone || '',
    email: supplier?.email || '',
    address: supplier?.address || '',
    notes: supplier?.notes || '',
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
        contactName: form.contactName.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };
      if (isEdit && supplier) {
        await supplierApi.update(supplier._id, payload);
        toast({ type: 'success', message: 'Supplier updated' });
      } else {
        await supplierApi.create(payload);
        toast({ type: 'success', message: 'Supplier added' });
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
      title={isEdit ? 'Edit supplier' : 'Add supplier'}
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
        <FormField label="Company name" required>
          <Input
            autoFocus
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </FormField>
        <FormField label="Contact person">
          <Input
            value={form.contactName}
            onChange={(e) => setForm({ ...form, contactName: e.target.value })}
          />
        </FormField>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
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
            placeholder="Payment terms, delivery preferences, etc."
          />
        </FormField>
      </div>
    </Modal>
  );
}