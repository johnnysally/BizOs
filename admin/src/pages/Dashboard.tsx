import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Clock, DatabaseBackup, Users, UserCheck, Sparkles, RefreshCw, AlertCircle, Activity } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Table, Column } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { dashboardApi, DashboardOverview } from '@/api/dashboard';
import { pendingApi } from '@/api/pending';
import type { PendingListItem } from '@/types/tenant';
import { relativeTime } from '@/utils/date';
import { ROUTES } from '@/utils/constants';
import { useTheme } from '@/context/ThemeContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [pending, setPending] = useState<PendingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [o, p] = await Promise.all([
        dashboardApi.overview(),
        pendingApi.list({ page: 1, limit: 5 }),
      ]);
      setOverview(o);
      setPending(p.data);
    } catch (err) {
      setError((err as { message?: string }).message || 'Could not load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
        <h1 className="text-xl font-semibold text-slate-900">Could not load dashboard</h1>
        <p className="text-sm text-slate-500 mt-2">{error}</p>
        <Button
          className="mt-6"
          icon={<RefreshCw size={14} />}
          onClick={load}
          loading={loading}
        >
          Retry
        </Button>
      </div>
    );
  }

  const columns: Column<PendingListItem>[] = [
    {
      key: 'tenant',
      label: 'Business',
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900">{row.tenant?.name || '—'}</p>
          <p className="text-xs text-slate-500">{row.tenant?.businessType}</p>
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (row) => (
        <div>
          <p className="text-sm">{row.owner?.fullName || '—'}</p>
          <p className="text-xs text-slate-500">{row.owner?.email}</p>
        </div>
      ),
    },
    {
      key: 'registeredAt',
      label: 'Registered',
      render: (row) => (
        <span className="text-slate-500">{relativeTime(row.registeredAt)}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: () => (
        <Button size="sm" variant="ghost" onClick={() => navigate(ROUTES.pending)}>
          Review
        </Button>
      ),
    },
  ];

  const pulseSegments = [
    { label: 'Active tenants', value: overview?.tenants.active ?? 0, color: '#60a5fa' },
    { label: 'Approval queue', value: overview?.pendingQueue ?? 0, color: '#fbbf24' },
    { label: 'AI calls', value: overview?.aiCalls30d ?? 0, color: '#c084fc' },
  ];
  const pulseTotal = pulseSegments.reduce((total, segment) => total + segment.value, 0);
  let pulseCursor = 0;
  const pulseGradient = pulseTotal === 0
    ? (theme === 'dark' ? '#334155' : '#cbd5e1')
    : `conic-gradient(${pulseSegments.map((segment) => {
      const start = (pulseCursor / pulseTotal) * 100;
      pulseCursor += segment.value;
      const end = (pulseCursor / pulseTotal) * 100;
      return `${segment.color} ${start}% ${end}%`;
    }).join(', ')})`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-700">
            <Activity size={12} /> Control center
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Platform overview</h1>
          <p className="text-sm text-slate-500 mt-1">A live read on tenants, access, approvals, and AI activity.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 text-xs font-medium text-emerald-600 sm:inline-flex"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Systems operational</span>
          <Button variant="outline" size="sm" icon={<RefreshCw size={14} />} onClick={load} loading={loading}>Refresh</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total tenants"
          value={overview?.tenants.total ?? 0}
          hint={`${overview?.tenants.active ?? 0} active`}
          icon={<Users size={18} />}
        />
        <StatCard
          label="Pending approvals"
          value={overview?.pendingQueue ?? 0}
          hint="Awaiting review"
          icon={<Clock size={18} />}
        />
        <StatCard
          label="Total users"
          value={overview?.users ?? 0}
          hint="Active accounts"
          icon={<UserCheck size={18} />}
        />
        <StatCard
          label="AI calls (30d)"
          value={overview?.aiCalls30d ?? 0}
          hint="HDM AI"
          icon={<Sparkles size={18} />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <Card title="Command shortcuts" description="Jump straight into the platform work that needs attention." padded>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { label: 'Review approvals', detail: `${overview?.pendingQueue ?? 0} waiting in queue`, icon: Clock, route: ROUTES.pending },
              { label: 'Manage tenants', detail: `${overview?.tenants.total ?? 0} businesses registered`, icon: Users, route: ROUTES.tenants },
              { label: 'Inspect system health', detail: 'Services and runtime checks', icon: Activity, route: ROUTES.health },
              { label: 'Review backups', detail: 'Recovery points and history', icon: DatabaseBackup, route: ROUTES.backups },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.label} type="button" onClick={() => navigate(action.route)} className="group flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-left transition hover:border-brand-200 hover:bg-brand-50/50">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition group-hover:bg-brand-100 group-hover:text-brand-700"><Icon size={17} /></span>
                  <span className="min-w-0 flex-1"><strong className="block truncate text-xs font-semibold text-slate-800">{action.label}</strong><span className="mt-0.5 block truncate text-[11px] text-slate-500">{action.detail}</span></span>
                  <ArrowUpRight size={14} className="shrink-0 text-slate-400 transition group-hover:text-brand-600" />
                </button>
              );
            })}
          </div>
        </Card>

        <div className={`rounded-lg border p-5 shadow-sm ${theme === 'dark' ? 'border-slate-800 bg-slate-900 text-white' : 'border-slate-200 bg-slate-100 text-slate-900'}`}>
          <div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wider text-brand-300">Operational pulse</p><h2 className="mt-2 text-lg font-semibold">Platform activity</h2></div><CheckCircle2 className="text-emerald-400" size={20} /></div>
          <div className="mt-5 flex items-center gap-5">
            <div className="relative h-32 w-32 shrink-0 [transform:perspective(600px)_rotateX(56deg)_rotateZ(-8deg)]" role="img" aria-label="Operational pulse chart showing active tenants, approval queue, and AI calls">
              <div className="absolute inset-0 rounded-full opacity-30 blur-md" style={{ background: pulseGradient, transform: 'translateY(10px)' }} />
              <div className={`absolute inset-0 rounded-full ${theme === 'dark' ? 'shadow-[inset_0_-12px_0_rgba(15,23,42,0.45),0_14px_20px_rgba(2,6,23,0.4)]' : 'shadow-[inset_0_-12px_0_rgba(148,163,184,0.35),0_14px_20px_rgba(100,116,139,0.2)]'}`} style={{ background: pulseGradient }} />
              <div className={`absolute inset-7 rounded-full shadow-[inset_0_5px_10px_rgba(2,6,23,0.25)] ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'}`} />
            </div>
            <div className="min-w-0 flex-1 space-y-3 text-xs">
              {pulseSegments.map((segment) => (
                <div className="flex items-center justify-between gap-3" key={segment.label}>
                  <span className={`flex min-w-0 items-center gap-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}><span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: segment.color }} /> <span className="truncate">{segment.label}</span></span>
                  <strong>{segment.value}</strong>
                </div>
              ))}
              <div className={`border-t pt-3 text-[11px] ${theme === 'dark' ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-500'}`}>{pulseTotal ? `${pulseTotal} total signals` : 'No activity recorded'}</div>
            </div>
          </div>
          <button type="button" onClick={() => navigate(ROUTES.health)} className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-300 transition hover:text-white">Open health center <ArrowUpRight size={13} /></button>
        </div>
      </div>

      <Card
        title="Pending approvals"
        description="Latest registrations awaiting review"
        actions={
          <Button size="sm" variant="ghost" onClick={() => navigate(ROUTES.pending)}>
            View all
          </Button>
        }
        padded={false}
      >
        <Table
          columns={columns}
          data={pending}
          loading={loading}
          rowKey={(r) => r._id}
          emptyState={
            <div className="py-8 text-center text-sm text-slate-500">
              No pending approvals
            </div>
          }
        />
      </Card>
    </div>
  );
}