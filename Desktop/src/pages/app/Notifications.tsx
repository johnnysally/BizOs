import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Search,
  RefreshCw,
  Bell,
  Archive,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { classNames } from '@/utils/classNames';
import { useNotifications } from '@/context/NotificationContext';
import {
  notificationApi,
  AppNotification,
  NotificationSeverity,
  NotificationSummary,
} from '@/api/notifications';
import { relativeTime } from '@/utils/date';

const PAGE_SIZE = 30;

type Filter = 'all' | 'unread' | NotificationSeverity;

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'danger', label: 'Critical' },
  { id: 'warning', label: 'Warnings' },
  { id: 'success', label: 'Updates' },
  { id: 'info', label: 'Info' },
];

const SEVERITY_ICON: Record<
  NotificationSeverity,
  typeof AlertCircle
> = {
  danger: AlertCircle,
  warning: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

const SEVERITY_VARIANT: Record<
  NotificationSeverity,
  'danger' | 'warning' | 'success' | 'info'
> = {
  danger: 'danger',
  warning: 'warning',
  success: 'success',
  info: 'info',
};

const SEVERITY_ROW: Record<NotificationSeverity, string> = {
  danger:
    'border-l-red-500 bg-red-50/40 dark:bg-red-500/5',
  warning:
    'border-l-amber-500 bg-amber-50/40 dark:bg-amber-500/5',
  success:
    'border-l-green-500 bg-green-50/40 dark:bg-green-500/5',
  info:
    'border-l-blue-500 bg-blue-50/40 dark:bg-blue-500/5',
};

export function Notifications() {
  const { toast } = useNotifications();

  const [items, setItems] = useState<AppNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await notificationApi.list({
        page,
        limit: PAGE_SIZE,
        filter,
        search: debouncedSearch || undefined,
      });
      setItems(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Could not load alerts',
      });
    } finally {
      setLoading(false);
    }
  }, [page, filter, debouncedSearch, toast]);

  const loadSummary = useCallback(async () => {
    try {
      const s = await notificationApi.summary();
      setSummary(s);
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const refresh = () => {
    load();
    loadSummary();
  };

  const markRead = async (id: string) => {
    setBusy(id);
    try {
      await notificationApi.markRead(id);
      setItems((cur) =>
        cur.map((n) =>
          n._id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
      loadSummary();
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Mark read failed',
      });
    } finally {
      setBusy(null);
    }
  };

  const markAllRead = async () => {
    setBusy('all');
    try {
      const r = await notificationApi.markAllRead();
      setItems((cur) =>
        cur.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      );
      loadSummary();
      toast({
        type: 'success',
        message: `${r.modified} alert${r.modified === 1 ? '' : 's'} marked read`,
      });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Failed',
      });
    } finally {
      setBusy(null);
    }
  };

  const snooze = async (id: string) => {
    setBusy(id);
    try {
      await notificationApi.snooze(id);
      setItems((cur) => cur.filter((n) => n._id !== id));
      loadSummary();
      toast({ type: 'success', message: 'Snoozed' });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Snooze failed',
      });
    } finally {
      setBusy(null);
    }
  };

  const archive = async (id: string) => {
    setBusy(id);
    try {
      await notificationApi.archive(id);
      setItems((cur) => cur.filter((n) => n._id !== id));
      loadSummary();
      toast({ type: 'success', message: 'Archived' });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Archive failed',
      });
    } finally {
      setBusy(null);
    }
  };

  const clearRead = async () => {
    if (!window.confirm('Delete all read alerts?')) return;
    setBusy('clear');
    try {
      const r = await notificationApi.clearRead();
      setItems((cur) => cur.filter((n) => !n.readAt));
      loadSummary();
      toast({
        type: 'success',
        message: `${r.deleted} cleared`,
      });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Clear failed',
      });
    } finally {
      setBusy(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const stats = useMemo(
    () => ({
      danger: summary?.danger ?? 0,
      warning: summary?.warning ?? 0,
      unread: summary?.unread ?? 0,
      success: summary?.success ?? 0,
    }),
    [summary]
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-brand-600 dark:text-brand-400" />
            <h1 className="text-2xl font-semibold text-fg">Alerts</h1>
          </div>
          <p className="text-sm text-muted mt-1">
            {stats.unread} unread · {total} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            icon={<RefreshCw size={14} />}
            onClick={refresh}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={markAllRead}
            loading={busy === 'all'}
            disabled={stats.unread === 0}
          >
            Mark all read
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Critical"
          value={stats.danger}
          icon={<AlertCircle size={18} />}
          tone="danger"
        />
        <SummaryCard
          label="Warnings"
          value={stats.warning}
          icon={<AlertTriangle size={18} />}
          tone="warning"
        />
        <SummaryCard
          label="Unread"
          value={stats.unread}
          icon={<Clock size={18} />}
          tone="info"
        />
        <SummaryCard
          label="Updates"
          value={stats.success}
          icon={<CheckCircle2 size={18} />}
          tone="success"
        />
      </div>

      <Card padded={false}>
        <div className="flex flex-col sm:flex-row gap-2 p-4 border-b border-border">
          <div className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFilter(f.id);
                  setPage(1);
                }}
                className={classNames(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition whitespace-nowrap',
                  filter === f.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-elevated text-muted hover:text-fg'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex-1 sm:max-w-xs">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alerts..."
              icon={<Search size={14} />}
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-elevated text-xs text-muted">
          <span>
            {loading ? 'Loading…' : `${items.length} showing`}
          </span>
          <button
            type="button"
            onClick={clearRead}
            disabled={busy === 'clear'}
            className="hover:text-fg transition disabled:opacity-40"
          >
            Clear read
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Bell size={32} className="mx-auto text-muted opacity-40 mb-3" />
            <p className="text-sm text-muted">No alerts match this view.</p>
            <p className="text-xs text-muted mt-1">
              Try a different filter or search term.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((n) => {
              const Icon = SEVERITY_ICON[n.severity];
              const unread = !n.readAt;
              return (
                <li
                  key={n._id}
                  className={classNames(
                    'border-l-4 px-4 py-4 transition',
                    SEVERITY_ROW[n.severity],
                    busy === n._id && 'opacity-60'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={classNames(
                        'shrink-0 w-9 h-9 rounded-full flex items-center justify-center',
                        n.severity === 'danger' &&
                          'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400',
                        n.severity === 'warning' &&
                          'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
                        n.severity === 'success' &&
                          'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400',
                        n.severity === 'info' &&
                          'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
                      )}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p
                              className={classNames(
                                'text-sm truncate',
                                unread
                                  ? 'font-semibold text-fg'
                                  : 'font-medium text-fg'
                              )}
                            >
                              {n.title}
                            </p>
                            {unread && (
                              <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                            )}
                            <Badge variant={SEVERITY_VARIANT[n.severity]}>
                              {n.source}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted mt-1">{n.detail}</p>
                          <p className="text-xs text-muted mt-1.5">
                            {relativeTime(n.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        {unread && (
                          <button
                            type="button"
                            onClick={() => markRead(n._id)}
                            disabled={busy === n._id}
                            className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-40"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => snooze(n._id)}
                          disabled={busy === n._id}
                          className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-fg transition disabled:opacity-40"
                        >
                          <Clock size={12} />
                          Snooze
                        </button>
                        <button
                          type="button"
                          onClick={() => archive(n._id)}
                          disabled={busy === n._id}
                          className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-fg transition disabled:opacity-40"
                        >
                          <Archive size={12} />
                          Archive
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-elevated text-sm">
            <span className="text-muted">
              Page {page} of {totalPages} · {total} total
            </span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: 'danger' | 'warning' | 'info' | 'success';
}) {
  const toneClass = {
    danger: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10',
    warning:
      'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
    info: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10',
    success:
      'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10',
  }[tone];

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted">{label}</p>
          <p className="text-xl font-semibold text-fg mt-1 truncate">{value}</p>
        </div>
        <div
          className={classNames(
            'shrink-0 w-9 h-9 rounded-lg flex items-center justify-center',
            toneClass
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}