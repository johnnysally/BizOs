import { useEffect, useState } from 'react';

type Product = { name: string; sku: string; category: string; price: number; stock: number; unit: string };
type CartItem = Product & { quantity: number };
type PaymentMethod = 'M-Pesa' | 'Cash' | 'Card' | 'Credit';
type HeldSale = { id: number; customer: string; cart: CartItem[]; discount: number; note: string };

const products: Product[] = [
  { name: '2.5mm Twin Cable', sku: 'CAB-2.5-TW', category: 'Cables', price: 8500, stock: 12, unit: 'coil' },
  { name: 'LED Bulb 12W', sku: 'LGT-12W', category: 'Lighting', price: 320, stock: 42, unit: 'piece' },
  { name: '20A MCB', sku: 'BRK-20A', category: 'Switches', price: 650, stock: 7, unit: 'piece' },
  { name: 'PVC Conduit 20mm', sku: 'CON-20-PVC', category: 'Cables', price: 1800, stock: 9, unit: 'length' },
  { name: '13A Double Socket', sku: 'SOC-13A-D', category: 'Sockets', price: 450, stock: 38, unit: 'piece' },
  { name: '16-inch Stand Fan', sku: 'FAN-16-ST', category: 'Appliances', price: 6400, stock: 0, unit: 'piece' },
];

const customers = ['Walk-in customer', 'James Ndungu', 'Sunset Homes', 'Hydra Construction'];
const money = (amount: number) => `KES ${amount.toLocaleString('en-KE')}`;

