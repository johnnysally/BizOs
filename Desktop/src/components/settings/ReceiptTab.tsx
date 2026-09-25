import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
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

const TEMPLATES = [
  { value: 'modern', label: 'Modern — compact thermal' },
  { value: 'detailed', label: 'Detailed — full A4' },
  { value: 'minimal', label: 'Minimal — essentials only' },
];

const PAPER_SIZES = [
  { value: '58mm', label: '58mm thermal' },
  { value: '80mm', label: '80mm thermal' },
  { value: 'A4', label: 'A4' },
  { value: 'A5', label: 'A5' },
];

export function ReceiptTab({ onDirtyChange }: Props) {
  const { settings, update, status, load } = useClient();
  const { toast } = useNotifications();
  const [saving, setSaving] = useState(false);

  const [template, setTemplate] = useState<'modern' | 'detailed' | 'minimal'>('modern');
  const [footer, setFooter] = useState('');
  const [showLogo, setShowLogo] = useState(true);
  const [showTax, setShowTax] = useState(true);
  const [showCustomer, setShowCustomer] = useState(true);
  const [showCashier, setShowCashier] = useState(false);
  const [paperSize, setPaperSize] = useState<'58mm' | '80mm' | 'A4' | 'A5'>('80mm');
  const [copies, setCopies] = useState('1');

  const [initial, setInitial] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (status === 'loading' || status === 'idle') return;
    if (!settings || Object.keys(settings).length === 0) {
      load();
      return;
    }
    const snap = {
      template: settings.receiptTemplate ?? 'modern',
      footer: settings.receiptFooter ?? 'Thank you for your business.',
      showLogo: settings.receiptShowLogo ?? true,
      showTax: settings.receiptShowTax ?? true,
      showCustomer: settings.receiptShowCustomer ?? true,
      showCashier: settings.receiptShowCashier ?? false,
      paperSize: settings.receiptPaperSize ?? '80mm',
      copies: String(settings.receiptCopies ?? 1),
    };
    setTemplate(snap.template as typeof template);
    setFooter(snap.footer as string);
    setShowLogo(snap.showLogo as boolean);
    setShowTax(snap.showTax as boolean);
    setShowCustomer(snap.showCustomer as boolean);
    setShowCashier(snap.showCashier as boolean);
    setPaperSize(snap.paperSize as typeof paperSize);
    setCopies(snap.copies);
    setInitial(snap);
  }, [settings, status, load]);

  useEffect(() => {
    if (!initial.template) return;
    const dirty =
      template !== initial.template ||
      footer !== initial.footer ||
      showLogo !== initial.showLogo ||
      showTax !== initial.showTax ||
      showCustomer !== initial.showCustomer ||
      showCashier !== initial.showCashier ||
      paperSize !== initial.paperSize ||
      copies !== initial.copies;
    onDirtyChange(dirty);
  }, [
    template, footer, showLogo, showTax, showCustomer, showCashier, paperSize, copies,
    initial, onDirtyChange,
  ]);

  const save = async () => {
    setSaving(true);
    try {
      await update({
        receiptTemplate: template,
        receiptFooter: footer,
        receiptShowLogo: showLogo,
        receiptShowTax: showTax,
        receiptShowCustomer: showCustomer,
        receiptShowCashier: showCashier,
        receiptPaperSize: paperSize,
        receiptCopies: Number(copies) || 1,
      });
      setInitial({
        template, footer, showLogo, showTax, showCustomer, showCashier, paperSize, copies,
      });
      toast({ type: 'success', message: 'Receipt settings saved' });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Save failed',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggle = (label: string, value: boolean, setter: (v: boolean) => void, hint: string) => (
    <label className="flex items-center justify-between gap-4 py-2.5 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-fg">{label}</p>
        <p className="text-xs text-muted mt-0.5">{hint}</p>
      </div>
      <button
        type="button"
        onClick={() => setter(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition shrink-0 ${
          value ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
        }`}
        aria-pressed={value}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </label>
  );

  if (status === 'loading' || status === 'idle' || !initial.template) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
      <div className="space-y-4">
        <Card
          title="Receipt layout"
          description="Choose the default template and paper format."
          actions={
            <Button size="sm" icon={<Save size={14} />} loading={saving} onClick={save}>
              Save changes
            </Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Template">
              <Select
                value={template}
                onChange={(e) => setTemplate(e.target.value as typeof template)}
                options={TEMPLATES}
              />
            </FormField>
            <FormField label="Paper size">
              <Select
                value={paperSize}
                onChange={(e) => setPaperSize(e.target.value as typeof paperSize)}
                options={PAPER_SIZES}
              />
            </FormField>
            <FormField label="Copies per transaction">
              <Input
                type="number"
                min="1"
                max="5"
                value={copies}
                onChange={(e) => setCopies(e.target.value)}
              />
            </FormField>
            <FormField label="Footer text" className="sm:col-span-2">
              <Input
                value={footer}
                onChange={(e) => setFooter(e.target.value)}
                placeholder="Thank you for your business."
              />
            </FormField>
          </div>
        </Card>

        <Card title="What to print" description="Toggle which details appear on receipts.">
          <div className="divide-y divide-border">
            {toggle('Business logo', showLogo, setShowLogo, 'Show your logo at the top of every receipt.')}
            {toggle('Tax breakdown', showTax, setShowTax, 'Print the tax rate and tax amount before the total.')}
            {toggle('Customer name', showCustomer, setShowCustomer, 'Include the customer or walk-in label.')}
            {toggle('Cashier name', showCashier, setShowCashier, 'Print the cashier who processed the sale.')}
          </div>
        </Card>
      </div>

      <div className="lg:sticky lg:top-6 h-fit">
        <Card title="Preview" description="Live sample receipt">
          <div className="bg-white text-slate-900 rounded-md border border-slate-200 p-4 text-xs font-mono space-y-2">
            <div className="text-center border-b border-dashed border-slate-300 pb-2">
              {showLogo && <div className="font-bold">YOUR BUSINESS</div>}
              <div className="text-[10px] text-slate-500">
                {template === 'detailed' ? 'A4 INVOICE' : 'RECEIPT'}
              </div>
            </div>

            <div className="space-y-1 py-2">
              <div className="flex justify-between">
                <span>2.5mm Twin Cable x1</span>
                <span>8,500.00</span>
              </div>
              <div className="flex justify-between">
                <span>LED Bulb 12W x2</span>
                <span>640.00</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-300 pt-2 space-y-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>9,140.00</span>
              </div>
              {showTax && (
                <div className="flex justify-between">
                  <span>Tax (16%)</span>
                  <span>1,462.40</span>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>10,602.40</span>
              </div>
            </div>

            {showCustomer && (
              <div className="text-[10px] text-slate-500 pt-2 border-t border-dashed border-slate-300">
                Customer: Walk-in
              </div>
            )}
            {showCashier && (
              <div className="text-[10px] text-slate-500">Served by: Alice</div>
            )}

            {footer && (
              <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-dashed border-slate-300">
                {footer}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}