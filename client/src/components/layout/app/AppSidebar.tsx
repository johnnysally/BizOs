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
  UserCog,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { classNames } from '@/utils/classNames';
import { ROUTES, ROLES } from '@/utils/constants';

const ALL = [ROLES.OWNER, ROLES.MANAGER, ROLES.CASHIER];
const MGMT = [ROLES.OWNER, ROLES.MANAGER];
const OWNER = [ROLES.OWNER];

interface NavItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: string[];
  end?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    label: '',
    items: [
      { to: ROUTES.app, label: 'Dashboard', icon: LayoutDashboard, roles: ALL, end: true },
      { to: ROUTES.pos, label: 'POS', icon: ShoppingCart, roles: ALL },
      { to: ROUTES.sales, label: 'Sales', icon: Receipt, roles: ALL },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: ROUTES.products, label: 'Products', icon: Package, roles: MGMT },
      { to: ROUTES.inventory, label: 'Inventory', icon: Boxes, roles: MGMT },
      { to: ROUTES.suppliers, label: 'Suppliers', icon: Truck, roles: MGMT },
      { to: ROUTES.purchaseOrders, label: 'Purchase Orders', icon: ShoppingBag, roles: MGMT },
    ],
  },
  {
    label: 'Billing',
    items: [
      { to: ROUTES.customers, label: 'Customers', icon: Users, roles: MGMT },
      { to: ROUTES.invoices, label: 'Invoices', icon: FileText, roles: MGMT },
    ],
  },
  {
    label: 'Insights',
    items: [
      { to: ROUTES.reports, label: 'Reports', icon: BarChart3, roles: MGMT },
      { to: ROUTES.insights, label: 'Insights', icon: Sparkles, roles: MGMT },
      { to: ROUTES.chat, label: 'AI Assistant', icon: MessageCircle, roles: MGMT },
    ],
  },
  {
    label: 'Staff',
    items: [
      { to: ROUTES.users, label: 'Team', icon: UserCog, roles: OWNER },
      { to: ROUTES.invitations, label: 'Invitations', icon: Mail, roles: OWNER },
    ],
  },
  {
    label: 'Admin',
    items: [
      { to: ROUTES.settings, label: 'Settings', icon: SettingsIcon, roles: OWNER },
    ],
  },
];

export function AppSidebar() {
  const { user } = useAuth();
  const role = user?.role || ROLES.CASHIER;

  const visibleSections = SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.roles.includes(role)),
  })).filter((section) => section.items.length > 0);

  return (
    <aside className="hidden md:flex w-60 shrink-0 h-full flex-col border-r border-border bg-surface">
      <div className="h-16 shrink-0 flex items-center gap-2 px-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
          B
        </div>
        <div>
          <p className="text-sm font-semibold text-fg leading-none">BizOS</p>
          <p className="text-xs text-muted leading-none mt-0.5">Business OS</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-thin">
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
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}