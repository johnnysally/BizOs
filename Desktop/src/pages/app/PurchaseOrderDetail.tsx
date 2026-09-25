import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  PackageCheck,
  Ban,
  Printer,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/context/NotificationContext';
import { useClient } from '@/context/ClientContext';
import { purchaseOrderApi } from '@/api/purchaseOrders';
import { supplierApi } from '@/api/suppliers';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { printHtml } from '@/utils/printHtml';
import { escapeHtml, money } from '@/utils/printHtml';
import { ROUTES } from '@/utils/constants';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchaseOrder';

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

export default function PurchaseOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useClient();
  const { toast } = useNotifications();
  const currency = (settings.currency as string) || 'KES';

  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [receiveOpen, setReceiveOpen] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await purchaseOrderApi.get(id);
      setPo(data);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Could not load order',
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const send = async () => {
    if (!po) return;
    if (!window.confirm(`Mark ${po.poNumber} as sent to supplier?`)) return;
    setBusy('send');
    try {
      const updated = await purchaseOrderApi.send(po._id);
      setPo(updated);
      toast({ type: 'success', message: 'Marked as sent' });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Send failed',
      });
    } finally {
      setBusy(null);
    }
  };

  const cancel = async () => {
    if (!po) return;
    const reason = window.prompt(`Reason for cancelling ${po.poNumber}:`);
    if (!reason) return;
    setBusy('cancel');
    try {
      const updated = await purchaseOrderApi.cancel(po._id, reason);
      setPo(updated);
      toast({ type: 'success', message: 'Order cancelled' });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Cancel failed',
      });
    } finally {
      setBusy(null);
    }
  };

  const print = () => {
    if (!po) return;
    const html = buildPoHtml(po, currency);
    printHtml(html, { title: po.poNumber, width: 800, height: 900 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!po) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-fg">Purchase order not found.</p>
        <Link to={ROUTES.purchaseOrders} className="inline-block mt-4">
          <Button variant="outline">Back to orders</Button>
        </Link>
      </div>
    );
  }

  const canSend = po.status === 'draft';
  const canReceive = po.status === 'sent' || po.status === 'partial';
  const canCancel = po.status === 'draft' || po.status === 'sent';

  const totalReceived = po.items.reduce((s, i) => s + i.receivedQty, 0);
  const totalOrdered = po.items.reduce((s, i) => s + i.qty, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(ROUTES.purchaseOrders)}
          className="p-2 rounded-md text-muted hover:bg-elevated hover:text-fg transition"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-fg font-mono truncate">
              {po.poNumber}
            </h1>
            <Badge variant={STATUS_VARIANT[po.status]}>{po.status}</Badge>
          </div>
          <p className="text-sm text-muted mt-1">
            Created {formatDateTime(po.createdAt)}
            {po.sentAt && ` · Sent ${formatDateTime(po.sentAt)}`}
            {po.receivedAt && ` · Received ${formatDateTime(po.receivedAt)}`}
          </p>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Printer size={14} />}
            onClick={print}
          >
            Print
          </Button>
          {canSend && (
            <Button
              size="sm"
              icon={<Send size={14} />}
              loading={busy === 'send'}
              onClick={send}
            >
              Mark as sent
            </Button>
          )}
          {canReceive && (
            <Button
              size="sm"
              icon={<PackageCheck size={14} />}
              onClick={() => setReceiveOpen(true)}
            >
              Receive items
            </Button>
          )}
          {canCancel && (
            <Button
              size="sm"
              variant="outline"
              icon={<Ban size={14} />}
              loading={busy === 'cancel'}
              onClick={cancel}
            >
              Cancel order
            </Button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Supplier" className="lg:col-span-1">
          <p className="text-sm font-medium text-fg">
            {po.supplierSnapshot.name || '—'}
          </p>
          {po.supplierSnapshot.contactName && (
            <p className="text-xs text-muted mt-1">
              {po.supplierSnapshot.contactName}
            </p>
          )}
          {po.supplierSnapshot.phone && (
            <p className="text-xs text-muted">{po.supplierSnapshot.phone}</p>
          )}
          {po.supplierSnapshot.email && (
            <p className="text-xs text-muted">{po.supplierSnapshot.email}</p>
          )}
          <Link
            to={ROUTES.suppliers}
            className="inline-block text-xs text-brand-600 dark:text-brand-400 hover:underline mt-3"
          >
            View supplier →
          </Link>
        </Card>

        <Card title="Delivery" className="lg:col-span-1">
          <div className="space-y-2 text-sm">
            <Row
              label="Expected"
              value={po.expectedAt ? formatDateTime(po.expectedAt) : '—'}
            />
            <Row
              label="Received"
              value={po.receivedAt ? formatDateTime(po.receivedAt) : '—'}
            />
            <Row
              label="Progress"
              value={`${totalReceived} / ${totalOrdered} items`}
            />
          </div>
        </Card>

        <Card title="Total" className="lg:col-span-1">
          <p className="text-2xl font-semibold text-fg">
            {formatCurrency(po.total, po.currency || currency)}
          </p>
          <div className="mt-3 space-y-1 text-sm">
            <Row
              label="Subtotal"
              value={formatCurrency(po.subtotal, po.currency || currency)}
            />
            {po.shipping > 0 && (
              <Row
                label="Shipping"
                value={formatCurrency(po.shipping, po.currency || currency)}
              />
            )}
          </div>
        </Card>
      </div>

      <Card title="Line items" padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-elevated border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted">Item</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Ordered</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Received</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Unit cost</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {po.items.map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <p className="text-fg">{item.name}</p>
                    {item.sku && (
                      <p className="text-xs text-muted mt-0.5">{item.sku}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-fg">{item.qty}</td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={
                        item.receivedQty >= item.qty
                          ? 'text-green-600 dark:text-green-400 font-medium'
                          : item.receivedQty > 0
                          ? 'text-amber-600 dark:text-amber-400 font-medium'
                          : 'text-muted'
                      }
                    >
                      {item.receivedQty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-fg">
                    {formatCurrency(item.unitCost, po.currency || currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-fg">
                    {formatCurrency(item.subtotal, po.currency || currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {po.notes && (
        <Card title="Notes">
          <p className="text-sm text-fg whitespace-pre-wrap">{po.notes}</p>
        </Card>
      )}

      {po.cancelledAt && (
        <Card>
          <p className="text-sm text-muted">
            Cancelled {formatDateTime(po.cancelledAt)}
            {po.cancelReason && ` · ${po.cancelReason}`}
          </p>
        </Card>
      )}

      {receiveOpen && (
        <ReceiveModal
          po={po}
          currency={currency}
          onClose={() => setReceiveOpen(false)}
          onSaved={(updated) => {
            setPo(updated);
            setReceiveOpen(false);
            toast({ type: 'success', message: 'Items received' });
          }}
        />
      )}
    </div>
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

function ReceiveModal({
  po,
  currency,
  onClose,
  onSaved,
}: {
  po: PurchaseOrder;
  currency: string;
  onClose: () => void;
  onSaved: (updated: PurchaseOrder) => void;
}) {
  const { toast } = useNotifications();
  const [qtys, setQtys] = useState<number[]>(
    po.items.map((i) => Math.max(0, i.qty - i.receivedQty))
  );
  const [saving, setSaving] = useState(false);

  const receiveAll = () =>
    setQtys(po.items.map((i) => Math.max(0, i.qty - i.receivedQty)));

  const receiveNone = () => setQtys(po.items.map(() => 0));

  const submit = async () => {
    const lines = qtys
      .map((qty, index) => ({ index, qty }))
      .filter((l) => l.qty > 0);

    if (!lines.length) {
      toast({ type: 'error', message: 'Enter quantities to receive' });
      return;
    }

    setSaving(true);
    try {
      const updated = await purchaseOrderApi.receive(po._id, { items: lines });
      onSaved(updated);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Receive failed',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Receive items — ${po.poNumber}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={submit}>
            Confirm receipt
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            Enter received quantities per line. Stock is updated on confirm.
          </p>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={receiveAll}>
              All
            </Button>
            <Button size="sm" variant="ghost" onClick={receiveNone}>
              None
            </Button>
          </div>
        </div>

        <ul className="divide-y divide-border">
          {po.items.map((item, i) => {
            const remaining = Math.max(0, item.qty - item.receivedQty);
            return (
              <li key={i} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-fg truncate">{item.name}</p>
                  <p className="text-xs text-muted mt-0.5">
                    Ordered {item.qty} · Already received {item.receivedQty} · Remaining {remaining}
                  </p>
                </div>
                <div className="w-24 shrink-0">
                  <Input
                    type="number"
                    min="0"
                    max={remaining}
                    value={String(qtys[i] ?? 0)}
                    onChange={(e) => {
                      const next = [...qtys];
                      next[i] = Math.max(0, Math.min(remaining, Number(e.target.value) || 0));
                      setQtys(next);
                    }}
                    disabled={remaining === 0}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <p className="text-xs text-muted">
          Total value at unit cost:{' '}
          {money(
            po.items.reduce(
              (s, item, i) => s + (qtys[i] || 0) * item.unitCost,
              0
            ),
            currency
          )}
        </p>
      </div>
    </Modal>
  );
}

function buildPoHtml(po: PurchaseOrder, currency: string): string {
  const lines: string[] = [];
  lines.push('<h1>Purchase Order</h1>');
  lines.push(`<p class="center muted small">${escapeHtml(po.poNumber)}</p>`);
  lines.push('<hr />');

  lines.push('<div class="row"><span class="label">Supplier</span><span>' +
    escapeHtml(po.supplierSnapshot.name || '—') + '</span></div>');
  if (po.supplierSnapshot.phone) {
    lines.push('<div class="row"><span class="label">Phone</span><span>' +
      escapeHtml(po.supplierSnapshot.phone) + '</span></div>');
  }
  if (po.supplierSnapshot.email) {
    lines.push('<div class="row"><span class="label">Email</span><span>' +
      escapeHtml(po.supplierSnapshot.email) + '</span></div>');
  }
  lines.push('<div class="row"><span class="label">Status</span><span>' +
    escapeHtml(po.status) + '</span></div>');
  lines.push('<div class="row"><span class="label">Created</span><span>' +
    escapeHtml(new Date(po.createdAt).toLocaleString()) + '</span></div>');
  if (po.expectedAt) {
    lines.push('<div class="row"><span class="label">Expected</span><span>' +
      escapeHtml(new Date(po.expectedAt).toLocaleDateString()) + '</span></div>');
  }

  lines.push('<hr />');
  lines.push('<table><thead><tr><th>Item</th><th class="num">Qty</th><th class="num">Unit cost</th><th class="num">Subtotal</th></tr></thead><tbody>');
  for (const item of po.items) {
    lines.push(
      `<tr><td>${escapeHtml(item.name)}</td><td class="num">${item.qty}</td><td class="num">${escapeHtml(money(item.unitCost, currency))}</td><td class="num">${escapeHtml(money(item.subtotal, currency))}</td></tr>`
    );
  }
  lines.push('</tbody></table>');

  lines.push('<hr />');
  lines.push(`<div class="row"><span class="label">Subtotal</span><span>${escapeHtml(money(po.subtotal, currency))}</span></div>`);
  if (po.shipping > 0) {
    lines.push(`<div class="row"><span class="label">Shipping</span><span>${escapeHtml(money(po.shipping, currency))}</span></div>`);
  }
  lines.push(`<div class="row total"><span>Total</span><span>${escapeHtml(money(po.total, currency))}</span></div>`);

  if (po.notes) {
    lines.push('<hr />');
    lines.push(`<p class="small">${escapeHtml(po.notes)}</p>`);
  }

  return lines.join('\n');
}