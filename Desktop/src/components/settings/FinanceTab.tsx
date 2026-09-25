import { useEffect, useState } from 'react';
import { Save, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { useClient } from '@/context/ClientContext';
import { useNotifications } from '@/context/NotificationContext';

interface Props {
  onDirtyChange: (dirty: boolean) => void;
}

const CURRENCIES = [
  { value: 'KES', label: 'KES — Kenyan Shilling' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — Pound Sterling' },
  { value: 'TZS', label: 'TZS — Tanzanian Shilling' },
  { value: 'UGX', label: 'UGX — Ugandan Shilling' },
];

export function FinanceTab({ onDirtyChange }: Props) {
  const { settings, update, status, load } = useClient();
  const { toast } = useNotifications();
  const [saving, setSaving] = useState(false);

  const [currency, setCurrency] = useState('KES');
  const [taxRate, setTaxRate] = useState('16');
  const [taxInclusive, setTaxInclusive] = useState(false);

  const [loyaltyEnabled, setLoyaltyEnabled] = useState(false);
  const [pointsPerCurrency, setPointsPerCurrency] = useState('1');
  const [currencyUnit, setCurrencyUnit] = useState('100');
  const [redeemRate, setRedeemRate] = useState('1');
  const [minRedeem, setMinRedeem] = useState('100');

  const [initial, setInitial] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (status === 'loading' || status === 'idle') return;
    if (!settings || Object.keys(settings).length === 0) {
      load();
      return;
    }
    const snap = {
      currency: settings.currency ?? 'KES',
      taxRate: String(settings.taxRate ?? 16),
      taxInclusive: settings.taxInclusive ?? false,
      loyaltyEnabled: settings.loyaltyEnabled ?? false,
      pointsPerCurrency: String(settings.loyaltyPointsPerCurrency ?? 1),
      currencyUnit: String(settings.loyaltyCurrencyUnit ?? 100),
      redeemRate: String(settings.loyaltyRedeemRate ?? 1),
      minRedeem: String(settings.loyaltyMinRedeem ?? 100),
    };
    setCurrency(snap.currency as string);
    setTaxRate(snap.taxRate);
    setTaxInclusive(snap.taxInclusive);
    setLoyaltyEnabled(snap.loyaltyEnabled);
    setPointsPerCurrency(snap.pointsPerCurrency);
    setCurrencyUnit(snap.currencyUnit);
    setRedeemRate(snap.redeemRate);
    setMinRedeem(snap.minRedeem);
    setInitial(snap);
  }, [settings, status, load]);

  useEffect(() => {
    if (!initial.currency) return;
    const dirty =
      currency !== initial.currency ||
      taxRate !== initial.taxRate ||
      taxInclusive !== initial.taxInclusive ||
      loyaltyEnabled !== initial.loyaltyEnabled ||
      pointsPerCurrency !== initial.pointsPerCurrency ||
      currencyUnit !== initial.currencyUnit ||
      redeemRate !== initial.redeemRate ||
      minRedeem !== initial.minRedeem;
    onDirtyChange(dirty);
  }, [
    currency, taxRate, taxInclusive,
    loyaltyEnabled, pointsPerCurrency, currencyUnit, redeemRate, minRedeem,
    initial, onDirtyChange,
  ]);

  const save = async () => {
    const tr = Number(taxRate);
    if (!Number.isFinite(tr) || tr < 0 || tr > 100) {
      toast({ type: 'error', message: 'Tax rate must be between 0 and 100' });
      return;
    }
    setSaving(true);
    try {
      await update({
        currency,
        taxRate: tr,
        taxInclusive,
        loyaltyEnabled,
        loyaltyPointsPerCurrency: Number(pointsPerCurrency) || 0,
        loyaltyCurrencyUnit: Number(currencyUnit) || 1,
        loyaltyRedeemRate: Number(redeemRate) || 0,
        loyaltyMinRedeem: Number(minRedeem) || 0,
      });
      setInitial({
        currency, taxRate, taxInclusive,
        loyaltyEnabled, pointsPerCurrency, currencyUnit, redeemRate, minRedeem,
      });
      toast({ type: 'success', message: 'Finance settings saved' });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Save failed',
      });
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || status === 'idle' || !initial.currency) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  const earnExample = Math.floor(1000 / (Number(currencyUnit) || 1)) * (Number(pointsPerCurrency) || 0);
  const redeemExample = (Number(minRedeem) || 0) * (Number(redeemRate) || 0);

  return (
    <div className="space-y-4">
      <Card
        title="Taxes & pricing"
        description="Defaults used across sales, invoices and reports."
        actions={
          <Button size="sm" icon={<Save size={14} />} loading={saving} onClick={save}>
            Save changes
          </Button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Default currency">
            <Select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={CURRENCIES}
            />
          </FormField>

          <FormField label="Tax rate (%)">
            <Input
              type="number"
              min="0"
              max="100"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
            />
          </FormField>

          <FormField label="Price display" className="sm:col-span-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTaxInclusive(false)}
                className={`flex-1 px-4 py-2 rounded-md border text-sm transition ${
                  !taxInclusive
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                    : 'border-border bg-surface text-muted hover:bg-elevated'
                }`}
              >
                Tax exclusive
              </button>
              <button
                type="button"
                onClick={() => setTaxInclusive(true)}
                className={`flex-1 px-4 py-2 rounded-md border text-sm transition ${
                  taxInclusive
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                    : 'border-border bg-surface text-muted hover:bg-elevated'
                }`}
              >
                Tax inclusive
              </button>
            </div>
          </FormField>
        </div>
      </Card>

      <Card
        title={
          <span className="inline-flex items-center gap-2">
            <Sparkles size={16} className="text-brand-600 dark:text-brand-400" />
            Loyalty points
          </span>
        }
        description="Reward repeat customers with points they can redeem against future purchases."
      >
        <div className="space-y-5">
          <label className="flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-fg">Enable loyalty program</p>
              <p className="text-xs text-muted mt-0.5">
                Customers earn points on every sale when attached to the transaction.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLoyaltyEnabled((v) => !v)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition shrink-0 ${
                loyaltyEnabled ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              aria-pressed={loyaltyEnabled}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  loyaltyEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>

          {loyaltyEnabled && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  label="Points per unit"
                  hint="How many points customers earn per currency unit spent."
                >
                  <Input
                    type="number"
                    min="0"
                    value={pointsPerCurrency}
                    onChange={(e) => setPointsPerCurrency(e.target.value)}
                  />
                </FormField>

                <FormField
                  label="Currency unit"
                  hint="Amount spent required to earn one batch of points."
                >
                  <Input
                    type="number"
                    min="1"
                    value={currencyUnit}
                    onChange={(e) => setCurrencyUnit(e.target.value)}
                  />
                </FormField>

                <FormField
                  label="Redeem rate"
                  hint="Currency value of one point when redeemed."
                >
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={redeemRate}
                    onChange={(e) => setRedeemRate(e.target.value)}
                  />
                </FormField>

                <FormField
                  label="Minimum to redeem"
                  hint="Fewest points a customer must redeem at once."
                >
                  <Input
                    type="number"
                    min="0"
                    value={minRedeem}
                    onChange={(e) => setMinRedeem(e.target.value)}
                  />
                </FormField>
              </div>

              <div className="rounded-md border border-border bg-elevated px-4 py-3 text-xs text-muted space-y-1">
                <p>
                  Spending <span className="font-medium text-fg">{currency} 1,000</span> earns{' '}
                  <span className="font-medium text-fg">{earnExample} points</span>.
                </p>
                <p>
                  Redeeming <span className="font-medium text-fg">{minRedeem} points</span> is worth{' '}
                  <span className="font-medium text-fg">{currency} {redeemExample.toFixed(2)}</span>.
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}