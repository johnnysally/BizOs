import { useMemo, useState } from 'react';

type ExpenseStatus = 'Approved' | 'Pending' | 'Rejected' | 'Processed';
type Expense = { id: number; category: string; reference: string; vendor: string; branch: string; amount: number; date: string; status: ExpenseStatus; recurring: boolean; receipt: boolean };

const initialExpenses: Expense[] = [
  { id: 1, category: 'Rent', reference: 'EXP-2245', vendor: 'Nairobi Properties', branch: 'Main Branch', amount: 140000, date: '2026-09-01', status: 'Approved', recurring: true, receipt: true },
  { id: 2, category: 'Salary', reference: 'PAY-981', vendor: 'Payroll', branch: 'Main Branch', amount: 214000, date: '2026-09-05', status: 'Processed', recurring: true, receipt: true },
  { id: 3, category: 'Electricity', reference: 'ELC-104', vendor: 'Kenya Power', branch: 'Industrial Area', amount: 18700, date: '2026-09-18', status: 'Pending', recurring: false, receipt: true },
  { id: 4, category: 'Transport', reference: 'TRN-088', vendor: 'Fast Lane Logistics', branch: 'Main Branch', amount: 12400, date: '2026-09-19', status: 'Approved', recurring: false, receipt: false },
  { id: 5, category: 'Supplies', reference: 'SUP-781', vendor: 'Office Mart', branch: 'Industrial Area', amount: 8600, date: '2026-09-20', status: 'Rejected', recurring: false, receipt: true },
];

const money = (amount: number) => `KES ${amount.toLocaleString('en-KE')}`;
const categories = ['All categories', 'Rent', 'Salary', 'Electricity', 'Transport', 'Supplies', 'Marketing', 'Other'];

