import { useMemo, useState } from 'react';

type BranchStatus = 'Online' | 'Syncing' | 'Offline';
type Branch = { id: number; name: string; code: string; manager: string; location: string; sales: number; transactions: number; staff: number; status: BranchStatus; open: boolean; hours: string };

const initialBranches: Branch[] = [
  { id: 1, name: 'Main Branch', code: 'MAIN-01', manager: 'John Mwangi', location: 'Mombasa Road, Nairobi', sales: 184250, transactions: 87, staff: 12, status: 'Online', open: true, hours: '08:00 - 18:00' },
  { id: 2, name: 'Industrial Area', code: 'IND-02', manager: 'Peter Karanja', location: 'Enterprise Road, Nairobi', sales: 84050, transactions: 42, staff: 8, status: 'Syncing', open: true, hours: '08:30 - 17:30' },
  { id: 3, name: 'Westlands Outlet', code: 'WST-03', manager: 'Alice Wambui', location: 'Waiyaki Way, Nairobi', sales: 62800, transactions: 31, staff: 6, status: 'Offline', open: false, hours: '09:00 - 17:00' },
];

const money = (amount: number) => `KES ${amount.toLocaleString('en-KE')}`;

export function Branches() {
  const [branches, setBranches] = useState(initialBranches);
  const [selectedId, setSelectedId] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ name: '', code: '', manager: '', location: '', hours: '08:00 - 18:00' });
  const selectedBranch = branches.find((branch) => branch.id === selectedId) ?? branches[0];
  const filteredBranches = useMemo(() => branches.filter((branch) => (statusFilter === 'All statuses' || branch.status === statusFilter) && `${branch.name} ${branch.code} ${branch.location} ${branch.manager}`.toLowerCase().includes(search.toLowerCase())), [branches, search, statusFilter]);
  const totalSales = branches.reduce((sum, branch) => sum + branch.sales, 0);
  const totalTransactions = branches.reduce((sum, branch) => sum + branch.transactions, 0);

  const toggleBranch = (id: number) => setBranches((current) => current.map((branch) => branch.id === id ? { ...branch, open: !branch.open } : branch));
  const addBranch = () => {
    if (!form.name.trim() || !form.code.trim() || !form.manager.trim()) return;
    const nextId = Math.max(...branches.map((branch) => branch.id)) + 1;
    setBranches((current) => [...current, { id: nextId, name: form.name, code: form.code, manager: form.manager, location: form.location || 'Location pending', sales: 0, transactions: 0, staff: 0, status: 'Offline', open: false, hours: form.hours }]);
    setForm({ name: '', code: '', manager: '', location: '', hours: '08:00 - 18:00' });
    setShowForm(false);
    setNotice('New branch added');
  };
  const switchBranch = () => setNotice(`Workspace switched to ${selectedBranch.name}`);

  return (
    <div className="branches-workspace">
      <div className="panel branches-header"><div><p className="eyebrow">Network operations</p><h3>Branches</h3><p className="panel-subtitle">Manage locations, compare performance, and control branch operations from one workspace.</p></div><button className="primary-button small" type="button" onClick={() => setShowForm((current) => !current)}>{showForm ? 'Close form' : 'Add branch'}</button></div>
      <div className="branch-kpis"><div className="stat-card compact"><div className="stat-header"><span>Total sales</span><span className="trend up">+12.4%</span></div><div className="stat-value">{money(totalSales)}</div><div className="stat-footer">Across all branches</div></div><div className="stat-card compact"><div className="stat-header"><span>Transactions</span></div><div className="stat-value">{totalTransactions}</div><div className="stat-footer">Today</div></div><div className="stat-card compact"><div className="stat-header"><span>Active branches</span></div><div className="stat-value">{branches.filter((branch) => branch.open).length}/{branches.length}</div><div className="stat-footer">Currently trading</div></div><div className="stat-card compact"><div className="stat-header"><span>Team members</span></div><div className="stat-value">{branches.reduce((sum, branch) => sum + branch.staff, 0)}</div><div className="stat-footer">Across locations</div></div></div>
      {showForm && <div className="panel branch-form-panel"><div><p className="eyebrow">New location</p><h3>Add a branch</h3><p className="panel-subtitle">Create a location and assign an accountable manager.</p></div><div className="settings-form-grid"><label className="field"><span>Branch name</span><input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Karen Outlet" /></label><label className="field"><span>Branch code</span><input value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} placeholder="KRN-04" /></label><label className="field"><span>Manager</span><input value={form.manager} onChange={(event) => setForm({ ...form, manager: event.target.value })} placeholder="Assign manager" /></label><label className="field"><span>Location</span><input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Street and city" /></label><label className="field"><span>Operating hours</span><input value={form.hours} onChange={(event) => setForm({ ...form, hours: event.target.value })} /></label></div><button className="primary-button small" type="button" onClick={addBranch}>Create branch</button></div>}
      <div className="branch-layout"><div className="panel"><div className="branch-toolbar"><div><p className="eyebrow">Locations</p><h3>Branch directory</h3></div><div className="branch-filters"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search branches" aria-label="Search branches" /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Branch status"><option>All statuses</option><option>Online</option><option>Syncing</option><option>Offline</option></select></div></div><div className="branch-card-list">{filteredBranches.map((branch) => <button className={`branch-card ${selectedId === branch.id ? 'selected' : ''}`} key={branch.id} type="button" onClick={() => setSelectedId(branch.id)}><div className="branch-card-top"><div><strong>{branch.name}</strong><span>{branch.code} · {branch.location}</span></div><span className={`status-badge ${branch.status === 'Online' ? 'success' : branch.status === 'Syncing' ? 'warning' : 'neutral'}`}>{branch.status}</span></div><div className="branch-card-metrics"><span><strong>{money(branch.sales)}</strong>Sales</span><span><strong>{branch.transactions}</strong>Orders</span><span><strong>{branch.staff}</strong>Staff</span></div><div className="branch-card-footer"><span>{branch.manager}</span><span>{branch.open ? 'Open' : 'Closed'} · {branch.hours}</span></div></button>)}</div></div><aside className="panel branch-detail"><div className="panel-header"><div><p className="eyebrow">Selected location</p><h3>{selectedBranch.name}</h3></div><span className={`status-badge ${selectedBranch.open ? 'success' : 'neutral'}`}>{selectedBranch.open ? 'Open' : 'Closed'}</span></div><p className="branch-detail-location">{selectedBranch.location} · {selectedBranch.code}</p><div className="branch-detail-actions"><button className="primary-button small" type="button" onClick={switchBranch}>Switch workspace</button><button className="secondary-button small" type="button" onClick={() => toggleBranch(selectedBranch.id)}>{selectedBranch.open ? 'Close branch' : 'Open branch'}</button></div><div className="branch-detail-list"><div><span>Branch manager</span><strong>{selectedBranch.manager}</strong></div><div><span>Operating hours</span><strong>{selectedBranch.hours}</strong></div><div><span>Today's sales</span><strong>{money(selectedBranch.sales)}</strong></div><div><span>Transactions</span><strong>{selectedBranch.transactions}</strong></div><div><span>Assigned team</span><strong>{selectedBranch.staff} people</strong></div></div><div className="branch-health"><div><strong>Connection health</strong><span>{selectedBranch.status === 'Offline' ? 'Terminal is offline and needs attention.' : 'All branch terminals are reporting normally.'}</span></div><span className={`status-badge ${selectedBranch.status === 'Offline' ? 'danger' : 'success'}`}>{selectedBranch.status === 'Offline' ? 'Action needed' : 'Healthy'}</span></div></aside></div>
      {notice && <div className="pos-notice" role="status">{notice}</div>}
    </div>
  );
}
