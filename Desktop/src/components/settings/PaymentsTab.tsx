import { useState } from 'react';
import { Check, CreditCard, Smartphone, Building2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useClient } from '@/context/ClientContext';
import { useNotifications } from '@/context/NotificationContext';
import { settingsApi } from '@/api/settings';

const ICONS: Record<string, typeof CreditCard> = {
  cash: Building2,
  stripe: CreditCard,
  mpesa_stk: Smartphone,
  mpesa_send: Smartphone,
  mpesa_till: Smartphone,
  mpesa_paybill: Smartphone,
  bank: Building2,
};

export function PaymentsTab() {
  const { paymentMethods, enabledPaymentMethods, status, load } = useClient();
  const { toast } = useNotifications();
  const [pending, setPending] = useState<string | null>(null);

  const toggle = async (code: string, enabled: boolean) => {
    setPending(code);
    try {
      if (enabled) {
        await settingsApi.disablePayment(code);
        toast({ type: 'success', message: 'Payment method disabled' });
      } else {
        await settingsApi.enablePayment(code);
        toast({ type: 'success', message: 'Payment method enabled' });
      }
      await load();
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Update failed',
      });
    } finally {
      setPending(null);
    }
  };

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Card
      title="Payment methods"
      description="Choose which methods your team can accept at checkout."
    >
      <div className="divide-y divide-border">
        {paymentMethods.length === 0 && (
          <p className="text-sm text-muted py-6 text-center">
            No payment methods are configured on this platform yet.
          </p>
        )}
        {paymentMethods.map((method) => {
          const Icon = ICONS[method.code] || CreditCard;
          const enabled = enabledPaymentMethods.includes(method.code);
          const busy = pending === method.code;
          return (
            <div
              key={method.code}
              className="flex items-center gap-4 py-3"
            >
              <div className="w-10 h-10 rounded-md bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-fg">{method.label}</p>
                <p className="text-xs text-muted">
                  {method.mode === 'auto' ? 'Automatic' : 'Manual recording'}
                </p>
              </div>
              {enabled && (
                <Badge variant="success" dot>
                  Enabled
                </Badge>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => toggle(method.code, enabled)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  enabled
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    : 'bg-brand-600 text-white hover:bg-brand-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {busy ? (
                  <Spinner size="sm" />
                ) : enabled ? (
                  'Disable'
                ) : (
                  <>
                    <Check size={12} />
                    Enable
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}