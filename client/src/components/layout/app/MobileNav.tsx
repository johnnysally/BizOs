import { NavLink } from 'react-router-dom';
import {
  ShoppingCart,
  Receipt,
  Package,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { classNames } from '@/utils/classNames';
import { ROUTES, ROLES } from '@/utils/constants';

const NAV = [
  { to: ROUTES.pos, label: 'POS', icon: ShoppingCart, roles: [ROLES.OWNER, ROLES.MANAGER, ROLES.CASHIER] },
  { to: ROUTES.sales, label: 'Sales', icon: Receipt, roles: [ROLES.OWNER, ROLES.MANAGER, ROLES.CASHIER] },
  { to: ROUTES.products, label: 'Products', icon: Package, roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.reports, label: 'Reports', icon: BarChart3, roles: [ROLES.OWNER, ROLES.MANAGER] },
  { to: ROUTES.settings, label: 'More', icon: SettingsIcon, roles: [ROLES.OWNER, ROLES.MANAGER] },
];

export function MobileNav() {
  const { user } = useAuth();
  const role = user?.role || ROLES.CASHIER;
  const items = NAV.filter((item) => item.roles.includes(role)).slice(0, 5);

  if (items.length === 0) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border flex">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              classNames(
                'flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition',
                isActive ? 'text-brand-600 dark:text-brand-400' : 'text-muted'
              )
            }
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}