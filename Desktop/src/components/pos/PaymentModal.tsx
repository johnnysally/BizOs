import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { classNames } from '@/utils/classNames';
import { useNotifications } from '@/context/NotificationContext';
import { saleApi } from '@/api/sales';
import { paymentApi } from '@/api/payments';
import { formatCurrency } from '@/utils/currency';
import { PAYMENT_LABELS } from '@/utils/constants';
import type { Customer } from '@/types/customer';
import type { Sale } from '@/types/sale';
import type { CartItem } from './Cart';

interface Props {
  cart: CartItem[];
  subtotal: number;
  discountValue: number;
  total: number;
  currency: string;
  customer: Customer | null;
  enabledMethods: string[];
  availableMethods?: string[];
  onClose: () => void;
  onSuccess: (sale: Sale, change: number) => void;
}

export function PaymentModal({
  cart,
  subtotal,
  discountValue,
  total,
  currency,
  customer,
  enabledMethods,
  availableMethods,
  onClose,
  onSuccess,
}: Props) {
  const { toast } = useNotifications();
  const methods =
    enabledMethods.length > 0
      ? enabledMethods
      : availableMethods || ['cash', 'card'];

  const [method, setMethod] = useState(methods[0] || 'cash');
  const [reference, setReference] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [saving, setSaving] = useState(false);

  const isCash = method === 'cash';
  const received = Number(amountReceived) || 0;
  const change = isCash ? Math.max(0, received - total) : 0;

  useEffect(() => {
    if (isCash) setAmountReceived(String(total));
    else setAmountReceived('');
  }, [isCash, total]);

  const canCharge = useMemo(() => {
    if (!method) return false;
    if (isCash) return received >= total;
    if (method !== 'cash' && method !== 'card') {
      return reference.trim().length > 0;
    }
    return true;
  }, [method, isCash, received, total, reference]);

  const charge = async () => {
    if (!canCharge) return;
    setSaving(true);
    try {
      const sale = await saleApi.create({
        items: cart.map((i) => ({ productId: i.productId, qty: i.qty })),
        paymentMethod: method,
        customerId: customer?.id || customer?._id,
        discount: discountValue,
      });

      if (isCash) {
        await paymentApi.recordManual({
          saleId: sale._id,
          method: 'cash',
          amountReceived: received,
        });
      } else if (method !== 'card') {
        await paymentApi.recordManual({
          saleId: sale._id,
          method,
          reference,
        });
      }

      onSuccess(sale, change);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Could not complete sale',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Collect payment"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} disabled={!canCharge} onClick={charge}>
            Complete sale
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-elevated p-4 text-center">
          <p className="text-xs text-muted uppercase tracking-wider">
            Amount due
          </p>
          <p className="text-3xl font-semibold text-fg mt-1">
            {formatCurrency(total, currency)}
          </p>
          {customer && (
            <p className="text-xs text-muted mt-1">{customer.name}</p>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-fg mb-2">Payment method</p>
          <div className="grid grid-cols-2 gap-2">
            {methods.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={classNames(
                  'px-3 py-2 rounded-md border text-sm font-medium transition',
                  method === m
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                    : 'border-border bg-surface text-muted hover:bg-elevated'
                )}
              >
                {PAYMENT_LABELS[m] || m}
              </button>
            ))}
          </div>
        </div>

        {isCash && (
          <FormField label="Amount received">
            <Input
              type="number"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              placeholder={String(total)}
            />
            {received > 0 && (
              <p className="text-xs mt-1.5">
                <span className="text-muted">Change: </span>
                <span className="font-semibold text-fg">
                  {formatCurrency(change, currency)}
                </span>
              </p>
            )}
          </FormField>
        )}

        {!isCash && method !== 'card' && (
          <FormField
            label="Reference"
            hint="Transaction code or receipt number"
            required
          >
            <Input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. QK12345678"
            />
          </FormField>
        )}

        <div className="rounded-md border border-border bg-elevated px-3 py-2 text-xs text-muted space-y-0.5">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal, currency)}</span>
          </div>
          {discountValue > 0 && (
            <div className="flex justify-between">
              <span>Discount</span>
              <span>−{formatCurrency(discountValue, currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-medium text-fg pt-1 border-t border-border mt-1">
            <span>Total</span>
            <span>{formatCurrency(total, currency)}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}