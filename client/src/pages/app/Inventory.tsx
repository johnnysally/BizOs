import { useMemo, useState } from 'react';

type StockStatus = 'Healthy' | 'Low stock' | 'Out of stock';
type InventoryView = 'all' | 'low' | 'out';
type AdvancedTool = 'transfer' | 'count' | 'reorder' | null;

type StockItem = {
  sku: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  reorderLevel: number;
  value: string;
  status: StockStatus;
};

const initialStock: StockItem[] = [
  { sku: 'CAB-2.5-TW', name: '2.5mm Twin Cable', category: 'Cables', location: 'Main Branch', quantity: 12, reorderLevel: 20, value: 'KES 102,000', status: 'Low stock' },
  { sku: 'SOC-13A-D', name: '13A Double Socket', category: 'Sockets', location: 'Main Branch', quantity: 38, reorderLevel: 15, value: 'KES 17,100', status: 'Healthy' },
  { sku: 'BRK-20A', name: '20A MCB', category: 'Breakers', location: 'Industrial Area', quantity: 7, reorderLevel: 10, value: 'KES 4,550', status: 'Low stock' },
  { sku: 'LGT-12W', name: 'LED Bulb 12W', category: 'Lighting', location: 'Main Branch', quantity: 42, reorderLevel: 20, value: 'KES 13,440', status: 'Healthy' },
  { sku: 'FAN-16-ST', name: '16-inch Stand Fan', category: 'Appliances', location: 'Industrial Area', quantity: 0, reorderLevel: 5, value: 'KES 0', status: 'Out of stock' },
  { sku: 'PNT-WHT-20', name: 'Interior Wall Paint 20L', category: 'Finishes', location: 'Main Branch', quantity: 18, reorderLevel: 12, value: 'KES 81,000', status: 'Healthy' },
];

const movements = [
  { reference: 'GRN-2048', product: '13A Double Socket', type: 'Stock received', quantity: '+24', user: 'Alice', time: 'Today, 09:42' },
  { reference: 'SAL-4402', product: '2.5mm Twin Cable', type: 'Sale deduction', quantity: '-6', user: 'John', time: 'Today, 09:18' },
  { reference: 'ADJ-0182', product: '20A MCB', type: 'Stock adjustment', quantity: '-2', user: 'Peter', time: 'Yesterday, 16:05' },
];

const getStockStatus = (quantity: number, reorderLevel: number): StockStatus => {
  if (quantity === 0) return 'Out of stock';
  if (quantity <= reorderLevel) return 'Low stock';
  return 'Healthy';
};

