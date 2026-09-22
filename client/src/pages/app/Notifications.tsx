import { useMemo, useState } from 'react';

type AlertType = 'warning' | 'danger' | 'success' | 'info';
type AlertFilter = 'all' | 'unread' | AlertType;

type Alert = {
  id: number;
  title: string;
  detail: string;
  type: AlertType;
  source: string;
  time: string;
  unread: boolean;
  snoozed: boolean;
};

const initialAlerts: Alert[] = [
  { id: 1, title: 'Low stock alert', detail: '20A MCB is down to 7 units. Reorder recommended.', type: 'warning', source: 'Inventory', time: '8 minutes ago', unread: true, snoozed: false },
  { id: 2, title: 'Credit overdue', detail: 'Sunset Homes invoice is 12 days overdue.', type: 'danger', source: 'Receivables', time: '24 minutes ago', unread: true, snoozed: false },
  { id: 3, title: 'Purchase received', detail: 'Hydra Electric delivery arrived at Main Branch.', type: 'success', source: 'Purchasing', time: '1 hour ago', unread: false, snoozed: false },
  { id: 4, title: 'System sync', detail: 'POS terminals synced successfully 3 minutes ago.', type: 'info', source: 'System', time: '3 hours ago', unread: false, snoozed: false },
  { id: 5, title: 'Daily sales summary', detail: 'Revenue reached KES 184,250, up 12.4% from yesterday.', type: 'success', source: 'Sales', time: 'Yesterday', unread: false, snoozed: false },
  { id: 6, title: 'New team invitation', detail: 'Mary Muthoni accepted the Cashier invitation.', type: 'info', source: 'Team', time: 'Yesterday', unread: true, snoozed: false },
];

const typeLabels: Array<{ id: AlertFilter; label: string }> = [
  { id: 'all', label: 'All alerts' },
  { id: 'unread', label: 'Unread' },
  { id: 'danger', label: 'Critical' },
  { id: 'warning', label: 'Warnings' },
  { id: 'success', label: 'Updates' },
];

export function Notifications() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState<AlertFilter>('all');
  const [search, setSearch] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [notice, setNotice] = useState('');
  const [preferences, setPreferences] = useState({ stock: true, credit: true, sales: true, team: true, email: false, push: true });

  const unreadCount = alerts.filter((alert) => alert.unread && !alert.snoozed).length;
  const visibleAlerts = useMemo(() => alerts.filter((alert) => {
    if (alert.snoozed) return false;
    const matchesFilter = filter === 'all' || (filter === 'unread' ? alert.unread : alert.type === filter);
    const matchesSearch = `${alert.title} ${alert.detail} ${alert.source}`.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  }), [alerts, filter, search]);

  const markRead = (id: number) => setAlerts((current) => current.map((alert) => alert.id === id ? { ...alert, unread: false } : alert));
  const archive = (id: number) => setAlerts((current) => current.filter((alert) => alert.id !== id));
  const snooze = (id: number) => { setAlerts((current) => current.map((alert) => alert.id === id ? { ...alert, snoozed: true } : alert)); setNotice('Alert snoozed for later'); };
  const markAllRead = () => { setAlerts((current) => current.map((alert) => ({ ...alert, unread: false }))); setNotice('All alerts marked as read'); };
  const clearRead = () => { setAlerts((current) => current.filter((alert) => alert.unread)); setNotice('Read alerts cleared'); };
  const togglePreference = (key: keyof typeof preferences) => setPreferences((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div className="alerts-workspace">
      <div className="panel alerts-header">
        <div><p className="eyebrow">Operations center</p><h3>Alerts & notifications</h3><p className="panel-subtitle">Triage important events across sales, inventory, finance, and your team.</p></div>
        <div className="alerts-header-actions"><span className="alert-count"><strong>{unreadCount}</strong> unread</span><button className="secondary-button small" type="button" onClick={() => setShowPreferences((current) => !current)}>{showPreferences ? 'Hide preferences' : 'Alert preferences'}</button></div>
      </div>

      {showPreferences && <div className="panel alert-preferences"><div><p className="eyebrow">Notification rules</p><h3>Choose what reaches you</h3></div><div className="preference-grid">{[['stock', 'Stock alerts', 'Low-stock and out-of-stock warnings'], ['credit', 'Credit alerts', 'Overdue balances and collections'], ['sales', 'Sales summaries', 'Daily revenue and payment updates'], ['team', 'Team activity', 'Invitations and staff changes'], ['email', 'Email delivery', 'Send critical alerts by email'], ['push', 'In-app alerts', 'Show alerts in the workspace']].map(([key, label, description]) => <label className="alert-preference" key={key}><span><strong>{label}</strong><small>{description}</small></span><input type="checkbox" checked={preferences[key as keyof typeof preferences]} onChange={() => togglePreference(key as keyof typeof preferences)} /><i /></label>)}</div></div>}

      <div className="alerts-summary"><div className="alert-summary-card critical"><strong>{alerts.filter((alert) => alert.type === 'danger').length}</strong><span>Critical issues</span></div><div className="alert-summary-card warning"><strong>{alerts.filter((alert) => alert.type === 'warning').length}</strong><span>Warnings</span></div><div className="alert-summary-card neutral"><strong>{alerts.filter((alert) => alert.unread).length}</strong><span>Unread alerts</span></div><div className="alert-summary-card success"><strong>{alerts.filter((alert) => alert.type === 'success').length}</strong><span>Positive updates</span></div></div>

      <div className="panel alerts-panel">
        <div className="alerts-toolbar"><div className="alert-tabs" role="tablist" aria-label="Alert filters">{typeLabels.map((item) => <button key={item.id} className={`alert-tab ${filter === item.id ? 'active' : ''}`} type="button" onClick={() => setFilter(item.id)} role="tab" aria-selected={filter === item.id}>{item.label}</button>)}</div><label className="alert-search"><span>Search alerts</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notifications..." /></label></div><div className="bulk-actions"><span>{visibleAlerts.length} showing</span><div><button className="ghost-button small" type="button" onClick={markAllRead}>Mark all read</button><button className="ghost-button small" type="button" onClick={clearRead}>Clear read</button></div></div>
        <div className="alert-list">{visibleAlerts.length === 0 ? <div className="alerts-empty"><strong>No alerts match this view</strong><span>Try another filter or search term.</span></div> : visibleAlerts.map((alert) => <article className={`alert-item ${alert.type} ${alert.unread ? 'unread' : ''}`} key={alert.id}><div className="alert-icon">{alert.type === 'danger' ? '!' : alert.type === 'warning' ? '!' : alert.type === 'success' ? '✓' : 'i'}</div><div className="alert-content"><div className="alert-item-heading"><div><strong>{alert.title}</strong><span className="alert-source">{alert.source} · {alert.time}</span></div>{alert.unread && <span className="unread-dot" />}</div><p>{alert.detail}</p><div className="alert-actions"><button className="meta-link" type="button" onClick={() => markRead(alert.id)}>{alert.unread ? 'Mark read' : 'Read'}</button><button className="meta-link" type="button" onClick={() => snooze(alert.id)}>Snooze</button><button className="meta-link" type="button" onClick={() => archive(alert.id)}>Archive</button></div></div></article>)}</div>
        {notice && <div className="pos-notice" role="status">{notice}</div>}
      </div>
    </div>
  );
}
