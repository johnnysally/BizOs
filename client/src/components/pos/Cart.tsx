import { Clock, Minus, Plus, ShoppingCart, User as UserIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/utils/currency';
import type { Customer } from '@/types/customer';

export interface CartItem {
  productId: string;
  name: string;
  sku?: string;
  price: number;
  qty: number;
  stock: number;
  unit?: string;
}

interface Props {
  items: CartItem[];
  customer: Customer | null;
  currency: string;
  taxRate: number;
  taxInclusive: boolean;
  subtotal: number;
  discountValue: number;
  taxAmount: number;
  total: number;
  discount: string;
  heldCount: number;
  onDiscountChange: (v: string) => void;
  onQtyChange: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onOpenCustomerPicker: () => void;
  onOpenHeldSales: () => void;
  onHoldSale: () => void;
  onCharge: () => void;
}

export function Cart({
  items,
  customer,
  currency,
  taxRate,
  taxInclusive,
  subtotal,
  discountValue,
  taxAmount,
  total,
  discount,
  heldCount,
  onDiscountChange,
  onQtyChange,
  onRemove,
  onClear,
  onOpenCustomerPicker,
  onOpenHeldSales,
  onHoldSale,
  onCharge,
}: Props) {
  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <aside className="w-full lg:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-surface flex flex-col max-h-[60vh] lg:max-h-none">
      <div className="shrink-0 px-4 py-3 border-b border-border flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-fg leading-none">
            Current sale
          </h2>
          <p className="text-xs text-muted mt-1">
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {heldCount > 0 && (
            <button
              type="button"
              onClick={onOpenHeldSales}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-medium hover:bg-amber-100 dark:hover:bg-amber-500/20 transition"
            >
              <Clock size={12} />
              Held ({heldCount})
            </button>
          )}
          {items.length > 0 && (
            <Button size="sm" variant="ghost" onClick={onClear}>
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="shrink-0 px-4 py-2 border-b border-border">
        <button
          type="button"
          onClick={onOpenCustomerPicker}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-elevated hover:bg-brand-50 dark:hover:bg-brand-500/10 text-left transition"
        >
          <UserIcon size={14} className="text-muted shrink-0" />
          <span className="text-sm text-fg truncate flex-1">
            {customer ? customer.name : 'Walk-in customer'}
          </span>
          <span className="text-xs text-brand-600 dark:text-brand-400 shrink-0">
            {customer ? 'Change' : 'Add'}
          </span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
            <ShoppingCart size={32} className="text-muted opacity-40 mb-3" />
            <p className="text-sm text-muted">Your cart is empty.</p>
            <p className="text-xs text-muted mt-1">
              Click a product to add it to the sale.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.productId} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-fg truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {formatCurrency(item.price, currency)}
                      {item.unit ? ` · ${item.unit}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(item.productId)}
                    className="shrink-0 p-1 rounded text-muted hover:text-red-600 hover:bg-elevated transition"
                    aria-label="Remove"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="inline-flex items-center rounded-md border border-border">
                    <button
                      type="button"
                      onClick={() => onQtyChange(item.productId, -1)}
                      className="p-1.5 text-muted hover:text-fg hover:bg-elevated transition rounded-l-md"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-3 text-sm font-medium text-fg tabular-nums">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQtyChange(item.productId, 1)}
                      disabled={item.qty >= item.stock}
                      className="p-1.5 text-muted hover:text-fg hover:bg-elevated transition rounded-r-md disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="text-sm font-semibold text-fg">
                    {formatCurrency(item.price * item.qty, currency)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="shrink-0 border-t border-border">
        <div className="px-4 py-3 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs text-muted shrink-0">Discount %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => {
                const n = Math.max(0, Math.min(100, Number(e.target.value)));
                onDiscountChange(String(n));
              }}
              placeholder="0"
              className="w-20 rounded-md border border-border bg-surface text-fg text-sm px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>

          <div className="border-t border-border pt-2 space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Subtotal</span>
              <span className="text-fg">{formatCurrency(subtotal, currency)}</span>
            </div>
            {discountValue > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted">Discount</span>
                <span className="text-red-600 dark:text-red-400">
                  −{formatCurrency(discountValue, currency)}
                </span>
              </div>
            )}
            {taxRate > 0 && (
              <div className="flex items-center justify-between text-xs text-muted">
                <span>
                  VAT {taxRate}%{taxInclusive ? ' (incl.)' : ''}
                </span>
                <span>{formatCurrency(taxAmount, currency)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-border text-base font-semibold">
              <span className="text-fg">Total</span>
              <span className="text-fg">{formatCurrency(total, currency)}</span>
            </div>
          </div>

          <Button
            fullWidth
            size="lg"
            disabled={items.length === 0}
            onClick={onCharge}
          >
            Charge {formatCurrency(total, currency)}
          </Button>

          <Button
            fullWidth
            variant="outline"
            disabled={items.length === 0}
            onClick={onHoldSale}
            icon={<Clock size={14} />}
          >
            Hold sale
          </Button>

          <p className="text-[10px] text-muted text-center">
            Press F4 to charge · Esc to cancel
          </p>
        </div>
      </div>
    </aside>
  );
}