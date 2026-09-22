import { useMemo, useState } from 'react';

type ReportTab = 'sales' | 'profit' | 'inventory' | 'customers' | 'team';

const reportTabs: Array<{ id: ReportTab; label: string }> = [
  { id: 'sales', label: 'Sales summary' },
  { id: 'profit', label: 'Profit & loss' },
  { id: 'inventory', label: 'Inventory valuation' },
  { id: 'customers', label: 'Customer balances' },
  { id: 'team', label: 'Team performance' },
];

const reportRows = {
  sales: [
    ['Monday', 'KES 184,250', '87', 'KES 2,118'],
    ['Tuesday', 'KES 211,840', '96', 'KES 2,206'],
    ['Wednesday', 'KES 168,420', '74', 'KES 2,276'],
    ['Thursday', 'KES 245,600', '112', 'KES 2,193'],
    ['Friday', 'KES 228,910', '104', 'KES 2,201'],
  ],
  profit: [
    ['Sales revenue', 'KES 1,039,020', '100%', 'KES 1,039,020'],
    ['Cost of goods sold', 'KES 715,920', '68.9%', '- KES 715,920'],
    ['Gross profit', 'KES 323,100', '31.1%', 'KES 323,100'],
    ['Operating expenses', 'KES 82,400', '7.9%', '- KES 82,400'],
    ['Net profit', 'KES 240,700', '23.2%', 'KES 240,700'],
  ],
  inventory: [
    ['Cables', 'KES 1,820,000', '284', 'KES 1,820,000'],
    ['Lighting', 'KES 640,400', '426', 'KES 640,400'],
    ['Sockets', 'KES 492,200', '318', 'KES 492,200'],
    ['Appliances', 'KES 688,100', '118', 'KES 688,100'],
    ['Finishes', 'KES 199,300', '122', 'KES 199,300'],
  ],
  customers: [
    ['Sunset Homes', 'KES 861,700', 'KES 72,500', '18 invoices'],
    ['James Ndungu', 'KES 402,400', 'KES 18,250', '12 invoices'],
    ['Hydra Construction', 'KES 256,900', 'KES 9,400', '9 invoices'],
    ['Kariuki Tech', 'KES 198,200', 'KES 0', '7 invoices'],
  ],
  team: [
    ['Alice Wambui', 'KES 284,600', '132', '98.4%'],
    ['John Mwangi', 'KES 246,800', '104', '96.8%'],
    ['Mary Muthoni', 'KES 198,200', '86', '94.2%'],
    ['Peter Karanja', 'KES 164,900', '72', '91.6%'],
  ],
};

const headings: Record<ReportTab, [string, string, string, string]> = {
  sales: ['Period', 'Revenue', 'Transactions', 'Average order'],
  profit: ['Line item', 'Amount', 'Margin', 'Statement value'],
  inventory: ['Category', 'Stock value', 'SKUs', 'Valuation'],
  customers: ['Customer', 'Purchases', 'Outstanding', 'Activity'],
  team: ['Team member', 'Sales', 'Transactions', 'Conversion'],
};

export function Reports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('sales');
  const [range, setRange] = useState('This week');
  const [branch, setBranch] = useState('All branches');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const rows = useMemo(() => reportRows[activeTab].filter((row) => row.join(' ').toLowerCase().includes(search.toLowerCase())), [activeTab, search]);

  const exportReport = () => {
    const csv = [headings[activeTab], ...rows].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `bizos-${activeTab}-report.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice('Report exported successfully');
  };

  return (
    <div className="reports-workspace">
      <div className="panel reports-header">
        <div><p className="eyebrow">Business intelligence</p><h3>Performance reports</h3><p className="panel-subtitle">Explore revenue, profitability, stock value, customer credit, and team performance.</p></div>
        <div className="report-actions"><button className="secondary-button small" type="button" onClick={() => window.print()}>Print</button><button className="primary-button small" type="button" onClick={exportReport}>Export CSV</button></div>
      </div>

      <div className="report-filter-bar panel"><label className="field"><span>Date range</span><select value={range} onChange={(event) => setRange(event.target.value)}><option>Today</option><option>This week</option><option>This month</option><option>This quarter</option><option>Custom range</option></select></label><label className="field"><span>Branch</span><select value={branch} onChange={(event) => setBranch(event.target.value)}><option>All branches</option><option>Main Branch</option><option>Industrial Area</option></select></label><label className="report-search"><span>Search report</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search rows..." /></label></div>

      <div className="report-kpis"><div className="stat-card compact"><div className="stat-header"><span>Revenue</span><span className="trend up">+12.4%</span></div><div className="stat-value">KES 1.04M</div><div className="stat-footer">{range} · {branch}</div></div><div className="stat-card compact"><div className="stat-header"><span>Gross margin</span><span className="trend up">+2.1%</span></div><div className="stat-value">31.1%</div><div className="stat-footer">Compared with previous period</div></div><div className="stat-card compact"><div className="stat-header"><span>Transactions</span></div><div className="stat-value">473</div><div className="stat-footer">Across all payment methods</div></div><div className="stat-card compact"><div className="stat-header"><span>Outstanding</span><span className="trend down">Review</span></div><div className="stat-value">KES 100K</div><div className="stat-footer">Customer balances due</div></div></div>

      <div className="panel report-console"><div className="report-tabs" role="tablist" aria-label="Report types">{reportTabs.map((tab) => <button key={tab.id} className={`report-tab ${activeTab === tab.id ? 'active' : ''}`} type="button" onClick={() => { setActiveTab(tab.id); setSearch(''); }} role="tab" aria-selected={activeTab === tab.id}>{tab.label}</button>)}</div><div className="report-console-heading"><div><p className="eyebrow">{reportTabs.find((tab) => tab.id === activeTab)?.label}</p><h3>Detailed analysis</h3></div><span className="muted-count">{rows.length} rows</span></div><div className="report-chart"><div className="report-chart-bars">{[42, 64, 52, 78, 68, 88, 74].map((height, index) => <div className="report-bar-group" key={index}><span className="report-bar" style={{ height: `${height}%` }} /><small>{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}</small></div>)}</div></div><div className="table-shell report-table"><table><thead><tr>{headings[activeTab].map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div>{notice && <div className="pos-notice" role="status">{notice}</div>}</div>
    </div>
  );
}
