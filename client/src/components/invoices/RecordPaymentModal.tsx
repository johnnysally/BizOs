import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { useNotifications } from '@/context/NotificationContext';
import { customerInvoiceApi, CustomerInvoice } from '@/api/customerInvoices';
import { formatCurrency } from '@/utils/currency';
import { PAYMENT_LABELS } from '@/utils/constants';

const METHODS = ['cash', 'mpesa_send', 'mpesa_till', 'mpesa_paybill', 'bank', 'card'];

export function RecordPaymentModal({
  invoice,
  onClose,
  onSaved,
}: {
  invoice: CustomerInvoice;
  onClose: () => void;
  onSaved: (updated: CustomerInvoice) => void;
}) {
  const { toast } = useNotifications();
  const [amount, setAmount] = useState(String(invoice.amountDue));
  const [method, setMethod] = useState(METHODS[0]);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      toast({ type: 'error', message: 'Enter a positive amount' });
      return;
    }
    if (n > invoice.amountDue) {
      toast({ type: 'error', message: 'Amount exceeds amount due' });
      return;
    }
    if (method !== 'cash' && method !== 'card' && !reference.trim()) {
      toast({ type: 'error', message: 'Reference is required for this method' });
      return;
    }
    setSaving(true);
    try {
      const updated = await customerInvoiceApi.recordPayment(invoice._id, {
        amount: n,
        method,
        reference: reference.trim() || undefined,
        note: note.trim() || undefined,
      });
      toast({ type: 'success', message: 'Payment recorded' });
      onSaved(updated);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Could not record payment',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Record payment — ${invoice.invoiceNumber}`}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={submit}>
            Record payment
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-elevated p-4 text-center">
          <p className="text-xs text-muted uppercase tracking-wider">Amount due</p>
          <p className="text-2xl font-semibold text-fg mt-1">
            {formatCurrency(invoice.amountDue, invoice.currency)}
          </p>
          <p className="text-xs text-muted mt-1">{invoice.customerSnapshot.name}</p>
        </div>

        <FormField label="Amount">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </FormField>

        <FormField label="Method">
          <Select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            options={METHODS.map((m) => ({
              value: m,
              label: PAYMENT_LABELS[m] || m,
            }))}
          />
        </FormField>

        {method !== 'cash' && method !== 'card' && (
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

        <FormField label="Note">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional"
          />
        </FormField>

        <p className="text-xs text-muted">
          Customer's outstanding balance will decrease by this amount.
        </p>
      </div>
    </Modal>
  );
}