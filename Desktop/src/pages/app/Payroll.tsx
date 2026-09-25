import { useMemo, useState } from 'react';

type PayrollStatus = 'Paid' | 'Scheduled' | 'Draft';
type PayrollEntry = { id: number; employee: string; department: string; gross: number; deductions: number; net: number; status: PayrollStatus; branch: string };
type PayrollTab = 'salary' | 'attendance' | 'leave' | 'statutory' | 'payslips';

const initialPayroll: PayrollEntry[] = [
  { id: 1, employee: 'John Mwangi', department: 'Management', gross: 76000, deductions: 11400, net: 64600, status: 'Paid', branch: 'Main Branch' },
  { id: 2, employee: 'Alice Wambui', department: 'Sales', gross: 42000, deductions: 6300, net: 35700, status: 'Scheduled', branch: 'Main Branch' },
  { id: 3, employee: 'Peter Karanja', department: 'Operations', gross: 39000, deductions: 5850, net: 33150, status: 'Paid', branch: 'Industrial Area' },
  { id: 4, employee: 'Mary Muthoni', department: 'Sales', gross: 36000, deductions: 5400, net: 30600, status: 'Draft', branch: 'Main Branch' },
];

const money = (amount: number) => `KES ${amount.toLocaleString('en-KE')}`;
const attendance = [
  { employee: 'John Mwangi', days: '22 / 22', overtime: '4h', status: 'Complete' },
  { employee: 'Alice Wambui', days: '21 / 22', overtime: '8h', status: 'Review' },
  { employee: 'Peter Karanja', days: '20 / 22', overtime: '0h', status: 'Review' },
  { employee: 'Mary Muthoni', days: '22 / 22', overtime: '2h', status: 'Complete' },
];
const leaveRequests = [
  { employee: 'Alice Wambui', type: 'Annual leave', dates: '24 - 26 Sep', days: 3, status: 'Pending' },
  { employee: 'Peter Karanja', type: 'Sick leave', dates: '18 Sep', days: 1, status: 'Approved' },
  { employee: 'Mary Muthoni', type: 'Annual leave', dates: '30 Sep - 2 Oct', days: 3, status: 'Pending' },
];
const statutory = [
  { name: 'PAYE', basis: 'Income tax', amount: 28650, due: '09 Oct 2026', status: 'Ready' },
  { name: 'NSSF', basis: 'Social security', amount: 7200, due: '15 Oct 2026', status: 'Ready' },
  { name: 'SHIF', basis: 'Health insurance', amount: 5400, due: '15 Oct 2026', status: 'Pending filing' },
];

