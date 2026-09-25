import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Search, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/context/NotificationContext';
import { useClient } from '@/context/ClientContext';
import { supplierApi } from '@/api/suppliers';
import { productApi } from '@/api/products';
import { purchaseOrderApi } from '@/api/purchaseOrders';
import { formatCurrency } from '@/utils/currency';
import { ROUTES } from '@/utils/constants';
import type { Supplier } from '@/types/supplier';
import type { Product } from '@/types/product';

interface LineItem {
  key: string;
  productId?: string;
  name: string;
  sku?: string;
  qty: number;
  unitCost: number;
}

let lineKey = 0;
const nextKey = () => `line-${++lineKey}`;

export default function PurchaseOrderForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { settings } = useClient();
  const { toast } = useNotifications();
  const currency = (settings.currency as string) || 'KES';

  const preselectedSupplier = params.get('supplier') || '';

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingPo, setLoadingPo] = useState(isEdit);

  const [supplierId, setSupplierId] = useState(preselectedSupplier);
  const [items, setItems] = useState<LineItem[]>([
    { key: nextKey(), name: '', qty: 1, unitCost: 0 },
  ]);
  const [shipping, setShipping] = useState('0');
  const [expectedAt, setExpectedAt] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const [productPickerIndex, setProductPickerIndex] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    let active = true;
    setLoadingData(true);
    Promise.all([
      supplierApi.list({ page: 1, limit: 200, active: true }),
      productApi.list({ page: 1, limit: 200, active: true }),
    ])
      .then(([ss, ps]) => {
        if (!active) return;
        setSuppliers(ss.data);
        setProducts(ps.data);
      })
      .catch(() =>
        toast({ type: 'error', message: 'Could not load suppliers or products' })
      )
      .finally(() => active && setLoadingData(false));
    return () => {
      active = false;
    };
  }, [toast]);

  useEffect(() => {
    if (!isEdit || !id) return;
    let active = true;
    setLoadingPo(true);
    purchaseOrderApi
      .get(id)
      .then((po) => {
        if (!active) return;
        setSupplierId(po.supplierId);
        setItems(
          po.items.map((i) => ({
            key: nextKey(),
            productId: i.productId || undefined,
            name: i.name,
            sku: i.sku || undefined,
            qty: i.qty,
            unitCost: i.unitCost,
          }))
        );
        setShipping(String(po.shipping || 0));
        setExpectedAt(po.expectedAt ? po.expectedAt.slice(0, 10) : '');
        setNotes(po.notes || '');
      })
      .catch(() =>
        toast({ type: 'error', message: 'Could not load purchase order' })
      )
      .finally(() => active && setLoadingPo(false));
    return () => {
      active = false;
    };
  }, [id, isEdit, toast]);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.qty * i.unitCost, 0),
    [items]
  );

  const shippingValue = Number(shipping) || 0;
  const total = subtotal + shippingValue;

  const addLine = () =>
    setItems((cur) => [...cur, { key: nextKey(), name: '', qty: 1, unitCost: 0 }]);

  const removeLine = (key: string) =>
    setItems((cur) => (cur.length > 1 ? cur.filter((i) => i.key !== key) : cur));

  const updateLine = (key: string, patch: Partial<LineItem>) =>
    setItems((cur) => cur.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  const chooseProduct = (index: number, product: Product) => {
    updateLine(items[index].key, {
      productId: product._id,
      name: product.name,
      sku: product.sku || undefined,
      unitCost: product.cost || 0,
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
    if (!supplierId) {
      toast({ type: 'error', message: 'Select a supplier' });
      return;
    }
    const clean = items.filter((i) => i.name.trim() && i.qty > 0);
    if (!clean.length) {
      toast({ type: 'error', message: 'Add at least one line item' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        supplierId,
        items: clean.map((i) => ({
          productId: i.productId,
          name: i.name,
          sku: i.sku,
          qty: i.qty,
          unitCost: i.unitCost,
        })),
        shipping: shippingValue,
        expectedAt: expectedAt || undefined,
        notes: notes.trim() || undefined,
      };

      const po = isEdit && id
        ? await purchaseOrderApi.update(id, payload)
        : await purchaseOrderApi.create(payload);

      toast({
        type: 'success',
        message: isEdit ? 'Purchase order updated' : 'Purchase order created',
      });
      navigate(ROUTES.purchaseOrderDetail(po._id));
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Save failed',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingData || loadingPo) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

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
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-fg">
            {isEdit ? 'Edit purchase order' : 'New purchase order'}
          </h1>
          <p className="text-sm text-muted mt-1">
            Order stock from a supplier.
          </p>
        </div>
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Supplier" required>
            <Select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              placeholder="Select a supplier"
              options={suppliers.map((s) => ({
                value: s._id,
                label: s.name,
              }))}
            />
          </FormField>

          <FormField label="Expected delivery">
            <Input
              type="date"
              value={expectedAt}
              onChange={(e) => setExpectedAt(e.target.value)}
            />
          </FormField>
        </div>
      </Card>

      <Card
        title="Line items"
        actions={
          <Button size="sm" variant="ghost" icon={<Plus size={12} />} onClick={addLine}>
            Add line
          </Button>
        }
      >
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
                {item.sku && (
                  <p className="text-[10px] text-muted mt-1">{item.sku}</p>
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
                  value={String(item.unitCost)}
                  onChange={(e) =>
                    updateLine(item.key, { unitCost: Number(e.target.value) })
                  }
                  placeholder="Unit cost"
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
      </Card>

      {productPickerIndex !== null && (
        <Card
          title={`Choose a product for line ${productPickerIndex + 1}`}
          actions={
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setProductPickerIndex(null)}
            >
              Close
            </Button>
          }
        >
          <Input
            autoFocus
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Search products..."
            icon={<Search size={14} />}
          />
          <ul className="mt-3 max-h-72 overflow-y-auto scrollbar-thin divide-y divide-border -mx-5">
            {filteredProducts.length === 0 ? (
              <li className="px-5 py-3 text-sm text-muted text-center">
                No products found.
              </li>
            ) : (
              filteredProducts.map((p) => (
                <li key={p._id}>
                  <button
                    type="button"
                    onClick={() => chooseProduct(productPickerIndex, p)}
                    className="w-full text-left px-5 py-2.5 hover:bg-elevated transition"
                  >
                    <p className="text-sm text-fg">{p.name}</p>
                    <p className="text-xs text-muted">
                      {p.sku || '—'} · {formatCurrency(p.cost || 0, currency)} · {p.stock} in stock
                    </p>
                  </button>
                </li>
              ))
            )}
          </ul>
        </Card>
      )}

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label={`Shipping (${currency})`}>
            <Input
              type="number"
              min="0"
              value={shipping}
              onChange={(e) => setShipping(e.target.value)}
            />
          </FormField>
          <FormField label="Notes">
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
            />
          </FormField>
        </div>

        <div className="mt-4 rounded-md border border-border bg-elevated px-4 py-3 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="text-fg">{formatCurrency(subtotal, currency)}</span>
          </div>
          {shippingValue > 0 && (
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span className="text-fg">{formatCurrency(shippingValue, currency)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-border font-semibold text-fg">
            <span>Total</span>
            <span>{formatCurrency(total, currency)}</span>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(ROUTES.purchaseOrders)}>
          Cancel
        </Button>
        <Button loading={saving} onClick={submit}>
          {isEdit ? 'Save changes' : 'Create purchase order'}
        </Button>
      </div>
    </div>
  );
}