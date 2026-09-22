import { useState } from 'react';
import { Customers } from './Customers';
import { Inventory } from './Inventory';
import { Reports } from './Reports';
import { Sales } from './Sales';

type DashboardPage = 'sales' | 'inventory' | 'customers' | 'reports';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<DashboardPage>('sales');
  const [range, setRange] = useState('This week');
  const [branch, setBranch] = useState('All branches');
  const [notice, setNotice] = useState('');
  const summary = [
    { label: 'Today sales', value: 'KES 184,250', change: '+12.4%' },
    { label: 'Gross profit', value: 'KES 52,480', change: '+9.1%' },
    { label: 'Transactions', value: '87', change: '+18' },
    { label: 'Avg. order', value: 'KES 2,118', change: '+4.8%' },
  ];

  const recentSales = [
    { receipt: 'INV-00482', customer: 'James Ndungu', amount: 'KES 3,450', status: 'Paid' },
    { receipt: 'INV-00481', customer: 'Sunset Homes', amount: 'KES 16,820', status: 'Paid' },
    { receipt: 'INV-00480', customer: 'Kariuki Tech', amount: 'KES 9,625', status: 'Pending' },
  ];

  const topProducts = [
    { name: '2.5mm Twin Cable', units: 42, revenue: 'KES 357,000' },
    { name: 'LED Bulb 12W', units: 38, revenue: 'KES 12,160' },
    { name: '13A Double Socket', units: 31, revenue: 'KES 13,950' },
  ];

  const tabs: Array<{ id: DashboardPage; label: string }> = [
    { id: 'sales', label: 'Sales' },
    { id: 'inventory', label: 'Inventory' },
    { id: 'customers', label: 'Customers' },
    { id: 'reports', label: 'Reports' },
  ];

  const tabContent = {
    sales: <Sales />,
    inventory: <Inventory />,
    customers: <Customers />,
    reports: <Reports />,
  };

  return (
    <>
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Business command center</p>
          <h1>Good morning, John</h1>
          <p>Here is what is happening across your business {branch === 'All branches' ? 'today' : `at ${branch}`}.</p>
        </div>
        <div className="dashboard-controls">
          <select value={range} onChange={(event) => setRange(event.target.value)} aria-label="Dashboard date range"><option>Today</option><option>This week</option><option>This month</option><option>This quarter</option></select>
          <select value={branch} onChange={(event) => setBranch(event.target.value)} aria-label="Dashboard branch"><option>All branches</option><option>Main Branch</option><option>Industrial Area</option></select>
        </div>
      </section>

      <section className="dashboard-summary-grid">
        {summary.map((item) => <div className="stat-card" key={item.label}><div className="stat-header"><span>{item.label}</span><span className="trend up">{item.change}</span></div><div className="stat-value">{item.value}</div><div className="stat-footer">Compared with previous period</div></div>)}
      </section>

      <section className="dashboard-diagrams">
        <div className="panel diagram-panel diagram-wide">
          <div className="panel-header"><div><p className="eyebrow">Revenue trend</p><h3>Sales vs profit</h3></div><span className="muted-count">{range}</span></div>
          <div className="diagram-line-chart"><div className="line-grid"><span>200K</span><span>150K</span><span>100K</span><span>50K</span><span>0</span></div><div className="line-chart-area"><svg viewBox="0 0 700 220" role="img" aria-label="Revenue and profit trend"><polyline className="diagram-line revenue-line" points="0,150 115,110 230,132 345,72 460,58 575,98 700,78" /><polyline className="diagram-line profit-line" points="0,184 115,158 230,170 345,132 460,118 575,150 700,134" /></svg><div className="diagram-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div></div>
        </div>
        <div className="panel diagram-panel">
          <div className="panel-header"><div><p className="eyebrow">Payments</p><h3>Collection mix</h3></div><span className="muted-count">473 sales</span></div>
          <div className="donut-layout"><div className="donut-chart"><div><strong>1.04M</strong><span>Total</span></div></div><div className="diagram-legend"><span><i className="legend-swatch mpesa" />M-Pesa <b>48%</b></span><span><i className="legend-swatch cash" />Cash <b>27%</b></span><span><i className="legend-swatch card" />Card <b>16%</b></span><span><i className="legend-swatch credit" />Credit <b>9%</b></span></div></div>
        </div>
        <div className="panel diagram-panel">
          <div className="panel-header"><div><p className="eyebrow">Inventory</p><h3>Stock health</h3></div><span className="status-badge warning">33 alerts</span></div>
          <div className="health-chart"><div className="health-row"><span>Healthy</span><div><i className="healthy-fill" style={{ width: '76%' }} /></div><strong>76%</strong></div><div className="health-row"><span>Low stock</span><div><i className="low-fill" style={{ width: '18%' }} /></div><strong>18%</strong></div><div className="health-row"><span>Out of stock</span><div><i className="out-fill" style={{ width: '6%' }} /></div><strong>6%</strong></div></div><div className="health-summary"><span><strong>1,268</strong> active SKUs</span><span><strong>24</strong> reorder alerts</span></div>
        </div>
        <div className="panel diagram-panel">
          <div className="panel-header"><div><p className="eyebrow">Branches</p><h3>Performance</h3></div><span className="muted-count">Today</span></div>
          <div className="branch-chart"><div className="branch-bar-row"><span>Main Branch</span><div><i style={{ width: '88%' }} /></div><strong>184K</strong></div><div className="branch-bar-row"><span>Industrial Area</span><div><i style={{ width: '48%' }} /></div><strong>84K</strong></div><div className="branch-bar-row"><span>Westlands</span><div><i style={{ width: '36%' }} /></div><strong>63K</strong></div></div><p className="diagram-footnote">Main Branch contributes 56% of today's revenue.</p>
        </div>
      </section>

      <section className="content-grid main-grid">
        <div className="panel large-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Performance</p>
              <h3>Sales overview</h3>
            </div>
            <span className="chart-legend"><span><i className="legend-dot revenue-dot" />Revenue</span><span><i className="legend-dot profit-dot" />Profit</span></span>
          </div>
          <div className="chart-panel">
            <div className="chart-grid">
              {[58, 72, 64, 88, 90, 68, 74].map((value, index) => (
                <div key={index} className="chart-column-group">
                  <div className="chart-stack">
                    <span className="chart-bar revenue" style={{ height: `${value}%` }} />
                    <span className="chart-bar profit" style={{ height: `${Math.max(22, value - 12)}%` }} />
                  </div>
                  <label>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Inventory</p>
              <h3>Stock health</h3>
            </div>
          </div>
          <div className="inventory-list">
            {[
              ['Inventory value', 'KES 3.84M'],
              ['Products in stock', '1,268'],
              ['Low stock', '24'],
              ['Out of stock', '9'],
            ].map(([label, value]) => (
              <div key={label} className="inventory-row">
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-insight-grid">
        <div className="panel target-panel"><div className="panel-header"><div><p className="eyebrow">Target progress</p><h3>Monthly revenue goal</h3></div><span className="trend up">74%</span></div><div className="target-value"><strong>KES 2.96M</strong><span>of KES 4.00M</span></div><div className="target-track"><i /></div><p>At this pace you are projected to reach target by 27 September.</p></div>
        <div className="panel"><div className="panel-header"><div><p className="eyebrow">Attention needed</p><h3>Open actions</h3></div><button className="ghost-button small" type="button" onClick={() => setNotice('Alerts center opened')}>View alerts</button></div><div className="dashboard-alert-list"><button type="button" onClick={() => setNotice('Inventory review opened')}><span className="alert-mini warning">!</span><span><strong>24 low-stock products</strong><small>Replenishment recommended</small></span></button><button type="button" onClick={() => setNotice('Collections review opened')}><span className="alert-mini danger">!</span><span><strong>KES 100K overdue</strong><small>Customer balances need follow-up</small></span></button><button type="button" onClick={() => setNotice('Payroll review opened')}><span className="alert-mini info">i</span><span><strong>2 payroll entries pending</strong><small>Review before pay date</small></span></button></div></div>
      </section>

      <section className="dashboard-tabs panel">
        <div className="dashboard-tabs-header">
          <div>
            <p className="eyebrow">At a glance</p>
            <h3>Business workspace</h3>
          </div>
          <div className="tab-list" role="tablist" aria-label="Dashboard views">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`dashboard-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                }}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="dashboard-tab-content">{tabContent[activeTab]}</div>
      </section>

      <section className="content-grid second-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Sales</p>
              <h3>Recent transactions</h3>
            </div>
          </div>
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Receipt</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.receipt}>
                    <td>{sale.receipt}</td>
                    <td>{sale.customer}</td>
                    <td>{sale.amount}</td>
                    <td><span className={`status-badge ${sale.status === 'Paid' ? 'success' : 'warning'}`}>{sale.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel"><div className="panel-header"><div><p className="eyebrow">Product performance</p><h3>Top products</h3></div><button className="ghost-button small" type="button" onClick={() => setActiveTab('inventory')}>Inventory</button></div><div className="top-product-list">{topProducts.map((product, index) => <div className="top-product-row" key={product.name}><span className="product-rank">0{index + 1}</span><div><strong>{product.name}</strong><small>{product.units} units sold</small></div><b>{product.revenue}</b></div>)}</div></div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Quick actions</p>
              <h3>Tools</h3>
            </div>
          </div>
          <div className="quick-actions-grid">
            {['New Sale', 'Add Product', 'Add Customer', 'Record Expense'].map((action) => (
              <button key={action} type="button" className="quick-action">
                {action}
              </button>
            ))}
          </div>
        </div>
      </section>
      {notice && <div className="pos-notice" role="status">{notice}</div>}
    </>
  );
}
