import { NavLink } from 'react-router-dom';
import {
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
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { classNames } from '@/utils/classNames';
import { ROUTES, ROLES } from '@/utils/constants';

const NAV = [
  { to: ROUTES.app, label: 'Dashboard', icon: LayoutDashboard, roles: [ROLES.OWNER, ROLES.MANAGER, ROLES.CASHIER], end: true },
  { to: ROUTES.pos, label: 'POS', icon: ShoppingCart, roles: [ROLES.OWNER, ROLES.MANAGER, ROLES.CASHIER] },
  { to: ROUTES.sales, label: 'Sales', icon: Receipt, roles: [ROLES.OWNER, ROLES.MANAGER, ROLES.CASHIER] },
  { to: ROUTES.products, label: 'Products', icon: Package, roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.inventory, label: 'Inventory', icon: Boxes, roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.customers, label: 'Customers', icon: Users, roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.suppliers, label: 'Suppliers', icon: Truck, roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.purchaseOrders, label: 'Purchase Orders', icon: ShoppingBag, roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.invoices, label: 'Invoices', icon: FileText, roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.reports, label: 'Reports', icon: BarChart3, roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.insights, label: 'Insights', icon: Sparkles, roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.chat, label: 'AI Assistant', icon: MessageCircle, roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.settings, label: 'Settings', icon: SettingsIcon, roles: [ROLES.OWNER] },
];

export function AppSidebar() {
  const { user } = useAuth();
  const role = user?.role || ROLES.CASHIER;
  const items = NAV.filter((item) => item.roles.includes(role));

  return (
    <aside className="hidden md:flex w-60 shrink-0 h-full flex-col border-r border-border bg-surface">
      {/* Brand */}
      <div className="h-16 shrink-0 flex items-center gap-2 px-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
          B
        </div>
        <div>
          <p className="text-sm font-semibold text-fg leading-none">
            BizOS
          </p>
          <p className="text-xs text-muted leading-none mt-0.5">
            Business OS
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 scrollbar-thin">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                classNames(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                    : 'text-muted hover:bg-elevated hover:text-fg'
                )
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}