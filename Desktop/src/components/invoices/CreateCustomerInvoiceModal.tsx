import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/context/NotificationContext';
import { useClient } from '@/context/ClientContext';
import { customerApi } from '@/api/customers';
import { productApi } from '@/api/products';
import { customerInvoiceApi, CustomerInvoice } from '@/api/customerInvoices';
import { formatCurrency } from '@/utils/currency';
import type { Customer } from '@/types/customer';
import type { Product } from '@/types/product';

interface LineItem {
  key: string;
  productId?: string;
  name: string;
  qty: number;
  unitPrice: number;
  description?: string;
}

let lineKey = 0;
const nextKey = () => `line-${++lineKey}`;

export function CreateCustomerInvoiceModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (invoice: CustomerInvoice) => void;
}) {
  const { settings } = useClient();
  const { toast } = useNotifications();
  const currency = (settings.currency as string) || 'KES';
  const rawTaxRate = Number(settings.taxRate ?? 0);
  const taxRate = Number.isFinite(rawTaxRate) && rawTaxRate > 0 ? rawTaxRate : 0;
  const taxInclusive = settings.taxInclusive === true;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    { key: nextKey(), name: '', qty: 1, unitPrice: 0 },
  ]);
  const [discount, setDiscount] = useState('0');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const [productPickerIndex, setProductPickerIndex] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    let active = true;
    setLoadingData(true);
    Promise.all([
      customerApi.list({ page: 1, limit: 200 }),
      productApi.list({ page: 1, limit: 200, active: true }),
    ])
      .then(([cs, ps]) => {
        if (!active) return;
        setCustomers(cs.data);
        setProducts(ps.data);
      })
      .catch(() =>
        toast({ type: 'error', message: 'Could not load customers or products' })
      )
      .finally(() => active && setLoadingData(false));
    return () => {
      active = false;
    };
  }, [toast]);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.qty * i.unitPrice, 0),
    [items]
  );

  const discountValue = useMemo(() => {
    const n = Number(discount);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.min(n, subtotal);
  }, [discount, subtotal]);

  const tax = useMemo(() => {
    if (taxRate <= 0) return 0;
    const base = Math.max(0, subtotal - discountValue);
    if (taxInclusive) {
      return Math.round(base * (taxRate / (100 + taxRate)));
    }
    return Math.round(base * (taxRate / 100));
  }, [subtotal, discountValue, taxRate, taxInclusive]);

  const total = useMemo(() => {
    const base = Math.max(0, subtotal - discountValue);
    if (taxRate <= 0) return base;
    if (taxInclusive) return base;
    return base + tax;
  }, [subtotal, discountValue, taxRate, taxInclusive, tax]);

  const addLine = () => {
    setItems((cur) => [...cur, { key: nextKey(), name: '', qty: 1, unitPrice: 0 }]);
  };

  const removeLine = (key: string) => {
    setItems((cur) => (cur.length > 1 ? cur.filter((i) => i.key !== key) : cur));
  };

  const updateLine = (key: string, patch: Partial<LineItem>) => {
    setItems((cur) => cur.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  };

  const chooseProduct = (index: number, product: Product) => {
    updateLine(items[index].key, {
      productId: product._id,
      name: product.name,
      unitPrice: product.price,
      qty: 1,
    });
    setProductPickerIndex(null);
    setProductSearch('');
  };

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products.slice(0, 30);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku || '').toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [products, productSearch]);

  const submit = async () => {
    if (!customerId) {
      toast({ type: 'error', message: 'Select a customer' });
      return;
    }
    const clean = items.filter((i) => i.name.trim() && i.qty > 0);
    if (!clean.length) {
      toast({ type: 'error', message: 'Add at least one line item' });
      return;
    }

    setSaving(true);
    try {
      const created = await customerInvoiceApi.create({
        customerId,
        items: clean.map((i) => ({
          productId: i.productId,
          name: i.name,
          description: i.description,
          qty: i.qty,
          unitPrice: i.unitPrice,
        })),
        discount: discountValue,
        dueDate,
        notes: notes.trim() || undefined,
      });
      toast({ type: 'success', message: 'Invoice created (draft)' });
      onCreated(created);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Create failed',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <Modal open onClose={onClose} title="New invoice" size="xl">
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="New customer invoice"
      size="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={submit}>
            Create invoice
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Customer" required>
            <Select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder="Select a customer"
              options={customers.map((c) => ({
                value: c._id,
                label: `${c.name}${c.phone ? ` · ${c.phone}` : ''}`,
              }))}
            />
          </FormField>

          <FormField label="Due date">
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </FormField>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-fg">Line items</p>
            <Button size="sm" variant="ghost" icon={<Plus size={12} />} onClick={addLine}>
              Add line
            </Button>
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={item.key}
                className="grid grid-cols-12 gap-2 items-start rounded-md border border-border bg-surface p-2"
              >
                <div className="col-span-5">
                  <Input
                    value={item.name}
                    onChange={(e) => updateLine(item.key, { name: e.target.value })}
                    placeholder="Item name"
                  />
                  {item.productId && (
                    <p className="text-[10px] text-muted mt-1">
                      Linked to product (stock will deduct on send)
                    </p>
                  )}
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    min="1"
                    value={String(item.qty)}
                    onChange={(e) =>
                      updateLine(item.key, { qty: Math.max(1, Number(e.target.value)) })
                    }
                    placeholder="Qty"
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    type="number"
                    min="0"
                    value={String(item.unitPrice)}
                    onChange={(e) =>
                      updateLine(item.key, { unitPrice: Number(e.target.value) })
                    }
                    placeholder="Price"
                  />
                </div>
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setProductPickerIndex(index);
                      setProductSearch('');
                    }}
                  >
                    Pick
                  </Button>
                  <button
                    type="button"
                    onClick={() => removeLine(item.key)}
                    className="p-1.5 rounded text-muted hover:text-red-600 hover:bg-elevated transition"
                    aria-label="Remove line"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {productPickerIndex !== null && (
          <div className="rounded-md border border-border bg-surface p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-fg">
                Choose a product for line {productPickerIndex + 1}
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setProductPickerIndex(null)}
              >
                Close
              </Button>
            </div>
            <Input
              autoFocus
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products..."
              icon={<Search size={14} />}
            />
            <ul className="mt-2 max-h-56 overflow-y-auto scrollbar-thin divide-y divide-border">
              {filteredProducts.length === 0 ? (
                <li className="py-3 text-sm text-muted text-center">
                  No products found.
                </li>
              ) : (
                filteredProducts.map((p) => (
                  <li key={p._id}>
                    <button
                      type="button"
                      onClick={() => chooseProduct(productPickerIndex, p)}
                      className="w-full text-left px-2 py-2 hover:bg-elevated transition rounded"
                    >
                      <p className="text-sm text-fg">{p.name}</p>
                      <p className="text-xs text-muted">
                        {p.sku || '—'} · {formatCurrency(p.price, currency)} · {p.stock} in stock
                      </p>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={`Discount (${currency})`}>
            <Input
              type="number"
              min="0"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </FormField>
          <FormField label="Notes">
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional message for the customer"
            />
          </FormField>
        </div>

        <div className="rounded-md border border-border bg-elevated px-4 py-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="text-fg">{formatCurrency(subtotal, currency)}</span>
          </div>
          {discountValue > 0 && (
            <div className="flex justify-between">
              <span className="text-muted">Discount</span>
              <span className="text-red-600 dark:text-red-400">
                −{formatCurrency(discountValue, currency)}
              </span>
            </div>
          )}
          {taxRate > 0 && (
            <div className="flex justify-between">
              <span className="text-muted">
                VAT {taxRate}%{taxInclusive ? ' (incl.)' : ''}
              </span>
              <span className="text-fg">{formatCurrency(tax, currency)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-border font-semibold text-fg">
            <span>Total</span>
            <span>{formatCurrency(total, currency)}</span>
          </div>
        </div>

        <p className="text-xs text-muted">
          Invoice is created as <strong>draft</strong>. Stock is deducted and the
          customer's account is affected only when you <strong>send</strong> it.
        </p>
      </div>
    </Modal>
  );
}