export function Payroll() {
  const [entries, setEntries] = useState(initialPayroll);
  const [period, setPeriod] = useState('September 2026');
  const [department, setDepartment] = useState('All departments');
  const [status, setStatus] = useState('All statuses');
  const [showRunForm, setShowRunForm] = useState(false);
  const [notice, setNotice] = useState('');
  const [activeTab, setActiveTab] = useState<PayrollTab>('salary');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const departments = ['All departments', ...new Set(entries.map((entry) => entry.department))];
  const visibleEntries = useMemo(() => entries.filter((entry) => (department === 'All departments' || entry.department === department) && (status === 'All statuses' || entry.status === status) && entry.employee.toLowerCase().includes(employeeSearch.toLowerCase())), [department, employeeSearch, entries, status]);
  const grossTotal = entries.reduce((sum, entry) => sum + entry.gross, 0);
  const netTotal = entries.reduce((sum, entry) => sum + entry.net, 0);
  const pendingCount = entries.filter((entry) => entry.status !== 'Paid').length;

  const runPayroll = () => { setEntries((current) => current.map((entry) => entry.status === 'Draft' ? { ...entry, status: 'Scheduled' } : entry)); setShowRunForm(false); setNotice(`${period} payroll scheduled for approval`); };
  const markPaid = (id: number) => { setEntries((current) => current.map((entry) => entry.id === id ? { ...entry, status: 'Paid' } : entry)); setNotice('Payroll payment marked as paid'); };
  const approveAll = () => { setEntries((current) => current.map((entry) => entry.status === 'Scheduled' ? { ...entry, status: 'Paid' } : entry)); setNotice('All scheduled payroll entries approved'); };
  const exportPayroll = () => { const csv = [['Employee', 'Department', 'Branch', 'Gross', 'Deductions', 'Net pay', 'Status'], ...entries.map((entry) => [entry.employee, entry.department, entry.branch, String(entry.gross), String(entry.deductions), String(entry.net), entry.status])].map((row) => row.join(',')).join('\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const link = document.createElement('a'); link.href = url; link.download = `payroll-${period}.csv`; link.click(); URL.revokeObjectURL(url); setNotice('Payroll register exported'); };

  return (
    <div className="payroll-workspace">
      <div className="panel payroll-header"><div><p className="eyebrow">People operations</p><h3>Payroll</h3><p className="panel-subtitle">Prepare salaries, review deductions, and track payment status by period and branch.</p></div><button className="primary-button small" type="button" onClick={() => setShowRunForm((current) => !current)}>{showRunForm ? 'Close' : 'Run payroll'}</button></div>
      <div className="payroll-kpis"><div className="stat-card compact"><div className="stat-header"><span>Gross payroll</span></div><div className="stat-value">{money(grossTotal)}</div><div className="stat-footer">{period}</div></div><div className="stat-card compact"><div className="stat-header"><span>Net pay</span><span className="trend up">Ready</span></div><div className="stat-value">{money(netTotal)}</div><div className="stat-footer">After statutory deductions</div></div><div className="stat-card compact"><div className="stat-header"><span>Employees</span></div><div className="stat-value">{entries.length}</div><div className="stat-footer">Across 2 branches</div></div><div className="stat-card compact"><div className="stat-header"><span>Needs action</span><span className="trend down">Review</span></div><div className="stat-value">{pendingCount}</div><div className="stat-footer">Draft or scheduled</div></div></div>
      {showRunForm && <div className="panel payroll-run-panel"><div><p className="eyebrow">Payroll run</p><h3>Prepare a pay period</h3><p className="panel-subtitle">Review the period and schedule all draft entries for approval.</p></div><div className="payroll-run-controls"><label className="field"><span>Pay period</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option>September 2026</option><option>October 2026</option><option>November 2026</option></select></label><label className="field"><span>Pay date</span><input type="date" defaultValue="2026-09-30" /></label><button className="primary-button small" type="button" onClick={runPayroll}>Schedule run</button></div></div>}
      <div className="panel payroll-console"><div className="payroll-tabs" role="tablist">{([['salary', 'Salary register'], ['attendance', 'Attendance'], ['leave', 'Leave'], ['statutory', 'Statutory'], ['payslips', 'Payslips']] as Array<[PayrollTab, string]>).map(([id, label]) => <button key={id} className={activeTab === id ? 'active' : ''} type="button" onClick={() => setActiveTab(id)} role="tab" aria-selected={activeTab === id}>{label}</button>)}</div>
        {activeTab === 'salary' && <><div className="payroll-toolbar"><div><p className="eyebrow">Salary register</p><h3>{period} payroll</h3></div><div className="payroll-filters"><input value={employeeSearch} onChange={(event) => setEmployeeSearch(event.target.value)} placeholder="Search employee" aria-label="Search employee" /><select value={department} onChange={(event) => setDepartment(event.target.value)} aria-label="Department">{departments.map((item) => <option key={item}>{item}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Payroll status"><option>All statuses</option><option>Paid</option><option>Scheduled</option><option>Draft</option></select><button className="secondary-button small" type="button" onClick={exportPayroll}>Export</button><button className="secondary-button small" type="button" onClick={approveAll}>Approve all</button></div></div><div className="table-shell payroll-table"><table><thead><tr><th>Employee</th><th>Department</th><th>Branch</th><th>Gross</th><th>Deductions</th><th>Net pay</th><th>Status</th><th>Action</th></tr></thead><tbody>{visibleEntries.map((entry) => <tr key={entry.id}><td><strong>{entry.employee}</strong></td><td>{entry.department}</td><td>{entry.branch}</td><td>{money(entry.gross)}</td><td>{money(entry.deductions)}</td><td><strong>{money(entry.net)}</strong></td><td><span className={`status-badge ${entry.status === 'Paid' ? 'success' : entry.status === 'Scheduled' ? 'warning' : 'neutral'}`}>{entry.status}</span></td><td>{entry.status === 'Scheduled' ? <button className="meta-link" type="button" onClick={() => markPaid(entry.id)}>Mark paid</button> : <span className="muted-count">Reviewed</span>}</td></tr>)}</tbody></table></div></>}
        {activeTab === 'attendance' && <div className="payroll-tab-panel"><div className="panel-header"><div><p className="eyebrow">Time tracking</p><h3>Attendance & overtime</h3></div><span className="status-badge warning">2 need review</span></div><div className="table-shell"><table><thead><tr><th>Employee</th><th>Days present</th><th>Overtime</th><th>Status</th></tr></thead><tbody>{attendance.map((entry) => <tr key={entry.employee}><td>{entry.employee}</td><td>{entry.days}</td><td>{entry.overtime}</td><td><span className={`status-badge ${entry.status === 'Complete' ? 'success' : 'warning'}`}>{entry.status}</span></td></tr>)}</tbody></table></div></div>}
        {activeTab === 'leave' && <div className="payroll-tab-panel"><div className="panel-header"><div><p className="eyebrow">Time off</p><h3>Leave requests</h3></div><button className="primary-button small" type="button" onClick={() => setNotice('Leave request form opened')}>Add leave</button></div><div className="table-shell"><table><thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Days</th><th>Status</th></tr></thead><tbody>{leaveRequests.map((request) => <tr key={`${request.employee}-${request.dates}`}><td>{request.employee}</td><td>{request.type}</td><td>{request.dates}</td><td>{request.days}</td><td><span className={`status-badge ${request.status === 'Approved' ? 'success' : 'warning'}`}>{request.status}</span></td></tr>)}</tbody></table></div></div>}
        {activeTab === 'statutory' && <div className="payroll-tab-panel"><div className="panel-header"><div><p className="eyebrow">Compliance</p><h3>Statutory deductions</h3></div><button className="secondary-button small" type="button" onClick={() => setNotice('Statutory schedule exported')}>Export schedule</button></div><div className="table-shell"><table><thead><tr><th>Deduction</th><th>Basis</th><th>Amount</th><th>Due date</th><th>Status</th></tr></thead><tbody>{statutory.map((item) => <tr key={item.name}><td><strong>{item.name}</strong></td><td>{item.basis}</td><td>{money(item.amount)}</td><td>{item.due}</td><td><span className={`status-badge ${item.status === 'Ready' ? 'success' : 'warning'}`}>{item.status}</span></td></tr>)}</tbody></table></div></div>}
        {activeTab === 'payslips' && <div className="payroll-tab-panel"><div className="panel-header"><div><p className="eyebrow">Employee documents</p><h3>Payslips</h3></div><button className="secondary-button small" type="button" onClick={() => setNotice('Payslips prepared for download')}>Download all</button></div><div className="payslip-list">{entries.map((entry) => <div className="payslip-row" key={entry.id}><div><strong>{entry.employee}</strong><span>{period} · {entry.status}</span></div><strong>{money(entry.net)}</strong><button className="meta-link" type="button" onClick={() => setNotice(`${entry.employee} payslip ready`)}>View payslip</button></div>)}</div></div>}
        {notice && <div className="pos-notice" role="status">{notice}</div>}
      </div>
    </div>
  );
}
