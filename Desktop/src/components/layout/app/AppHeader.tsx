import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  User as UserIcon,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Bell,
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Boxes,
  Users,
  Truck,
  ShoppingBag,
  FileText,
  BarChart3,
  Sparkles,
  MessageCircle,
  UserCog,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useClient } from '@/context/ClientContext';
import { useTheme } from '@/context/ThemeContext';
import { Dropdown } from '@/components/ui/Dropdown';
import { classNames } from '@/utils/classNames';
import { initials } from '@/utils/format';
import { ROUTES, ROLES } from '@/utils/constants';
import { canManageSettings } from '@/utils/permissions';
import { insightApi } from '@/api/insights';

const ALL = [ROLES.OWNER, ROLES.MANAGER, ROLES.CASHIER];
const MGMT = [ROLES.OWNER, ROLES.MANAGER];
const OWNER = [ROLES.OWNER];

const MOBILE_SECTIONS: Array<{
  label: string;
  items: Array<{ to: string; label: string; roles: string[]; icon: typeof LayoutDashboard }>;
}> = [
  {
    label: '',
    items: [
      { to: ROUTES.app, label: 'Dashboard', roles: ALL, icon: LayoutDashboard },
      { to: ROUTES.pos, label: 'POS', roles: ALL, icon: ShoppingCart },
      { to: ROUTES.sales, label: 'Sales', roles: ALL, icon: Receipt },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: ROUTES.products, label: 'Products', roles: MGMT, icon: Package },
      { to: ROUTES.inventory, label: 'Inventory', roles: MGMT, icon: Boxes },
      { to: ROUTES.suppliers, label: 'Suppliers', roles: MGMT, icon: Truck },
      { to: ROUTES.purchaseOrders, label: 'Purchase Orders', roles: MGMT, icon: ShoppingBag },
    ],
  },
  {
    label: 'Billing',
    items: [
      { to: ROUTES.customers, label: 'Customers', roles: MGMT, icon: Users },
      { to: ROUTES.invoices, label: 'Invoices', roles: MGMT, icon: FileText },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: ROUTES.reports, label: 'Reports', roles: MGMT, icon: BarChart3 },
      { to: ROUTES.insights, label: 'Insights', roles: MGMT, icon: Sparkles },
      { to: ROUTES.chat, label: 'AI Assistant', roles: MGMT, icon: MessageCircle },
    ],
  },
  {
    label: 'Staff',
    items: [
      { to: ROUTES.users, label: 'Team', roles: OWNER, icon: UserCog },
      { to: ROUTES.invitations, label: 'Invitations', roles: OWNER, icon: Mail },
    ],
  },
  {
    label: 'Admin',
    items: [
      { to: ROUTES.settings, label: 'Settings', roles: OWNER, icon: SettingsIcon },
    ],
  },
];

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, tenant, logout } = useAuth();
  const { settings } = useClient();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const role = user?.role || ROLES.CASHIER;

  useEffect(() => {
    let active = true;
    insightApi.stockAlerts()
      .then((alerts) => {
        if (active) setNotificationCount(alerts.length);
      })
      .catch(() => {
        if (active) setNotificationCount(0);
      });

    return () => {
      active = false;
    };
  }, []);

  const visibleSections = MOBILE_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(role)),
  })).filter((section) => section.items.length > 0);

  const currentPage = visibleSections
    .flatMap((section) => section.items)
    .find((item) => item.to === ROUTES.app
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to))?.label || 'Workspace';

  return (
    <header className="h-16 shrink-0 bg-surface border-b border-border relative z-10">
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
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
              <img src={settings.logoUrl} alt={tenant?.name} className="h-8" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {(tenant?.name || 'BizOS').charAt(0).toUpperCase()}
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

          <div className="hidden md:block min-w-0 border-l border-border pl-4">
            <p className="text-sm font-semibold text-fg leading-none truncate">{currentPage}</p>
            <p className="text-[11px] text-muted leading-none mt-1 truncate">
              {tenant?.name || 'Your workspace'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => navigate(ROUTES.notifications)}
            className="p-2 rounded-md hover:bg-elevated hover:text-fg text-muted transition"
            aria-label="Notifications"
            title="Notifications"
          >
            <span className="relative block">
              <Bell size={18} />
              {notificationCount > 0 && (
                <span className="absolute -right-2 -top-2 min-w-4 h-4 px-1 rounded-full bg-brand-600 text-white text-[9px] leading-4 text-center font-semibold">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={toggle}
            className="p-2 rounded-md hover:bg-elevated hover:text-fg text-muted transition"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Dropdown
            trigger={
              <div className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-elevated transition cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-brand-600 text-white ring-2 ring-brand-100 dark:ring-brand-500/20 flex items-center justify-center text-xs font-semibold">
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

      {open && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-surface border-b border-border shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto z-20">
          <nav className="p-3 space-y-4">
            {visibleSections.map((section, si) => (
              <div key={section.label || `sec-${si}`}>
                {section.label && (
                  <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    {section.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.to}
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          navigate(item.to);
                        }}
                        className={classNames(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-left transition',
                          location.pathname === item.to || (item.to !== ROUTES.app && location.pathname.startsWith(item.to))
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                            : 'text-muted hover:bg-elevated hover:text-fg'
                        )}
                      >
                        <Icon size={16} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}