export function Inventory() {
  const [stock, setStock] = useState(initialStock);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');
  const [location, setLocation] = useState('All locations');
  const [view, setView] = useState<InventoryView>('all');
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [adjustmentSku, setAdjustmentSku] = useState(initialStock[0].sku);
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [advancedTool, setAdvancedTool] = useState<AdvancedTool>(null);
  const [transferSku, setTransferSku] = useState(initialStock[0].sku);
  const [transferQuantity, setTransferQuantity] = useState('');
  const [transferDestination, setTransferDestination] = useState('Industrial Area');
  const [countSku, setCountSku] = useState(initialStock[0].sku);
  const [countQuantity, setCountQuantity] = useState('');
  const [reorderSku, setReorderSku] = useState(initialStock[0].sku);
  const [reorderQuantity, setReorderQuantity] = useState(String(initialStock[0].reorderLevel));
  const [operationMessage, setOperationMessage] = useState('');
  const locations = ['All locations', ...new Set(stock.map((item) => item.location))];

  const categories = ['All categories', ...new Set(stock.map((item) => item.category))];
  const filteredStock = useMemo(() => stock.filter((item) => {
    const matchesSearch = `${item.name} ${item.sku} ${item.location}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All categories' || item.category === category;
    const matchesLocation = location === 'All locations' || item.location === location;
    const matchesView = view === 'all' || (view === 'low' && item.status === 'Low stock') || (view === 'out' && item.status === 'Out of stock');
    return matchesSearch && matchesCategory && matchesLocation && matchesView;
  }), [category, location, search, stock, view]);

  const lowStockCount = stock.filter((item) => item.status === 'Low stock').length;
  const outOfStockCount = stock.filter((item) => item.status === 'Out of stock').length;

  const adjustStock = () => {
    const amount = Number(adjustmentQuantity);
    if (!Number.isFinite(amount) || amount === 0) return;

    setStock((current) => current.map((item) => {
      if (item.sku !== adjustmentSku) return item;
      const quantity = Math.max(0, item.quantity + amount);
      const status = getStockStatus(quantity, item.reorderLevel);
      return { ...item, quantity, status };
    }));
    setAdjustmentQuantity('');
    setShowAdjustment(false);
    setOperationMessage('Stock adjustment applied');
  };

  const completeTransfer = () => {
    const amount = Number(transferQuantity);
    const product = stock.find((item) => item.sku === transferSku);
    if (!product || !Number.isFinite(amount) || amount <= 0 || amount > product.quantity) return;
    setStock((current) => current.map((item) => item.sku === transferSku
      ? { ...item, quantity: item.quantity - amount, status: getStockStatus(item.quantity - amount, item.reorderLevel) }
      : item));
    setOperationMessage(`${amount} units of ${product.name} transferred to ${transferDestination}.`);
    setTransferQuantity('');
  };

  const completeCount = () => {
    const amount = Number(countQuantity);
    if (!Number.isFinite(amount) || amount < 0) return;
    setStock((current) => current.map((item) => item.sku === countSku
      ? { ...item, quantity: amount, status: getStockStatus(amount, item.reorderLevel) }
      : item));
    const product = stock.find((item) => item.sku === countSku);
    setOperationMessage(`${product?.name ?? 'Product'} cycle count saved at ${amount} units.`);
    setCountQuantity('');
  };

  const saveReorderLevel = () => {
    const amount = Number(reorderQuantity);
    if (!Number.isFinite(amount) || amount < 0) return;
    setStock((current) => current.map((item) => item.sku === reorderSku
      ? { ...item, reorderLevel: amount, status: getStockStatus(item.quantity, amount) }
      : item));
    const product = stock.find((item) => item.sku === reorderSku);
    setOperationMessage(`${product?.name ?? 'Product'} reorder point set to ${amount} units.`);
  };

  const exportValuation = () => {
    const csv = [['SKU', 'Product', 'Category', 'Location', 'Quantity', 'Reorder level', 'Status'], ...stock.map((item) => [item.sku, item.name, item.category, item.location, String(item.quantity), String(item.reorderLevel), item.status])].map((row) => row.join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a'); link.href = url; link.download = 'bizos-inventory-valuation.csv'; link.click(); URL.revokeObjectURL(url);
    setOperationMessage('Inventory valuation exported');
  };

  return (
    <div className="inventory-workspace">
      <div className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Inventory control</p>
            <h3>Stock overview</h3>
            <p className="panel-subtitle">Monitor quantities, reorder points, and stock movement across your branches.</p>
          </div>
            <div className="inventory-heading-actions"><button className="secondary-button small" type="button" onClick={exportValuation}>Export valuation</button><button className="primary-button small" type="button" onClick={() => setShowAdjustment((current) => !current)}>
            {showAdjustment ? 'Close adjustment' : 'Adjust stock'}
          </button></div>
        </div>

        <div className="stats-row four-col inventory-stats">
          <div className="stat-card compact"><div className="stat-header"><span>Inventory value</span><span className="trend up">+8.4%</span></div><div className="stat-value">KES 3.84M</div><div className="stat-footer">Across 2 branches</div></div>
          <div className="stat-card compact"><div className="stat-header"><span>Active SKUs</span></div><div className="stat-value">1,268</div><div className="stat-footer">96% currently stocked</div></div>
          <div className="stat-card compact"><div className="stat-header"><span>Low stock</span><span className="trend down">Action</span></div><div className="stat-value">{lowStockCount}</div><div className="stat-footer">Below reorder level</div></div>
          <div className="stat-card compact"><div className="stat-header"><span>Out of stock</span></div><div className="stat-value">{outOfStockCount}</div><div className="stat-footer">Needs replenishment</div></div>
        </div>

        <div className="inventory-advanced-tools">
          <button className={`tool-card ${advancedTool === 'transfer' ? 'active' : ''}`} type="button" onClick={() => setAdvancedTool(advancedTool === 'transfer' ? null : 'transfer')}><strong>Transfer stock</strong><span>Move units between branches</span></button>
          <button className={`tool-card ${advancedTool === 'count' ? 'active' : ''}`} type="button" onClick={() => setAdvancedTool(advancedTool === 'count' ? null : 'count')}><strong>Cycle count</strong><span>Reconcile a physical count</span></button>
          <button className={`tool-card ${advancedTool === 'reorder' ? 'active' : ''}`} type="button" onClick={() => setAdvancedTool(advancedTool === 'reorder' ? null : 'reorder')}><strong>Reorder rules</strong><span>Set product thresholds</span></button>
        </div>

        {advancedTool && (
          <div className="advanced-operation-panel">
            {advancedTool === 'transfer' && <>
              <div><strong>Transfer inventory</strong><span>Record an internal branch movement.</span></div>
              <select value={transferSku} onChange={(event) => setTransferSku(event.target.value)} aria-label="Transfer product">{stock.map((item) => <option key={item.sku} value={item.sku}>{item.name} · {item.quantity} available</option>)}</select>
              <input type="number" min="1" value={transferQuantity} onChange={(event) => setTransferQuantity(event.target.value)} placeholder="Units" aria-label="Transfer quantity" />
              <select value={transferDestination} onChange={(event) => setTransferDestination(event.target.value)} aria-label="Transfer destination"><option>Main Branch</option><option>Industrial Area</option><option>Warehouse</option></select>
              <button className="secondary-button small" type="button" onClick={completeTransfer}>Transfer</button>
            </>}
            {advancedTool === 'count' && <>
              <div><strong>Cycle count</strong><span>Replace the system quantity with a verified count.</span></div>
              <select value={countSku} onChange={(event) => setCountSku(event.target.value)} aria-label="Count product">{stock.map((item) => <option key={item.sku} value={item.sku}>{item.name} · {item.location}</option>)}</select>
              <input type="number" min="0" value={countQuantity} onChange={(event) => setCountQuantity(event.target.value)} placeholder="Counted units" aria-label="Counted units" />
              <button className="secondary-button small" type="button" onClick={completeCount}>Save count</button>
            </>}
            {advancedTool === 'reorder' && <>
              <div><strong>Reorder rule</strong><span>Alert when stock reaches this threshold.</span></div>
              <select value={reorderSku} onChange={(event) => { setReorderSku(event.target.value); const product = stock.find((item) => item.sku === event.target.value); setReorderQuantity(String(product?.reorderLevel ?? 0)); }} aria-label="Reorder product">{stock.map((item) => <option key={item.sku} value={item.sku}>{item.name}</option>)}</select>
              <input type="number" min="0" value={reorderQuantity} onChange={(event) => setReorderQuantity(event.target.value)} placeholder="Units" aria-label="Reorder threshold" />
              <button className="secondary-button small" type="button" onClick={saveReorderLevel}>Save rule</button>
            </>}
          </div>
        )}
        {operationMessage && <div className="operation-message" role="status">{operationMessage}</div>}

        {showAdjustment && (
          <div className="adjustment-panel">
            <div><strong>Quick stock adjustment</strong><span>Add or remove units from a branch count.</span></div>
            <select value={adjustmentSku} onChange={(event) => setAdjustmentSku(event.target.value)} aria-label="Product to adjust">
              {stock.map((item) => <option key={item.sku} value={item.sku}>{item.name} · {item.location}</option>)}
            </select>
            <input type="number" value={adjustmentQuantity} onChange={(event) => setAdjustmentQuantity(event.target.value)} placeholder="+/- units" aria-label="Adjustment quantity" />
            <button className="secondary-button small" type="button" onClick={adjustStock}>Apply</button>
          </div>
        )}
      </div>

      <div className="content-grid inventory-grid">
        <div className="panel">
          <div className="panel-header">
            <div><p className="eyebrow">Stock ledger</p><h3>Product quantities</h3></div>
            <span className="muted-count">{filteredStock.length} products</span>
          </div>

          <div className="inventory-toolbar">
            <label className="search-field"><span>Search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, SKU, branch..." /></label>
            <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={location} onChange={(event) => setLocation(event.target.value)} aria-label="Filter by location">
              {locations.map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div className="inventory-view-tabs" role="tablist" aria-label="Stock status">
            {([['all', 'All stock'], ['low', 'Low stock'], ['out', 'Out of stock']] as Array<[InventoryView, string]>).map(([id, label]) => (
              <button key={id} className={`chip ${view === id ? 'active' : ''}`} onClick={() => setView(id)} type="button" role="tab" aria-selected={view === id}>{label}</button>
            ))}
          </div>

          <div className="table-shell inventory-table">
            <table>
              <thead><tr><th>Product</th><th>Category</th><th>Location</th><th>On hand</th><th>Reorder at</th><th>Value</th><th>Status</th></tr></thead>
              <tbody>
                {filteredStock.map((item) => (
                  <tr key={item.sku}>
                    <td><strong>{item.name}</strong><small className="table-secondary">{item.sku}</small></td>
                    <td>{item.category}</td><td>{item.location}</td><td><strong>{item.quantity}</strong></td><td>{item.reorderLevel}</td><td>{item.value}</td>
                    <td><span className={`status-badge ${item.status === 'Healthy' ? 'success' : item.status === 'Low stock' ? 'warning' : 'danger'}`}>{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header"><div><p className="eyebrow">Audit trail</p><h3>Recent movements</h3></div><button className="ghost-button small" type="button">View all</button></div>
          <div className="movement-list">
            {movements.map((movement) => <div className="movement-row" key={movement.reference}><div><strong>{movement.product}</strong><span>{movement.type} · {movement.reference}</span></div><div className="movement-meta"><strong className={movement.quantity.startsWith('+') ? 'positive' : 'negative'}>{movement.quantity}</strong><span>{movement.time}</span></div></div>)}
          </div>
          <div className="inventory-note"><strong>Replenishment tip</strong><span>2 products need a purchase order to maintain this week's sales pace.</span></div>
        </div>
      </div>
    </div>
  );
}
