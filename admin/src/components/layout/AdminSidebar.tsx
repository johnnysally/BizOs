import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  Package,
  CreditCard,
  Settings as SettingsIcon,
  FileText,
  DatabaseBackup,
  Sparkles,
  ScrollText,
  Activity,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { classNames } from '@/utils/classNames';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ to: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Operations',
    items: [
      { to: ROUTES.tenants, label: 'Tenants', icon: Users },
      { to: ROUTES.admins, label: 'Admins', icon: ShieldCheck },
      { to: ROUTES.pending, label: 'Pending', icon: Clock },
      { to: ROUTES.plans, label: 'Plans', icon: Package },
      { to: ROUTES.paymentMethods, label: 'Payments', icon: CreditCard },
    ],
  },
  {
    label: 'Platform',
    items: [
      { to: ROUTES.settings, label: 'Settings', icon: SettingsIcon },
      { to: ROUTES.legal, label: 'Legal', icon: FileText },
      { to: ROUTES.backups, label: 'Backups', icon: DatabaseBackup },
      { to: ROUTES.aiUsage, label: 'AI Usage', icon: Sparkles },
      { to: ROUTES.audit, label: 'Audit', icon: ScrollText },
      { to: ROUTES.health, label: 'Health', icon: Activity },
    ],
  },
];

export function AdminSidebar() {
  const { admin, logout } = useAuth();

  return (
    <aside className="hidden md:flex w-64 shrink-0 h-full flex-col border-r border-slate-200 bg-white">
      <div className="h-16 shrink-0 flex items-center gap-3 px-5 border-b border-slate-200">
        <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white text-sm font-bold shadow-sm">
          B
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 leading-none">BizOS</p>
          <p className="text-[11px] font-medium text-brand-600 leading-none mt-1 uppercase tracking-wider">Control center</p>
        </div>
      </div>

      <div className="mx-3 mt-4 rounded-xl border border-brand-100 bg-brand-50/70 p-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-700">Platform status</p>
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-800">All systems operational</p>
        <p className="mt-0.5 text-[11px] text-slate-500">Monitoring is active</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      classNames(
                        'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition',
                        isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={classNames('absolute left-0 top-1/2 -translate-y-1/2 w-0.5 rounded-r-full bg-brand-600 transition-all', isActive ? 'h-6' : 'h-0 group-hover:h-4')} />
                        <Icon size={17} strokeWidth={isActive ? 2.4 : 2} />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-3 p-3 border-t border-slate-200">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[11px] font-bold">
            <ShieldCheck size={15} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 truncate">{admin?.fullName || 'Super admin'}</p>
            <p className="text-[11px] text-slate-500 truncate">Platform access</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          type="button"
        >
          <LogOut size={18} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}