import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Bell,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClient } from '@/context/ClientContext';
import { useTheme } from '@/context/ThemeContext';
import { Dropdown } from '@/components/ui/Dropdown';
import { classNames } from '@/utils/classNames';
import { initials } from '@/utils/format';
import { ROUTES, ROLES } from '@/utils/constants';
import { canManageSettings } from '@/utils/permissions';

const MOBILE_NAV = [
  { to: ROUTES.app, label: 'Dashboard', roles: [ROLES.OWNER, ROLES.MANAGER, ROLES.CASHIER] },
  { to: ROUTES.pos, label: 'POS', roles: [ROLES.OWNER, ROLES.MANAGER, ROLES.CASHIER] },
  { to: ROUTES.sales, label: 'Sales', roles: [ROLES.OWNER, ROLES.MANAGER, ROLES.CASHIER] },
  { to: ROUTES.products, label: 'Products', roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.inventory, label: 'Inventory', roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.customers, label: 'Customers', roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.suppliers, label: 'Suppliers', roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.purchaseOrders, label: 'Purchase Orders', roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.invoices, label: 'Invoices', roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.reports, label: 'Reports', roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.insights, label: 'Insights', roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.chat, label: 'AI Assistant', roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.settings, label: 'Settings', roles: [ROLES.OWNER] },
];

export function AppHeader() {
  const navigate = useNavigate();
  const { user, tenant, logout } = useAuth();
  const { settings } = useClient();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  const role = user?.role || ROLES.CASHIER;
  const visibleMobileNav = MOBILE_NAV.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <header className="h-16 shrink-0 bg-surface border-b border-border relative">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: mobile menu + client identity (mobile only) */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded hover:bg-elevated text-muted shrink-0"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-2 md:hidden min-w-0">
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={tenant?.name}
                className="h-8"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                B
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-fg leading-none truncate">
                {tenant?.name}
              </p>
              <p className="text-[11px] text-muted leading-none mt-0.5 capitalize">
                {role}
              </p>
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            className="p-2 rounded-md hover:bg-elevated text-muted"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>

          <button
            type="button"
            onClick={toggle}
            className="p-2 rounded-md hover:bg-elevated text-muted"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Dropdown
            trigger={
              <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-elevated transition cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-semibold">
                  {user ? initials(user.fullName) : '?'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-medium text-fg leading-none">
                    {user?.fullName}
                  </p>
                  <p className="text-[11px] text-muted leading-none mt-0.5 truncate max-w-[120px]">
                    {user?.email}
                  </p>
                </div>
              </div>
            }
            items={[
              {
                label: 'Profile',
                icon: <UserIcon size={14} />,
                onClick: () => navigate(ROUTES.profile),
              },
              ...(canManageSettings(role)
                ? [
                    {
                      label: 'Settings',
                      icon: <SettingsIcon size={14} />,
                      onClick: () => navigate(ROUTES.settings),
                    },
                  ]
                : []),
              {
                label: 'Log out',
                icon: <LogOut size={14} />,
                onClick: logout,
                danger: true,
              },
            ]}
          />
        </div>
      </div>

      {/* Mobile navigation panel */}
      {open && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-surface border-b border-border shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto z-20">
          <nav className="p-3 space-y-0.5">
            {visibleMobileNav.map((item) => (
              <button
                key={item.to}
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate(item.to);
                }}
                className={classNames(
                  'block w-full text-left px-3 py-2 rounded-md text-sm font-medium',
                  'text-muted hover:bg-elevated hover:text-fg'
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}