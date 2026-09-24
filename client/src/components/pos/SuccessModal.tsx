import { useState } from 'react';
import { Check, Printer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useNotifications } from '@/context/NotificationContext';
import { receiptApi } from '@/api/receipts';
import { printHtml } from '@/utils/printHtml';
import { receiptHtml } from '@/utils/receiptHtml';
import { formatCurrency } from '@/utils/currency';
import type { Sale } from '@/types/sale';

interface Props {
  sale: Sale;
  change: number;
  currency: string;
  onNewSale: () => void;
}

export function SuccessModal({ sale, change, currency, onNewSale }: Props) {
  const { toast } = useNotifications();
  const [emailing, setEmailing] = useState(false);

  const printReceipt = async () => {
    try {
      const r = await receiptApi.get(sale._id);
      printHtml(
        receiptHtml({
          business: r.business,
          settings: r.settings,
          sale: r.sale,
        }),
        { title: `Receipt ${r.sale.saleNumber}` }
      );
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Print failed',
      });
    }
  };

  const emailReceipt = async () => {
    const email = window.prompt('Send receipt to email:');
    if (!email) return;
    setEmailing(true);
    try {
      await receiptApi.email(sale._id, email);
      toast({ type: 'success', message: 'Receipt sent' });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Email failed',
      });
    } finally {
      setEmailing(false);
    }
  };

  return (
    <Modal
      open
      onClose={onNewSale}
      title="Sale complete"
      size="sm"
      footer={
        <Button fullWidth onClick={onNewSale}>
          New sale
        </Button>
      }
    >
      <div className="text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
          <Check size={28} className="text-green-600 dark:text-green-400" />
        </div>

        <div>
          <p className="text-xs text-muted uppercase tracking-wider">
            Charged
          </p>
          <p className="text-3xl font-semibold text-fg mt-1">
            {formatCurrency(sale.total, currency)}
          </p>
        </div>

        {change > 0 && (
          <div className="rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-4 py-2">
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Change due
            </p>
            <p className="text-xl font-semibold text-amber-900 dark:text-amber-200">
              {formatCurrency(change, currency)}
            </p>
          </div>
        )}

        <p className="text-xs text-muted">Receipt {sale.saleNumber}</p>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            icon={<Printer size={14} />}
            onClick={printReceipt}
          >
            Print
          </Button>
          <Button variant="outline" loading={emailing} onClick={emailReceipt}>
            Email
          </Button>
        </div>

        <button
          type="button"
          onClick={onNewSale}
          className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
        >
          Skip and start next sale
        </button>
      </div>
    </Modal>
  );
}