export function POS() {
  const [search, setSearch] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([{
    ...products[0], quantity: 1,
  }, { ...products[2], quantity: 2 }, { ...products[1], quantity: 1 }]);
  const [customer, setCustomer] = useState(customers[0]);
  const [discount, setDiscount] = useState(0);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('M-Pesa');
  const [amountReceived, setAmountReceived] = useState('');
  const [completedSale, setCompletedSale] = useState(false);
  const [heldSales, setHeldSales] = useState(0);
  const [heldCarts, setHeldCarts] = useState<HeldSale[]>([]);
  const [splitPayment, setSplitPayment] = useState(false);
  const [splitMethod, setSplitMethod] = useState<PaymentMethod>('Cash');
  const [splitAmount, setSplitAmount] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [note, setNote] = useState('');
  const [receiptDelivery, setReceiptDelivery] = useState<'Print' | 'Email' | 'SMS'>('Print');
  const [notice, setNotice] = useState('');

  const categories = ['All', ...new Set(products.map((product) => product.category))];
  const visibleProducts = products.filter((product) => {
    const matchesCategory = category === 'All' || product.category === category;
    const query = `${product.name} ${product.sku}`.toLowerCase();
    return matchesCategory && query.includes(search.toLowerCase());
  });
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const discountAmount = Math.round(subtotal * discount / 100);
  const taxableAmount = subtotal - discountAmount;
  const tax = Math.round(taxableAmount * 0.16);
  const total = taxableAmount + tax;
  const change = Math.max(0, Number(amountReceived || 0) - total);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key === 'F2') { event.preventDefault(); document.querySelector<HTMLInputElement>('.search-field.big input')?.focus(); }
      if (event.key === 'F4' && cart.length > 0) { event.preventDefault(); setShowPayment(true); }
      if (event.key === 'Escape') { setShowPayment(false); setCompletedSale(false); setShowCustomerForm(false); }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [cart.length]);

  const addToCart = (product: Product) => {
    if (product.stock === 0) return;
    setCart((current) => {
      const existing = current.find((item) => item.sku === product.sku);
      if (existing) return current.map((item) => item.sku === product.sku ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item);
      return [...current, { ...product, quantity: 1 }];
    });
    setNotice(`${product.name} added to sale`);
  };

  const changeQuantity = (sku: string, delta: number) => setCart((current) => current.flatMap((item) => {
    if (item.sku !== sku) return [item];
    const quantity = item.quantity + delta;
    return quantity > 0 && quantity <= item.stock ? [{ ...item, quantity }] : quantity <= 0 ? [] : [item];
  }));

  const addBarcode = () => {
    const product = products.find((item) => item.sku.toLowerCase() === barcode.trim().toLowerCase());
    if (product) addToCart(product);
    else setNotice('No product found for that SKU');
    setBarcode('');
  };

  const holdSale = () => {
    if (!cart.length) return;
    setHeldCarts((current) => [...current, { id: Date.now(), customer, cart, discount, note }]);
    setHeldSales((current) => current + 1);
    setCart([]);
    setNotice('Sale held for later');
  };

  const restoreSale = (held: HeldSale) => {
    setCart(held.cart); setCustomer(held.customer); setDiscount(held.discount); setNote(held.note);
    setHeldCarts((current) => current.filter((item) => item.id !== held.id));
    setNotice('Held sale restored');
  };

  const saveCustomer = () => {
    if (!customerPhone.trim()) return;
    setNotice(`${customer} linked to ${customerPhone}`);
    setShowCustomerForm(false);
  };

  const finishSale = () => {
    setShowPayment(false);
    setCompletedSale(true);
  };

  const paymentReady = splitPayment ? Number(splitAmount) > 0 && Number(splitAmount) < total && Number(amountReceived) >= total - Number(splitAmount) : paymentMethod === 'Credit' || Number(amountReceived) >= total;

  return (
    <div className="pos-dashboard">
      <div className="pos-shell">
        <div className="pos-main">
          <div className="pos-heading"><div><p className="eyebrow">Point of sale</p><h3>New transaction</h3></div><span className="status-pill online"><span className="dot" />Register open</span></div>
          <div className="pos-toolbar">
            <div className="search-field big"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products or SKU" /></div>
            <button className="secondary-button small" type="button" onClick={() => setSearch('')}>Clear</button>
          </div>
          <div className="barcode-row"><input value={barcode} onChange={(event) => setBarcode(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && addBarcode()} placeholder="Scan or enter SKU, e.g. CAB-2.5-TW" aria-label="Scan barcode or enter SKU" /><button className="secondary-button small" type="button" onClick={addBarcode}>Add SKU</button></div>

          <div className="category-row">{categories.map((item) => <button key={item} type="button" className={`category-chip ${category === item ? 'active' : ''}`} onClick={() => setCategory(item)}>{item}</button>)}</div>
          <div className="product-grid">
            {visibleProducts.map((product) => <div key={product.sku} className="product-card"><div className="product-visual"><span className="image-badge">{product.stock === 0 ? 'Out of stock' : product.stock < 10 ? 'Low stock' : 'Available'}</span></div><div className="product-meta"><strong>{product.name}</strong><small className="sku-label">{product.sku} · {product.unit}</small><div className="product-price-row"><span>{money(product.price)}</span><small>{product.stock} left</small></div><button className="primary-button small wide" type="button" onClick={() => addToCart(product)} disabled={product.stock === 0}>{product.stock === 0 ? 'Unavailable' : 'Add to cart'}</button></div></div>)}
          </div>
          {notice && <div className="pos-notice" role="status">{notice}</div>}
        </div>

        <aside className="cart-sheet">
          <div className="cart-header"><div><p className="eyebrow">Register 01</p><h3>Current sale</h3></div><span className="status-badge neutral">{cart.reduce((count, item) => count + item.quantity, 0)} items</span></div>
          <label className="pos-field"><span>Customer</span><div className="customer-select-row"><select value={customer} onChange={(event) => setCustomer(event.target.value)}>{customers.map((item) => <option key={item}>{item}</option>)}</select><button className="secondary-button small" type="button" onClick={() => setShowCustomerForm((current) => !current)}>+ Customer</button></div></label>
          {showCustomerForm && <div className="pos-customer-form"><input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} placeholder="Customer phone" aria-label="Customer phone" /><button className="secondary-button small" type="button" onClick={saveCustomer}>Link</button></div>}
          <div className="cart-items">{cart.length === 0 ? <div className="empty-cart">Your cart is empty.<span>Add products to begin this sale.</span></div> : cart.map((item) => <div key={item.sku} className="cart-item"><div className="cart-item-main"><div><strong>{item.name}</strong><small>{money(item.price)} each</small></div><span className="line-price">{money(item.price * item.quantity)}</span></div><div className="quantity-row"><div className="qty-control"><button className="qty-button" type="button" onClick={() => changeQuantity(item.sku, -1)}>-</button><span>{item.quantity}</span><button className="qty-button" type="button" onClick={() => changeQuantity(item.sku, 1)}>+</button></div><button className="meta-link" type="button" onClick={() => setCart((current) => current.filter((entry) => entry.sku !== item.sku))}>Remove</button></div></div>)}</div>
          <div className="discount-row"><span>Discount</span><div className="discount-control"><input type="number" min="0" max="100" value={discount} onChange={(event) => setDiscount(Math.min(100, Math.max(0, Number(event.target.value))))} /><span>%</span></div></div>
          <label className="pos-note-field"><span>Sale note</span><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional note for this transaction" /></label>
          <div className="totals-box"><div className="line-total"><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div className="line-total"><span>Discount</span><strong>- {money(discountAmount)}</strong></div><div className="line-total"><span>VAT (16%)</span><strong>{money(tax)}</strong></div><div className="line-total highlight"><span>Total</span><strong>{money(total)}</strong></div></div>
          <div className="cart-actions"><button className="primary-button wide" type="button" disabled={!cart.length} onClick={() => setShowPayment(true)}>Pay {money(total)}</button><div className="grid-two"><button className="secondary-button" type="button" onClick={holdSale}>Hold sale {heldSales > 0 ? `(${heldSales})` : ''}</button><button className="secondary-button" type="button" onClick={() => setCart([])}>Clear</button></div></div>
          {heldCarts.length > 0 && <div className="held-sale-list"><strong>Held sales</strong>{heldCarts.map((held) => <button type="button" key={held.id} onClick={() => restoreSale(held)}><span>{held.customer}</span><small>{held.cart.length} products</small></button>)}</div>}
        </aside>
      </div>

      {showPayment && <div className="modal-backdrop" role="presentation"><div className="payment-modal" role="dialog" aria-modal="true" aria-labelledby="payment-title"><div className="modal-header"><div><p className="eyebrow">Checkout</p><h3 id="payment-title">Collect payment</h3></div><button className="icon-button" type="button" onClick={() => setShowPayment(false)}>×</button></div><div className="payment-total">{money(total)}<small>{customer}</small></div><div className="payment-options"><button className={`method-chip ${!splitPayment ? 'active' : ''}`} type="button" onClick={() => setSplitPayment(false)}>Single payment</button><button className={`method-chip ${splitPayment ? 'active' : ''}`} type="button" onClick={() => setSplitPayment(true)}>Split payment</button></div>{splitPayment && <div className="split-payment-box"><select value={splitMethod} onChange={(event) => setSplitMethod(event.target.value as PaymentMethod)}><option>Cash</option><option>M-Pesa</option><option>Card</option></select><input type="number" min="1" value={splitAmount} onChange={(event) => setSplitAmount(event.target.value)} placeholder="First payment" /><span>Remaining: {money(Math.max(0, total - Number(splitAmount || 0)))}</span></div>}<div className="payment-methods">{(['M-Pesa', 'Cash', 'Card', 'Credit'] as PaymentMethod[]).map((method) => <button key={method} className={`method-chip ${paymentMethod === method ? 'active' : ''}`} type="button" onClick={() => setPaymentMethod(method)}>{method}</button>)}</div>{paymentMethod !== 'Credit' && <label className="field payment-field"><span>{splitPayment ? `Remaining payment (${paymentMethod})` : 'Amount received'}</span><input autoFocus type="number" value={amountReceived} onChange={(event) => setAmountReceived(event.target.value)} placeholder={money(splitPayment ? Math.max(0, total - Number(splitAmount || 0)) : total)} /></label>}{paymentMethod !== 'Credit' && Number(amountReceived) > 0 && !splitPayment && <div className="payment-change"><span>Change due</span><strong>{money(change)}</strong></div>}<label className="receipt-delivery"><span>Receipt delivery</span><select value={receiptDelivery} onChange={(event) => setReceiptDelivery(event.target.value as typeof receiptDelivery)}><option>Print</option><option>Email</option><option>SMS</option></select></label><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setShowPayment(false)}>Cancel</button><button className="primary-button" type="button" disabled={!paymentReady} onClick={finishSale}>Complete sale</button></div></div></div>}
      {completedSale && <div className="modal-backdrop" role="presentation"><div className="success-modal" role="dialog" aria-modal="true"><div className="success-icon">✓</div><h3>Sale completed</h3><div className="success-amount">{money(total)}</div><p>Receipt INV-00483 · {customer}</p><div className="modal-actions"><button className="secondary-button" type="button" onClick={() => setCompletedSale(false)}>Close</button><button className="primary-button" type="button" onClick={() => { setCompletedSale(false); setCart([]); setCustomer(customers[0]); }}>New sale</button></div></div></div>}
    </div>
  );
}
