import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  FileText,
  Send,
  Ban,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { classNames } from '@/utils/classNames';
import { useNotifications } from '@/context/NotificationContext';
import {
  customerInvoiceApi,
  CustomerInvoice,
  CustomerInvoiceSummary,
} from '@/api/customerInvoices';
import { formatCurrency } from '@/utils/currency';
import { formatDate, formatDateTime } from '@/utils/date';
import { CreateCustomerInvoiceModal } from './CreateCustomerInvoiceModal';
import { RecordPaymentModal } from './RecordPaymentModal';

const PAGE_SIZE = 20;

const STATUS_VARIANT = {
  draft: 'neutral',
  sent: 'info',
  partial: 'warning',
  paid: 'success',
  overdue: 'danger',
  cancelled: 'neutral',
} as const;

export function CustomerInvoiceTab() {
  const { toast } = useNotifications();

  const [items, setItems] = useState<CustomerInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');

  const [selected, setSelected] = useState<CustomerInvoice | null>(null);
  const [summary, setSummary] = useState<CustomerInvoiceSummary | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

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
      const res = await customerInvoiceApi.list({
        page,
        limit: PAGE_SIZE,
        status: status || undefined,
        search: debouncedSearch || undefined,
      });
      setItems(res.data);
      setTotal(res.meta.total);
      if (res.data.length && !selected) setSelected(res.data[0]);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Could not load invoices',
      });
    } finally {
      setLoading(false);
    }
  }, [page, status, debouncedSearch, toast, selected]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, debouncedSearch]);

  const loadSummary = useCallback(async () => {
    try {
      const s = await customerInvoiceApi.summary();
      setSummary(s);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const refresh = () => {
    load();
    loadSummary();
  };

  const send = async (inv: CustomerInvoice) => {
    if (!window.confirm(`Send ${inv.invoiceNumber}? Stock will be deducted.`)) return;
    setBusy(inv._id);
    try {
      const updated = await customerInvoiceApi.send(inv._id);
      setItems((cur) => cur.map((i) => (i._id === updated._id ? updated : i)));
      if (selected?._id === updated._id) setSelected(updated);
      toast({ type: 'success', message: 'Invoice sent' });
      loadSummary();
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Send failed',
      });
    } finally {
      setBusy(null);
    }
  };

  const cancel = async (inv: CustomerInvoice) => {
    const reason = window.prompt(`Reason for cancelling ${inv.invoiceNumber}:`);
    if (!reason) return;
    setBusy(inv._id);
    try {
      const updated = await customerInvoiceApi.cancel(inv._id, reason);
      setItems((cur) => cur.map((i) => (i._id === updated._id ? updated : i)));
      if (selected?._id === updated._id) setSelected(updated);
      toast({ type: 'success', message: 'Invoice cancelled' });
      loadSummary();
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Cancel failed',
      });
    } finally {
      setBusy(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-muted">
          {total} invoice{total === 1 ? '' : 's'}
        </p>
        <Button icon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
          New invoice
        </Button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi
            label="Total billed"
            value={formatCurrency(summary.total)}
            hint={`${summary.count} invoices`}
          />
          <Kpi
            label="Paid"
            value={formatCurrency(summary.totalPaid)}
            hint={`${summary.paid} paid`}
            icon={<CheckCircle2 size={18} />}
          />
          <Kpi
            label="Outstanding"
            value={formatCurrency(summary.totalDue)}
            hint="Amount due"
            icon={<Clock size={18} />}
          />
          <Kpi
            label="Overdue"
            value={String(summary.overdue)}
            hint="Past due date"
            icon={<AlertCircle size={18} />}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
        <Card padded={false}>
          <div className="flex flex-col sm:flex-row gap-2 p-4 border-b border-border">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice number or customer..."
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
                { value: 'paid', label: 'Paid' },
                { value: 'overdue', label: 'Overdue' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-elevated border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted">Invoice</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Customer</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Due</th>
                  <th className="px-4 py-3 text-right font-medium text-muted">Amount</th>
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
                      <FileText size={32} className="mx-auto mb-2 opacity-40" />
                      No customer invoices yet.
                    </td>
                  </tr>
                ) : (
                  items.map((inv) => (
                    <tr
                      key={inv._id}
                      onClick={() => setSelected(inv)}
                      className={classNames(
                        'hover:bg-elevated cursor-pointer transition',
                        selected?._id === inv._id && 'bg-brand-50 dark:bg-brand-500/10'
                      )}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-fg font-mono text-xs">
                          {inv.invoiceNumber}
                        </p>
                        <p className="text-xs text-muted mt-0.5">
                          {inv.issuedAt ? formatDate(inv.issuedAt) : '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-fg truncate max-w-[200px]">
                        {inv.customerSnapshot.name}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {inv.dueDate ? formatDate(inv.dueDate) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-fg">
                        {formatCurrency(inv.total, inv.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[inv.status]}>
                          {inv.status}
                        </Badge>
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

        {selected ? (
          <Card padded={false}>
            <div className="p-5 border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted uppercase tracking-wider">
                    Invoice
                  </p>
                  <p className="text-base font-semibold text-fg font-mono mt-1 truncate">
                    {selected.invoiceNumber}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[selected.status]}>
                  {selected.status}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {selected.status === 'draft' && (
                  <Button
                    size="sm"
                    icon={<Send size={14} />}
                    loading={busy === selected._id}
                    onClick={() => send(selected)}
                  >
                    Send invoice
                  </Button>
                )}
                {(selected.status === 'sent' || selected.status === 'partial' || selected.status === 'overdue') && (
                  <Button
                    size="sm"
                    icon={<DollarSign size={14} />}
                    onClick={() => setPaymentOpen(true)}
                  >
                    Record payment
                  </Button>
                )}
                {selected.status !== 'cancelled' && selected.status !== 'paid' && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Ban size={14} />}
                    loading={busy === selected._id}
                    onClick={() => cancel(selected)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
                  Billed to
                </p>
                <p className="text-sm font-medium text-fg">
                  {selected.customerSnapshot.name}
                </p>
                {selected.customerSnapshot.email && (
                  <p className="text-xs text-muted mt-0.5">
                    {selected.customerSnapshot.email}
                  </p>
                )}
                {selected.customerSnapshot.phone && (
                  <p className="text-xs text-muted">
                    {selected.customerSnapshot.phone}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wider">
                    Issued
                  </p>
                  <p className="text-sm text-fg mt-1">
                    {selected.issuedAt ? formatDate(selected.issuedAt) : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted uppercase tracking-wider">
                    Due
                  </p>
                  <p className="text-sm text-fg mt-1">
                    {selected.dueDate ? formatDate(selected.dueDate) : '—'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
                  Items
                </p>
                <ul className="divide-y divide-border">
                  {selected.items.map((item, i) => (
                    <li key={i} className="py-2 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-fg truncate">{item.name}</p>
                        <p className="text-xs text-muted mt-0.5">
                          {item.qty} × {formatCurrency(item.unitPrice, selected.currency)}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-fg shrink-0">
                        {formatCurrency(item.subtotal, selected.currency)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-border pt-3 space-y-1 text-sm">
                <Row
                  label="Subtotal"
                  value={formatCurrency(selected.subtotal, selected.currency)}
                />
                {selected.discount > 0 && (
                  <Row
                    label="Discount"
                    value={`−${formatCurrency(selected.discount, selected.currency)}`}
                  />
                )}
                {selected.tax > 0 && (
                  <Row
                    label="VAT"
                    value={formatCurrency(selected.tax, selected.currency)}
                  />
                )}
                <div className="flex items-center justify-between pt-2 border-t border-border font-semibold text-fg">
                  <span>Total</span>
                  <span>{formatCurrency(selected.total, selected.currency)}</span>
                </div>
                {selected.amountPaid > 0 && (
                  <Row
                    label="Paid"
                    value={formatCurrency(selected.amountPaid, selected.currency)}
                  />
                )}
                {selected.amountDue > 0 && (
                  <div className="flex items-center justify-between text-brand-600 dark:text-brand-400 font-semibold">
                    <span>Amount due</span>
                    <span>{formatCurrency(selected.amountDue, selected.currency)}</span>
                  </div>
                )}
              </div>

              {selected.payments.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
                    Payment history
                  </p>
                  <ul className="divide-y divide-border">
                    {selected.payments.map((p, i) => (
                      <li key={i} className="py-2 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm text-fg">
                            {p.method || 'Payment'}
                          </p>
                          <p className="text-xs text-muted mt-0.5">
                            {p.reference || '—'} · {formatDateTime(p.recordedAt)}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-green-600 dark:text-green-400 shrink-0">
                          +{formatCurrency(p.amount, selected.currency)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.cancelledAt && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted">
                    Cancelled {formatDateTime(selected.cancelledAt)}
                    {selected.cancelReason && ` · ${selected.cancelReason}`}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card>
            <p className="text-sm text-muted py-8 text-center">
              Select an invoice to view details.
            </p>
          </Card>
        )}
      </div>

      {createOpen && (
        <CreateCustomerInvoiceModal
          onClose={() => setCreateOpen(false)}
          onCreated={(inv) => {
            setCreateOpen(false);
            refresh();
            setSelected(inv);
          }}
        />
      )}

      {paymentOpen && selected && (
        <RecordPaymentModal
          invoice={selected}
          onClose={() => setPaymentOpen(false)}
          onSaved={(updated) => {
            setPaymentOpen(false);
            setItems((cur) => cur.map((i) => (i._id === updated._id ? updated : i)));
            setSelected(updated);
            loadSummary();
          }}
        />
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted">{label}</p>
          <p className="text-lg font-semibold text-fg mt-1 truncate">{value}</p>
          <p className="text-xs text-muted mt-1">{hint}</p>
        </div>
        {icon && (
          <div className="shrink-0 w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
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