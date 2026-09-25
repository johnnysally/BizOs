import { useState } from 'react';

type BillingTab = 'overview' | 'plans' | 'invoices' | 'payment';

const invoices = [
  { id: 'INV-2026-09', date: '2026-09-01', amount: 'KES 18,600', status: 'Paid' },
  { id: 'INV-2026-08', date: '2026-08-01', amount: 'KES 18,600', status: 'Paid' },
  { id: 'INV-2026-07', date: '2026-07-01', amount: 'KES 18,600', status: 'Paid' },
];

export function Subscriptions() {
  const [activeTab, setActiveTab] = useState<BillingTab>('overview');
  const [plan, setPlan] = useState('Growth');
  const [autoRenew, setAutoRenew] = useState(true);
  const [notice, setNotice] = useState('');
  const [payment, setPayment] = useState({ method: 'M-Pesa', account: '•••• 0111' });
  const tabs: Array<{ id: BillingTab; label: string }> = [{ id: 'overview', label: 'Overview' }, { id: 'plans', label: 'Plans & usage' }, { id: 'invoices', label: 'Invoices' }, { id: 'payment', label: 'Payment method' }];
  const changePlan = (nextPlan: string) => { setPlan(nextPlan); setNotice(`${nextPlan} plan selected for review`); };

  return (
    <div className="billing-workspace">
      <div className="panel billing-header"><div><p className="eyebrow">Billing & subscription</p><h3>Manage your plan</h3><p className="panel-subtitle">Review usage, invoices, payment methods, and your next renewal.</p></div><span className="status-badge success">Account in good standing</span></div>
      <div className="panel billing-tabs">{tabs.map((tab) => <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} type="button" onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}</div>
      {activeTab === 'overview' && <><div className="billing-overview-grid"><div className="billing-current-plan"><span className="plan-tag">Current plan</span><h3>{plan}</h3><strong>KES {plan === 'Scale' ? '39,900' : plan === 'Starter' ? '8,900' : '18,600'}</strong><p>Per month · Renews on 01 October 2026</p><button className="primary-button small" type="button" onClick={() => setActiveTab('plans')}>Manage plan</button></div><div className="billing-usage"><div className="panel-header"><div><p className="eyebrow">Usage</p><h3>Workspace limits</h3></div></div>{[['Team members', '18 / 25', 72], ['Products', '1,268 / 5,000', 25], ['Branches', '2 / 5', 40], ['Monthly transactions', '473 / 2,000', 24]].map(([label, value, percent]) => <div className="usage-row" key={String(label)}><div><span>{label}</span><strong>{value}</strong></div><div className="usage-track"><i style={{ width: `${percent}%` }} /></div></div>)}</div></div><div className="billing-renewal panel"><div><strong>Automatic renewal is on</strong><span>Your card or M-Pesa account will be charged on 01 October 2026.</span></div><button className={`toggle-text ${autoRenew ? 'active' : ''}`} type="button" onClick={() => setAutoRenew((current) => !current)}>{autoRenew ? 'On' : 'Off'}</button></div></>}
  {activeTab === 'plans' && <div className="plan-grid billing-plan-grid">{[['Starter', 'KES 8,900', '1 branch · 5 users · Core POS'], ['Growth', 'KES 18,600', '5 branches · 25 users · Analytics'], ['Scale', 'KES 39,900', 'Unlimited branches · Priority support']].map(([name, price, description]) => <div className={`plan-card ${plan === name ? 'featured' : ''}`} key={name}><span className="plan-tag">{plan === name ? 'Selected plan' : 'Available plan'}</span><h3>{name}</h3><strong>{price}</strong><p>{description}</p><button className={plan === name ? 'secondary-button small' : 'primary-button small'} type="button" onClick={() => changePlan(name)}>{plan === name ? 'Current plan' : 'Choose plan'}</button></div>)}</div>}
  {activeTab === 'invoices' && <div className="panel billing-inner-panel"><div className="panel-header"><div><p className="eyebrow">Billing history</p><h3>Invoices</h3></div><button className="secondary-button small" type="button" onClick={() => setNotice('Invoice archive exported')}>Export archive</button></div><div className="table-shell"><table><thead><tr><th>Invoice</th><th>Date</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{invoices.map((invoice) => <tr key={invoice.id}><td>{invoice.id}</td><td>{invoice.date}</td><td><strong>{invoice.amount}</strong></td><td><span className="status-badge success">{invoice.status}</span></td><td><button className="meta-link" type="button" onClick={() => setNotice(`${invoice.id} download started`)}>Download</button></td></tr>)}</tbody></table></div></div>}
  {activeTab === 'payment' && <div className="panel billing-inner-panel"><div className="panel-header"><div><p className="eyebrow">Payment method</p><h3>How you pay</h3></div><span className="status-badge success">Verified</span></div><div className="payment-method-card"><div className="payment-method-icon">{payment.method === 'M-Pesa' ? 'M' : 'V'}</div><div><strong>{payment.method}</strong><span>{payment.account} · Default payment method</span></div><button className="secondary-button small" type="button" onClick={() => setPayment((current) => current.method === 'M-Pesa' ? { method: 'Visa card', account: '•••• 4242' } : { method: 'M-Pesa', account: '•••• 0111' })}>Change</button></div><div className="settings-form-grid"><label className="field"><span>Billing email</span><input type="email" defaultValue="billing@mwangi-electricals.co.ke" /></label><label className="field"><span>Billing contact</span><input defaultValue="John Mwangi" /></label></div></div>}
  {notice && <div className="pos-notice" role="status">{notice}</div>}
    </div>
  );
}
