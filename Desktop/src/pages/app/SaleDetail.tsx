import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Ban,
  Mail,
  User as UserIcon,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { saleApi } from '@/api/sales';
import { receiptApi } from '@/api/receipts';
import { formatCurrency } from '@/utils/currency';
import { formatDateTime } from '@/utils/date';
import { printHtml } from '@/utils/printHtml';
import { receiptHtml } from '@/utils/receiptHtml';
import { PAYMENT_LABELS, ROLES, ROUTES } from '@/utils/constants';
import type { Sale } from '@/types/sale';

interface SaleWithJoins extends Sale {
  customer?: {
    _id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
  } | null;
  cashier?: {
    _id: string;
    fullName: string;
    email: string;
    role: string;
  } | null;
}

export default function SaleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useNotifications();

  const canVoid =
    user?.role === ROLES.OWNER || user?.role === ROLES.MANAGER;

  const [sale, setSale] = useState<SaleWithJoins | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await saleApi.get(id);
      setSale(data as SaleWithJoins);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Could not load sale',
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const reprint = async () => {
    if (!sale) return;
    setBusy('print');
    try {
      const r = await receiptApi.get(sale._id);
      printHtml(
        receiptHtml({
          business: r.business,
          settings: r.settings,
          sale: r.sale,
          customerName: sale.customer?.name || null,
          cashierName: sale.cashier?.fullName || null,
        }),
        { title: `Receipt ${sale.saleNumber}` }
      );
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Print failed',
      });
    } finally {
      setBusy(null);
    }
  };

  const emailReceipt = async () => {
    if (!sale) return;
    const to = window.prompt(
      'Send receipt to email:',
      sale.customer?.email || ''
    );
    if (!to) return;
    setBusy('email');
    try {
      await receiptApi.email(sale._id, to, sale.customer?.name);
      toast({ type: 'success', message: 'Receipt queued' });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Email failed',
      });
    } finally {
      setBusy(null);
    }
  };

  const voidSale = async () => {
    if (!sale) return;
    const reason = window.prompt(`Reason for voiding ${sale.saleNumber}:`);
    if (!reason) return;
    setBusy('void');
    try {
      const updated = await saleApi.void(sale._id, reason);
      setSale(updated as SaleWithJoins);
      toast({ type: 'success', message: 'Sale voided' });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Void failed',
      });
    } finally {
      setBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-fg">Sale not found.</p>
        <Link to={ROUTES.sales} className="inline-block mt-4">
          <Button variant="outline">Back to sales</Button>
        </Link>
      </div>
    );
  }

  const currency = sale.currency || 'KES';
  const status = sale.voided ? 'voided' : sale.paymentStatus || 'paid';
  const statusVariant =
    status === 'voided'
      ? 'danger'
      : status === 'refunded'
      ? 'info'
      : status === 'pending'
      ? 'warning'
      : 'success';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(ROUTES.sales)}
          className="p-2 rounded-md text-muted hover:bg-elevated hover:text-fg transition"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-fg font-mono truncate">
              {sale.saleNumber}
            </h1>
            <Badge variant={statusVariant}>{status}</Badge>
          </div>
          <p className="text-sm text-muted mt-1">
            {formatDateTime(sale.createdAt)}
          </p>
        </div>
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<Printer size={14} />}
            loading={busy === 'print'}
            onClick={reprint}
          >
            Print receipt
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={<Mail size={14} />}
            loading={busy === 'email'}
            onClick={emailReceipt}
          >
            Email receipt
          </Button>
          {canVoid && !sale.voided && (
            <Button
              size="sm"
              variant="danger"
              icon={<Ban size={14} />}
              loading={busy === 'void'}
              onClick={voidSale}
            >
              Void sale
            </Button>
          )}
        </div>
      </Card>

      {sale.voided && (
        <Card>
          <div className="flex items-start gap-3">
            <AlertCircle
              size={18}
              className="text-red-600 dark:text-red-400 shrink-0 mt-0.5"
            />
            <div>
              <p className="text-sm font-medium text-fg">
                This sale was voided
              </p>
              <p className="text-xs text-muted mt-1">
                {sale.voidReason || 'No reason provided'}
                {sale.voidedAt && ` · ${formatDateTime(sale.voidedAt)}`}
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Customer" className="lg:col-span-1">
          {sale.customer ? (
            <>
              <p className="text-sm font-medium text-fg">
                {sale.customer.name}
              </p>
              {sale.customer.phone && (
                <p className="text-xs text-muted mt-1">
                  {sale.customer.phone}
                </p>
              )}
              {sale.customer.email && (
                <p className="text-xs text-muted">{sale.customer.email}</p>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-muted">
              <UserIcon size={14} />
              <span className="text-sm">Walk-in customer</span>
            </div>
          )}
        </Card>

        <Card title="Cashier" className="lg:col-span-1">
          {sale.cashier ? (
            <>
              <p className="text-sm font-medium text-fg">
                {sale.cashier.fullName}
              </p>
              <p className="text-xs text-muted mt-1 capitalize">
                {sale.cashier.role}
              </p>
              <p className="text-xs text-muted">{sale.cashier.email}</p>
            </>
          ) : (
            <p className="text-sm text-muted">—</p>
          )}
        </Card>

        <Card title="Payment" className="lg:col-span-1">
          <p className="text-sm font-medium text-fg">
            {PAYMENT_LABELS[sale.paymentMethod || ''] ||
              sale.paymentMethod ||
              '—'}
          </p>
          <p className="text-xs text-muted mt-1 capitalize">
            {sale.paymentStatus || 'paid'}
          </p>
          {sale.discount > 0 && (
            <p className="text-xs text-muted mt-1">
              Discount applied
            </p>
          )}
        </Card>
      </div>

      <Card title="Items" padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-elevated border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted">
                  Product
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted">
                  Qty
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted">
                  Unit price
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sale.items.map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-3">
                    <p className="text-fg">{item.name}</p>
                    {item.sku && (
                      <p className="text-xs text-muted mt-0.5">{item.sku}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-fg">{item.qty}</td>
                  <td className="px-4 py-3 text-right text-fg">
                    {formatCurrency(item.price, currency)}
                  </td>
                  <td className="px-4 py-3 text-right text-fg">
                    {formatCurrency(item.subtotal, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Totals">
          <div className="space-y-2 text-sm">
            <Row
              label="Subtotal"
              value={formatCurrency(sale.subtotal, currency)}
            />
            {sale.discount > 0 && (
              <Row
                label="Discount"
                value={`−${formatCurrency(sale.discount, currency)}`}
              />
            )}
            {sale.tax > 0 && (
              <Row label="VAT" value={formatCurrency(sale.tax, currency)} />
            )}
            <div className="flex items-center justify-between pt-2 border-t border-border font-semibold text-fg text-base">
              <span>Total</span>
              <span>{formatCurrency(sale.total, currency)}</span>
            </div>
          </div>
        </Card>

        <Card title="Loyalty">
          {sale.loyaltyPointsEarned || sale.loyaltyPointsRedeemed ? (
            <div className="space-y-2 text-sm">
              {sale.loyaltyPointsEarned ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Sparkles size={14} />
                  <span className="font-medium">
                    +{sale.loyaltyPointsEarned} points earned
                  </span>
                </div>
              ) : null}
              {sale.loyaltyPointsRedeemed ? (
                <Row
                  label="Points redeemed"
                  value={`${sale.loyaltyPointsRedeemed}`}
                />
              ) : null}
              {sale.loyaltyDiscountValue ? (
                <Row
                  label="Loyalty discount"
                  value={formatCurrency(sale.loyaltyDiscountValue, currency)}
                />
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted">
              No loyalty activity on this sale.
            </p>
          )}
        </Card>
      </div>
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