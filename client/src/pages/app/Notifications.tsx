import { useMemo, useRef, useState } from 'react';
import { useEffect } from 'react';
import { insightApi } from '@/api/insights';
import { AlertTriangle, Archive, Bell, Check, CheckCircle2, Clock3, Info, Search, SlidersHorizontal, X } from 'lucide-react';

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

const initialAlerts: Alert[] = [];

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
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (event.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  useEffect(() => {
    let active = true;
    insightApi.stockAlerts().then((stockAlerts) => {
      if (!active) return;
      const inventoryAlerts: Alert[] = stockAlerts.map((alert) => ({
        id: Number.parseInt(alert._id.slice(-8), 16) || Date.now(),
        title: alert.stock === 0 ? 'Out of stock' : 'Low stock alert',
        detail: `${alert.name} has ${alert.stock} units remaining. Reorder recommended.`,
        type: alert.stock === 0 ? 'danger' : 'warning',
        source: 'Inventory',
        time: 'Just now',
        unread: true,
        snoozed: false,
      }));
      setAlerts((current) => [
        ...inventoryAlerts,
        ...current.filter((alert) => alert.source !== 'Inventory'),
      ]);
    }).catch(() => {
      // Other alert sources remain available when inventory alerts cannot be loaded.
    });

    return () => {
      active = false;
    };
  }, []);

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
    <div className="min-h-full bg-bg px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-300">
              <Bell size={14} />
              Operations center
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">Alerts & notifications</h1>
            <p className="mt-1.5 max-w-2xl text-sm text-muted">Triage important events across sales, inventory, finance, and your team.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              {unreadCount} unread
            </span>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-xs font-semibold text-fg transition hover:bg-elevated"
              type="button"
              onClick={() => setShowPreferences((current) => !current)}
            >
              <SlidersHorizontal size={14} />
              {showPreferences ? 'Hide preferences' : 'Preferences'}
            </button>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Critical issues', value: alerts.filter((alert) => alert.type === 'danger').length, icon: AlertTriangle, tone: 'text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-300' },
            { label: 'Warnings', value: alerts.filter((alert) => alert.type === 'warning').length, icon: AlertTriangle, tone: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-300' },
            { label: 'Unread alerts', value: alerts.filter((alert) => alert.unread).length, icon: Bell, tone: 'text-brand-600 bg-brand-50 dark:bg-brand-500/10 dark:text-brand-300' },
            { label: 'Positive updates', value: alerts.filter((alert) => alert.type === 'success').length, icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-300' },
          ].map((summary) => {
            const Icon = summary.icon;
            return (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4" key={summary.label}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${summary.tone}`}><Icon size={17} /></span>
                <span><strong className="block text-xl font-semibold text-fg">{summary.value}</strong><span className="text-xs text-muted">{summary.label}</span></span>
              </div>
            );
          })}
        </div>

        {showPreferences && (
          <section className="rounded-lg border border-border bg-surface p-4 sm:p-5">
            <div className="mb-4"><h2 className="text-sm font-semibold text-fg">Notification preferences</h2><p className="mt-1 text-xs text-muted">Choose the activity that should appear in this workspace.</p></div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[['stock', 'Stock alerts', 'Low-stock and out-of-stock warnings'], ['credit', 'Credit alerts', 'Overdue balances and collections'], ['sales', 'Sales summaries', 'Daily revenue and payment updates'], ['team', 'Team activity', 'Invitations and staff changes'], ['email', 'Email delivery', 'Send critical alerts by email'], ['push', 'In-app alerts', 'Show alerts in the workspace']].map(([key, label, description]) => (
                <label className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-border p-3 transition hover:bg-bg" key={key}>
                  <span><strong className="block text-xs font-semibold text-fg">{label}</strong><small className="mt-0.5 block text-[11px] text-muted">{description}</small></span>
                  <input className="h-4 w-4 accent-brand-600" type="checkbox" checked={preferences[key as keyof typeof preferences]} onChange={() => togglePreference(key as keyof typeof preferences)} />
                </label>
              ))}
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="border-b border-border p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-1 overflow-x-auto pb-1" role="tablist" aria-label="Alert filters">
                {typeLabels.map((item) => (
                  <button key={item.id} className={`shrink-0 rounded-md px-3 py-2 text-xs font-semibold transition ${filter === item.id ? 'bg-brand-600 text-white' : 'text-muted hover:bg-bg hover:text-fg'}`} type="button" onClick={() => setFilter(item.id)} role="tab" aria-selected={filter === item.id}>{item.label}</button>
                ))}
              </div>
              <div className="w-full lg:max-w-sm">
                <label className="relative block">
                  <span className="sr-only">Search alerts</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
                  <input
                    ref={searchInputRef}
                    className="w-full rounded-md border border-border bg-bg py-2 pl-9 pr-20 text-sm text-fg outline-none transition placeholder:text-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search title, source or detail..."
                  />
                  <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-muted">/</span>
                  {search && (
                    <button className="absolute right-8 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted transition hover:bg-elevated hover:text-fg" type="button" onClick={() => setSearch('')} aria-label="Clear search">
                      <X size={14} />
                    </button>
                  )}
                </label>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                  <span className="inline-flex items-center gap-1"><Search size={11} /> Searching all alert details</span>
                  {search && <span className="font-medium text-brand-700 dark:text-brand-300">Filtering '{search}'</span>}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted">
              <span>{visibleAlerts.length} showing</span>
              <div className="flex items-center gap-3">
                <button className="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300" type="button" onClick={markAllRead}>Mark all read</button>
                <button className="font-semibold text-muted hover:text-fg" type="button" onClick={clearRead}>Clear read</button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-border">
            {visibleAlerts.length === 0 ? (
              <div className="px-5 py-16 text-center"><Info className="mx-auto text-muted" size={24} /><strong className="mt-3 block text-sm text-fg">No alerts match this view</strong><span className="mt-1 block text-xs text-muted">Try another filter or search term.</span></div>
            ) : visibleAlerts.map((alert) => {
              const Icon = alert.type === 'danger' || alert.type === 'warning' ? AlertTriangle : alert.type === 'success' ? CheckCircle2 : Info;
              const tone = alert.type === 'danger' ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300' : alert.type === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300' : alert.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300';
              return (
                <article className={`flex gap-3 px-4 py-4 transition hover:bg-bg sm:gap-4 sm:px-5 ${alert.unread ? 'border-l-2 border-l-brand-600 bg-brand-50/30 dark:bg-brand-500/[0.03]' : ''}`} key={alert.id}>
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${tone}`}><Icon size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0"><div className="flex items-center gap-2"><strong className="truncate text-sm font-semibold text-fg">{alert.title}</strong>{alert.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />}</div><span className="mt-1 block text-[11px] text-muted">{alert.source} <span className="px-1">·</span> {alert.time}</span></div>
                      <div className="flex shrink-0 items-center gap-3 text-xs">
                        <button className="inline-flex items-center gap-1 font-semibold text-muted hover:text-fg" type="button" onClick={() => markRead(alert.id)}><Check size={13} />{alert.unread ? 'Mark read' : 'Read'}</button>
                        <button className="inline-flex items-center gap-1 font-semibold text-muted hover:text-fg" type="button" onClick={() => snooze(alert.id)}><Clock3 size={13} />Snooze</button>
                        <button className="inline-flex items-center gap-1 font-semibold text-muted hover:text-fg" type="button" onClick={() => archive(alert.id)}><Archive size={13} />Archive</button>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">{alert.detail}</p>
                  </div>
                </article>
              );
            })}
          </div>
          {notice && <div className="border-t border-border bg-brand-50 px-5 py-3 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300" role="status">{notice}</div>}
        </section>
      </div>
    </div>
  );
}