export function Expenses() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [category, setCategory] = useState('All categories');
  const [status, setStatus] = useState('All statuses');
  const [branch, setBranch] = useState('All branches');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showRecurring, setShowRecurring] = useState(false);
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ category: 'Supplies', vendor: '', amount: '', branch: 'Main Branch', date: '2026-09-22', recurring: false, receipt: false });

  const filteredExpenses = useMemo(() => expenses.filter((expense) => {
    const matchesCategory = category === 'All categories' || expense.category === category;
    const matchesStatus = status === 'All statuses' || expense.status === status;
    const matchesBranch = branch === 'All branches' || expense.branch === branch;
    const matchesSearch = `${expense.reference} ${expense.vendor} ${expense.category}`.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesStatus && matchesBranch && matchesSearch;
  }), [branch, category, expenses, search, status]);

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pending = expenses.filter((expense) => expense.status === 'Pending').reduce((sum, expense) => sum + expense.amount, 0);
  const recurringTotal = expenses.filter((expense) => expense.recurring).reduce((sum, expense) => sum + expense.amount, 0);

  const updateStatus = (id: number, nextStatus: ExpenseStatus) => {
    setExpenses((current) => current.map((expense) => expense.id === id ? { ...expense, status: nextStatus } : expense));
    setNotice(`Expense ${nextStatus.toLowerCase()}`);
  };

  const addExpense = () => {
    const amount = Number(form.amount);
    if (!form.vendor.trim() || !Number.isFinite(amount) || amount <= 0) return;
    const nextId = Math.max(...expenses.map((expense) => expense.id)) + 1;
    setExpenses((current) => [{ id: nextId, category: form.category, reference: `EXP-${2245 + nextId}`, vendor: form.vendor, branch: form.branch, amount, date: form.date, status: 'Pending', recurring: form.recurring, receipt: form.receipt }, ...current]);
    setForm({ category: 'Supplies', vendor: '', amount: '', branch: 'Main Branch', date: '2026-09-22', recurring: false, receipt: false });
    setShowForm(false);
    setNotice('Expense submitted for approval');
  };

  const exportExpenses = () => {
    const csv = [['Reference', 'Category', 'Vendor', 'Branch', 'Amount', 'Date', 'Status'], ...filteredExpenses.map((expense) => [expense.reference, expense.category, expense.vendor, expense.branch, String(expense.amount), expense.date, expense.status])].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a'); link.href = url; link.download = 'bizos-expenses.csv'; link.click(); URL.revokeObjectURL(url);
    setNotice('Expense report exported');
  };

  return (
    <div className="expenses-workspace">
      <div className="panel expenses-header"><div><p className="eyebrow">Finance operations</p><h3>Expenses</h3><p className="panel-subtitle">Track operating costs, approvals, recurring commitments, and supporting receipts.</p></div><div className="expenses-header-actions"><button className="secondary-button small" type="button" onClick={exportExpenses}>Export CSV</button><button className="primary-button small" type="button" onClick={() => setShowForm((current) => !current)}>{showForm ? 'Close form' : 'Record expense'}</button></div></div>
      <div className="expense-kpis"><div className="stat-card compact"><div className="stat-header"><span>Total expenses</span><span className="trend down">This month</span></div><div className="stat-value">{money(total)}</div><div className="stat-footer">{expenses.length} recorded entries</div></div><div className="stat-card compact"><div className="stat-header"><span>Pending approval</span></div><div className="stat-value">{money(pending)}</div><div className="stat-footer">Needs manager review</div></div><div className="stat-card compact"><div className="stat-header"><span>Recurring costs</span></div><div className="stat-value">{money(recurringTotal)}</div><div className="stat-footer">Monthly commitments</div></div><div className="stat-card compact"><div className="stat-header"><span>Receipts attached</span></div><div className="stat-value">{expenses.filter((expense) => expense.receipt).length}/{expenses.length}</div><div className="stat-footer">Documentation coverage</div></div></div>

      {showForm && <div className="panel expense-form-panel"><div className="settings-section-header"><div><p className="eyebrow">New expense</p><h3>Record an operating cost</h3><p>New expenses enter the approval queue automatically.</p></div></div><div className="settings-form-grid"><label className="field"><span>Category</span><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.slice(1).map((item) => <option key={item}>{item}</option>)}</select></label><label className="field"><span>Vendor or payee</span><input value={form.vendor} onChange={(event) => setForm({ ...form, vendor: event.target.value })} placeholder="e.g. Kenya Power" /></label><label className="field"><span>Amount (KES)</span><input type="number" min="0" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="0" /></label><label className="field"><span>Branch</span><select value={form.branch} onChange={(event) => setForm({ ...form, branch: event.target.value })}><option>Main Branch</option><option>Industrial Area</option></select></label><label className="field"><span>Date</span><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label></div><div className="expense-form-options"><label className="check-setting"><input type="checkbox" checked={form.recurring} onChange={() => setForm({ ...form, recurring: !form.recurring })} /><span>Recurring expense</span></label><label className="check-setting"><input type="checkbox" checked={form.receipt} onChange={() => setForm({ ...form, receipt: !form.receipt })} /><span>Receipt attached</span></label><button className="primary-button small" type="button" onClick={addExpense}>Submit expense</button></div></div>}

      <div className="panel"><div className="expenses-tabs"><button className={!showRecurring ? 'active' : ''} type="button" onClick={() => setShowRecurring(false)}>All expenses</button><button className={showRecurring ? 'active' : ''} type="button" onClick={() => setShowRecurring(true)}>Recurring commitments</button></div><div className="expense-toolbar"><label className="report-search"><span>Search expenses</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search vendor, reference..." /></label><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Expense category">{categories.map((item) => <option key={item}>{item}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Expense status"><option>All statuses</option><option>Pending</option><option>Approved</option><option>Processed</option><option>Rejected</option></select><select value={branch} onChange={(event) => setBranch(event.target.value)} aria-label="Expense branch"><option>All branches</option><option>Main Branch</option><option>Industrial Area</option></select></div><div className="table-shell expense-table"><table><thead><tr><th>Expense</th><th>Vendor</th><th>Branch</th><th>Date</th><th>Amount</th><th>Receipt</th><th>Status</th><th>Action</th></tr></thead><tbody>{filteredExpenses.filter((expense) => !showRecurring || expense.recurring).map((expense) => <tr key={expense.id}><td><strong>{expense.category}</strong><small className="table-secondary">{expense.reference}</small></td><td>{expense.vendor}</td><td>{expense.branch}</td><td>{expense.date}</td><td><strong>{money(expense.amount)}</strong></td><td><span className={`status-badge ${expense.receipt ? 'success' : 'warning'}`}>{expense.receipt ? 'Attached' : 'Missing'}</span></td><td><span className={`status-badge ${expense.status === 'Approved' || expense.status === 'Processed' ? 'success' : expense.status === 'Pending' ? 'warning' : 'danger'}`}>{expense.status}</span></td><td>{expense.status === 'Pending' ? <div className="expense-actions"><button className="meta-link" type="button" onClick={() => updateStatus(expense.id, 'Approved')}>Approve</button><button className="meta-link danger-link" type="button" onClick={() => updateStatus(expense.id, 'Rejected')}>Reject</button></div> : <span className="muted-count">Reviewed</span>}</td></tr>)}</tbody></table></div>{notice && <div className="pos-notice" role="status">{notice}</div>}</div>
    </div>
  );
}
