import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, Package as PackageIcon } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { classNames } from '@/utils/classNames';
import { useAuth } from '@/context/AuthContext';
import { useClient } from '@/context/ClientContext';
import { useNotifications } from '@/context/NotificationContext';
import { productApi } from '@/api/products';
import { customerApi } from '@/api/customers';
import { heldSalesApi } from '@/api/heldSales';
import { formatCurrency } from '@/utils/currency';
import { Cart, type CartItem } from '@/components/pos/Cart';
import { CustomerPicker } from '@/components/pos/CustomerPicker';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { SuccessModal } from '@/components/pos/SuccessModal';
import { HoldSaleModal } from '@/components/pos/HoldSaleModal';
import { HeldSalesDrawer } from '@/components/pos/HeldSalesDrawer';
import type { Product } from '@/types/product';
import type { Customer } from '@/types/customer';
import type { Sale } from '@/types/sale';
import type { HeldSale } from '@/types/heldSale';

const PAGE_SIZE = 60;

export default function POS() {
  const { user } = useAuth();
  const { settings, enabledPaymentMethods, status: clientStatus, load } = useClient();
  const { toast } = useNotifications();
  const searchRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState('');
  const [currentHeldId, setCurrentHeldId] = useState<string | null>(null);

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [lastChange, setLastChange] = useState(0);

  const [heldCount, setHeldCount] = useState(0);
  const [heldDrawerOpen, setHeldDrawerOpen] = useState(false);
  const [holdModalOpen, setHoldModalOpen] = useState(false);
  const [holding, setHolding] = useState(false);

  useEffect(() => {
    if (clientStatus === 'idle') load();
  }, [clientStatus, load]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await productApi.list({
        page: 1,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        category: category || undefined,
        active: true,
      });
      setProducts(res.data);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Could not load products',
      });
    } finally {
      setLoadingProducts(false);
    }
  }, [debouncedSearch, category, toast]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    customerApi
      .list({ page: 1, limit: 200 })
      .then((res) => setCustomers(res.data))
      .catch(() => undefined);
  }, []);

  const refreshHeldCount = useCallback(async () => {
    try {
      const list = await heldSalesApi.list();
      setHeldCount(list.length);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    refreshHeldCount();
  }, [refreshHeldCount]);

  const currency = (settings.currency as string) || 'KES';

  const rawTaxRate = (settings.taxRate as number) ?? 0;
  const taxRate = Number.isFinite(rawTaxRate) && rawTaxRate > 0 ? rawTaxRate : 0;
  const taxInclusive = settings.taxInclusive === true;

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cart]
  );

  const discountValue = useMemo(() => {
    const n = Number(discount);
    if (!Number.isFinite(n) || n <= 0) return 0;
    if (n > 100) return subtotal;
    return Math.round((subtotal * n) / 100);
  }, [discount, subtotal]);

  const taxAmount = useMemo(() => {
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
    return base + taxAmount;
  }, [subtotal, discountValue, taxRate, taxInclusive, taxAmount]);

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast({ type: 'warning', message: `${product.name} is out of stock` });
      return;
    }
    setCart((cur) => {
      const existing = cur.find((i) => i.productId === product._id);
      if (existing) {
        if (existing.qty >= product.stock) {
          toast({ type: 'warning', message: `Only ${product.stock} in stock` });
          return cur;
        }
        return cur.map((i) =>
          i.productId === product._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...cur,
        {
          productId: product._id,
          name: product.name,
          sku: product.sku || undefined,
          price: product.price,
          qty: 1,
          stock: product.stock,
          unit: product.unit,
        },
      ];
    });
  };

  const changeQty = (productId: string, delta: number) => {
    setCart((cur) =>
      cur.flatMap((item) => {
        if (item.productId !== productId) return [item];
        const next = item.qty + delta;
        if (next <= 0) return [];
        if (next > item.stock) {
          toast({ type: 'warning', message: `Only ${item.stock} in stock` });
          return [item];
        }
        return [{ ...item, qty: next }];
      })
    );
  };

  const removeItem = (productId: string) =>
    setCart((cur) => cur.filter((i) => i.productId !== productId));

  const clearCart = () => {
    if (!cart.length) return;
    if (!window.confirm('Clear the current sale?')) return;
    const held = currentHeldId;
    setCart([]);
    setDiscount('');
    setCustomer(null);
    setCurrentHeldId(null);
    if (held) {
      heldSalesApi
        .remove(held)
        .then(refreshHeldCount)
        .catch(() => undefined);
    }
  };

  const resetSale = () => {
    setCart([]);
    setDiscount('');
    setCustomer(null);
    setCurrentHeldId(null);
    setCompletedSale(null);
    setLastChange(0);
    searchRef.current?.focus();
  };

  const holdSale = async (payload: { label: string; note: string }) => {
    setHolding(true);
    try {
      await heldSalesApi.create({
        items: cart.map((i) => ({
          productId: i.productId,
          name: i.name,
          sku: i.sku,
          price: i.price,
          qty: i.qty,
          stock: i.stock,
          unit: i.unit,
        })),
        label: payload.label,
        note: payload.note,
        customerId: customer?.id || customer?._id,
        discount,
      });
      toast({ type: 'success', message: 'Sale held' });
      setCart([]);
      setDiscount('');
      setCustomer(null);
      setCurrentHeldId(null);
      setHoldModalOpen(false);
      refreshHeldCount();
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Could not hold sale',
      });
    } finally {
      setHolding(false);
    }
  };

  const resumeHeld = (held: HeldSale) => {
    setCart(
      held.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        sku: i.sku || undefined,
        price: i.price,
        qty: i.qty,
        stock: i.stock,
        unit: i.unit || undefined,
      }))
    );
    setDiscount(held.discount || '');
    const match = customers.find((c) => (c.id || c._id) === held.customerId);
    setCustomer(match || null);
    setCurrentHeldId(held._id);
    setHeldDrawerOpen(false);
    toast({ type: 'success', message: `Resumed: ${held.label}` });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'F4' && cart.length > 0 && !paymentOpen && !completedSale) {
        e.preventDefault();
        setPaymentOpen(true);
      }
      if (e.key === 'Escape') {
        setPaymentOpen(false);
        setCustomerPickerOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cart.length, paymentOpen, completedSale]);

  const categories = useMemo(() => {
    const fromProducts = products
      .map((p) => p.category)
      .filter(Boolean) as string[];
    return Array.from(new Set(fromProducts)).sort();
  }, [products]);

  if (clientStatus === 'loading' || clientStatus === 'idle') {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-bg">
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <div className="shrink-0 p-4 border-b border-border bg-surface">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-fg leading-none">
                Point of sale
              </h1>
              <p className="text-xs text-muted mt-1">
                {user?.fullName?.split(' ')[0]} · Register 01
              </p>
            </div>
            <Badge variant="success" dot>
              Open
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products or SKU (F2)"
                icon={<Search size={14} />}
              />
            </div>
            {categories.length > 0 && (
              <Select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                options={[
                  { value: '', label: 'All categories' },
                  ...categories.map((c) => ({ value: c, label: c })),
                ]}
              />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          {loadingProducts ? (
            <div className="flex items-center justify-center py-24">
              <Spinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <PackageIcon size={40} className="text-muted opacity-40 mb-3" />
              <p className="text-sm text-muted">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((p) => {
                const out = p.stock <= 0;
                const low = !out && p.stock <= p.lowStockThreshold;
                return (
                  <button
                    key={p._id}
                    type="button"
                    disabled={out}
                    onClick={() => addToCart(p)}
                    className={classNames(
                      'text-left rounded-lg border bg-surface p-3 transition',
                      out
                        ? 'border-border opacity-50 cursor-not-allowed'
                        : 'border-border hover:border-brand-500 hover:bg-elevated'
                    )}
                  >
                    <div className="aspect-square rounded-md bg-elevated mb-2 flex items-center justify-center overflow-hidden">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PackageIcon size={28} className="text-muted opacity-40" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-fg line-clamp-2 leading-tight">
                      {p.name}
                    </p>
                    <p className="text-[10px] text-muted mt-0.5 truncate">
                      {p.sku || p.category || '—'}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-sm font-semibold text-fg">
                        {formatCurrency(p.price, currency)}
                      </span>
                      <span
                        className={classNames(
                          'text-[10px] font-medium',
                          out
                            ? 'text-red-600 dark:text-red-400'
                            : low
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-muted'
                        )}
                      >
                        {out ? 'Out' : `${p.stock} left`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Cart
        items={cart}
        customer={customer}
        currency={currency}
        taxRate={taxRate}
        taxInclusive={taxInclusive}
        subtotal={subtotal}
        discountValue={discountValue}
        taxAmount={taxAmount}
        total={total}
        discount={discount}
        heldCount={heldCount}
        onDiscountChange={setDiscount}
        onQtyChange={changeQty}
        onRemove={removeItem}
        onClear={clearCart}
        onOpenCustomerPicker={() => setCustomerPickerOpen(true)}
        onOpenHeldSales={() => setHeldDrawerOpen(true)}
        onHoldSale={() => setHoldModalOpen(true)}
        onCharge={() => setPaymentOpen(true)}
      />

      {customerPickerOpen && (
        <CustomerPicker
          customers={customers}
          selected={customer}
          onSelect={(c) => {
            setCustomer(c);
            setCustomerPickerOpen(false);
          }}
          onCreate={(c) => setCustomers((cur) => [c, ...cur])}
          onClose={() => setCustomerPickerOpen(false)}
        />
      )}

      {paymentOpen && (
        <PaymentModal
          cart={cart}
          subtotal={subtotal}
          discountValue={discountValue}
          total={total}
          currency={currency}
          customer={customer}
          enabledMethods={enabledPaymentMethods}
          availableMethods={settings.paymentMethods as string[] | undefined}
          onClose={() => setPaymentOpen(false)}
          onSuccess={async (sale, change) => {
            if (currentHeldId) {
              try {
                await heldSalesApi.remove(currentHeldId);
              } catch {
                /* silent */
              }
              setCurrentHeldId(null);
              refreshHeldCount();
            }
            setPaymentOpen(false);
            setCompletedSale(sale);
            setLastChange(change);
          }}
        />
      )}

      {completedSale && (
        <SuccessModal
          sale={completedSale}
          change={lastChange}
          currency={currency}
          onNewSale={resetSale}
        />
      )}

      {holdModalOpen && (
        <HoldSaleModal
          defaultLabel={customer?.name || 'Walk-in'}
          itemCount={cart.reduce((s, i) => s + i.qty, 0)}
          total={formatCurrency(total, currency)}
          saving={holding}
          onConfirm={holdSale}
          onClose={() => setHoldModalOpen(false)}
        />
      )}

      {heldDrawerOpen && (
        <HeldSalesDrawer
          currency={currency}
          onResume={resumeHeld}
          onClose={() => setHeldDrawerOpen(false)}
        />
      )}
    </div>
  );
}