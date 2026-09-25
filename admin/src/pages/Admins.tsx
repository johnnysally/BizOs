import { useMemo, useState } from 'react';
import { Ban, CheckCircle2, Clock3, KeyRound, Mail, MoreHorizontal, Search, ShieldCheck, UserCog, UserPlus } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useNotifications } from '@/context/NotificationContext';

type AdminStatus = 'Active' | 'Invited' | 'Suspended';

type AdminRecord = {
  id: string;
  name: string;
  email: string;
  status: AdminStatus;
  lastActive: string;
  scope: string;
};

const previewAdmins: AdminRecord[] = [
  { id: 'preview-1', name: 'Davix HDM', email: 'davismcintyre5@gmail.com', status: 'Active', lastActive: 'Now', scope: 'Full platform access' },
  { id: 'preview-2', name: 'Platform reviewer', email: 'reviewer@bizos.co.ke', status: 'Active', lastActive: 'Today, 09:42', scope: 'Operations and tenants' },
  { id: 'preview-3', name: 'Finance operator', email: 'finance@bizos.co.ke', status: 'Invited', lastActive: 'Invitation pending', scope: 'Plans and payments' },
];

export default function Admins() {
  const { toast } = useNotifications();
  const [admins, setAdmins] = useState(previewAdmins);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'All' | AdminStatus>('All');

  const visibleAdmins = useMemo(() => admins.filter((admin) => {
    const matchesQuery = `${admin.name} ${admin.email} ${admin.scope}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === 'All' || admin.status === status);
  }), [admins, query, status]);

  const toggleSuspended = (id: string) => {
    setAdmins((current) => current.map((admin) => admin.id === id ? { ...admin, status: admin.status === 'Suspended' ? 'Active' : 'Suspended' } : admin));
    toast({ type: 'info', message: 'Local preview state updated. API wiring is pending.' });
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-700"><ShieldCheck size={12} /> Access control</div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Admin directory</h1>
          <p className="mt-1 text-sm text-slate-500">Review platform operators, access scope, and account status.</p>
        </div>
        <Button icon={<UserPlus size={15} />} onClick={() => toast({ type: 'info', message: 'Invite flow is ready for API wiring.' })}>Invite admin</Button>
      </section>

      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <Clock3 size={15} className="shrink-0" /> <span><strong>UI preview mode:</strong> admin records and operations are local until the admin-management API is available.</span>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search admins..." aria-label="Search admins" /></div>
          <div className="flex gap-1 rounded-md bg-slate-100 p-1">
            {(['All', 'Active', 'Invited', 'Suspended'] as const).map((filter) => <button key={filter} type="button" onClick={() => setStatus(filter)} className={`rounded px-3 py-1.5 text-xs font-semibold transition ${status === filter ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>{filter}</button>)}
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {visibleAdmins.map((admin) => (
            <article className="flex flex-col gap-4 p-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:p-5" key={admin.id}>
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{admin.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
                <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-semibold text-slate-900">{admin.name}</p><Badge variant={admin.status === 'Active' ? 'success' : admin.status === 'Suspended' ? 'danger' : 'neutral'} dot>{admin.status}</Badge></div><p className="truncate text-xs text-slate-500">{admin.email}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs sm:min-w-[360px] sm:grid-cols-3"><div><p className="text-slate-400">Scope</p><p className="mt-1 font-medium text-slate-700">{admin.scope}</p></div><div><p className="text-slate-400">Last active</p><p className="mt-1 font-medium text-slate-700">{admin.lastActive}</p></div><div className="flex items-end justify-end gap-1"><button type="button" onClick={() => toast({ type: 'info', message: 'Password reset flow is ready for API wiring.' })} className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900" title="Reset access" aria-label={`Reset access for ${admin.name}`}><KeyRound size={15} /></button><button type="button" onClick={() => toggleSuspended(admin.id)} className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900" title={admin.status === 'Suspended' ? 'Reactivate admin' : 'Suspend admin'} aria-label={admin.status === 'Suspended' ? `Reactivate ${admin.name}` : `Suspend ${admin.name}`}><Ban size={15} /></button><button type="button" onClick={() => toast({ type: 'info', message: 'Admin details flow is ready for API wiring.' })} className="rounded p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900" title="More operations" aria-label={`More operations for ${admin.name}`}><MoreHorizontal size={15} /></button></div></div>
            </article>
          ))}
          {visibleAdmins.length === 0 && <div className="px-5 py-14 text-center text-sm text-slate-500"><UserCog className="mx-auto mb-3 text-slate-400" size={24} />No admins match this view.</div>}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-lg border border-slate-200 bg-white p-4"><CheckCircle2 className="text-emerald-500" size={18} /><strong className="mt-4 block text-xl text-slate-900">{admins.filter((admin) => admin.status === 'Active').length}</strong><span className="text-xs text-slate-500">Active operators</span></div><div className="rounded-lg border border-slate-200 bg-white p-4"><Mail className="text-brand-500" size={18} /><strong className="mt-4 block text-xl text-slate-900">{admins.filter((admin) => admin.status === 'Invited').length}</strong><span className="text-xs text-slate-500">Pending invites</span></div><div className="rounded-lg border border-slate-200 bg-white p-4"><Ban className="text-slate-400" size={18} /><strong className="mt-4 block text-xl text-slate-900">{admins.filter((admin) => admin.status === 'Suspended').length}</strong><span className="text-xs text-slate-500">Suspended access</span></div></div>
    </div>
  );
}
