import { useLocation, useNavigate } from 'react-router-dom';
import { Activity, ArrowUpRight, Bell, Moon, Sun, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Dropdown } from '@/components/ui/Dropdown';
import { initials } from '@/utils/format';
import { ROUTES } from '@/utils/constants';

export function AdminHeader() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggle } = useTheme();

  const pageTitles: Record<string, string> = {
    [ROUTES.dashboard]: 'Platform overview',
    [ROUTES.tenants]: 'Tenant operations',
    [ROUTES.admins]: 'Admin operations',
    [ROUTES.pending]: 'Approval queue',
    [ROUTES.plans]: 'Plan management',
    [ROUTES.paymentMethods]: 'Payment methods',
    [ROUTES.settings]: 'System settings',
    [ROUTES.legal]: 'Legal workspace',
    [ROUTES.backups]: 'Backup center',
    [ROUTES.aiUsage]: 'AI usage',
    [ROUTES.audit]: 'Audit trail',
    [ROUTES.health]: 'System health',
  };

  const pageTitle = pageTitles[location.pathname] || 'Admin workspace';

  return (
    <header className="relative h-16 shrink-0 flex items-center justify-between gap-4 px-4 sm:px-6 border-b border-slate-200 bg-white">
      <div className="flex items-center gap-3 min-w-0">
        <span className="md:hidden text-sm font-semibold text-slate-900">BizOS Admin</span>
        <div className="hidden md:block border-l-2 border-brand-500 pl-3">
          <p className="text-sm font-semibold text-slate-900 leading-none truncate">{pageTitle}</p>
          <p className="text-[11px] text-slate-500 leading-none mt-1">Super admin workspace</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(ROUTES.audit)}
          className="relative rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Open admin activity"
          title="Admin activity"
        >
          <Bell size={18} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand-500" />
        </button>

        <button
          type="button"
          onClick={toggle}
          className="rounded-md p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          onClick={() => navigate(ROUTES.health)}
          className="hidden sm:inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
        >
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" /></span>
          Platform healthy
          <Activity size={14} />
        </button>

        <button
          type="button"
          onClick={() => navigate(ROUTES.health)}
          className="hidden lg:inline-flex items-center gap-1 text-xs font-semibold text-slate-500 transition hover:text-slate-900"
        >
          Health details <ArrowUpRight size={13} />
        </button>
        <Dropdown
          trigger={
            <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-slate-100 transition cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-semibold">
                {admin ? initials(admin.fullName) : '?'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-medium text-slate-900 leading-none">
                  {admin?.fullName || 'Admin'}
                </p>
                <p className="text-[11px] text-slate-500 leading-none mt-0.5">
                  {admin?.email}
                </p>
              </div>
            </div>
          }
          items={[
            {
              label: 'Profile',
              icon: <User size={14} />,
              onClick: () => navigate(ROUTES.profile),
            },
            {
              label: 'Log out',
              icon: <LogOut size={14} />,
              onClick: logout,
              danger: true,
            },
          ]}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />
    </header>
  );
}