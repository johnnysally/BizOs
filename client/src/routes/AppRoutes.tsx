import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Building2,
  ChartColumnBig,
  ChevronDown,
  CreditCard,
  Cuboid,
  LayoutDashboard,
  Moon,
  PackageCheck,
  ReceiptText,
  Search,
  Settings as SettingsIcon,
  ShoppingCart,
  Sun,
  Truck,
  UserRound,
  Users as UsersIcon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Dashboard } from '../pages/app/Dashboard';
import { POS } from '../pages/app/POS';
import { Sales } from '../pages/app/Sales';
import { Products } from '../pages/app/Products';
import { Inventory } from '../pages/app/Inventory';
import { Customers } from '../pages/app/Customers';
import { Users } from '../pages/app/Users';
import { Profile } from '../pages/app/Profile';
import { Settings } from '../pages/app/Settings';
import { Reports } from '../pages/app/Reports';
import { Returns } from '../pages/app/Returns';
import { Vouchers } from '../pages/app/Vouchers';
import { Collections } from '../pages/app/Collections';
import { ProductForm } from '../pages/app/ProductForm';
import { SaleDetail } from '../pages/app/SaleDetail';
import { Purchases } from '../pages/app/Purchases';
import { Expenses } from '../pages/app/Expenses';
import { Branches } from '../pages/app/Branches';
import { Payroll } from '../pages/app/Payroll';
import { Subscriptions } from '../pages/app/Subscriptions';
import { Tenants } from '../pages/app/Tenants';
import { Chat } from '../pages/app/Chat';
import { Insights } from '../pages/app/Insights';
import { Invitations } from '../pages/app/Invitations';
import { Notifications } from '../pages/app/Notifications';
import { Suppliers } from '../pages/app/Suppliers';
import { Forbidden } from '../pages/app/Forbidden';
import { NotFound } from '../pages/app/NotFound';
import { Landing } from '../pages/public/Landing';
import { Login } from '../pages/public/Login';
import { Register } from '../pages/public/Register';
import { Verify } from '../pages/public/Verify';
import { Pending } from '../pages/public/Pending';
import { Legal } from '../pages/public/Legal';
import { ServerError } from '../pages/public/ServerError';
import { PublicFeaturePage } from '../pages/public/FeaturePages';

export type AppPage =
  | 'dashboard'
  | 'pos'
  | 'sales'
  | 'products'
  | 'product-form'
  | 'inventory'
  | 'customers'
  | 'users'
  | 'profile'
  | 'suppliers'
  | 'purchases'
  | 'expenses'
  | 'branches'
  | 'payroll'
  | 'subscriptions'
  | 'tenants'
  | 'returns'
  | 'vouchers'
  | 'collections'
  | 'notifications'
  | 'reports'
  | 'insights'
  | 'chat'
  | 'invitations'
  | 'settings'
  | 'forbidden'
  | 'not-found'
  | 'landing'
  | 'public-about'
  | 'public-contact'
  | 'public-plans'
  | 'login'
  | 'register'
  | 'verify'
  | 'pending'
  | 'legal'
  | 'server-error';

export type UserRole = 'Owner' | 'Manager' | 'Inventory Manager' | 'Cashier' | 'Accountant';

const rolePermissions: Record<UserRole, AppPage[]> = {
  Owner: ['dashboard', 'pos', 'sales', 'products', 'product-form', 'inventory', 'customers', 'users', 'profile', 'suppliers', 'purchases', 'expenses', 'branches', 'payroll', 'subscriptions', 'tenants', 'returns', 'vouchers', 'collections', 'notifications', 'reports', 'insights', 'chat', 'invitations', 'settings'],
  Manager: ['dashboard', 'pos', 'sales', 'products', 'product-form', 'inventory', 'customers', 'users', 'profile', 'suppliers', 'purchases', 'expenses', 'branches', 'payroll', 'returns', 'vouchers', 'collections', 'notifications', 'reports', 'insights', 'chat', 'invitations'],
  'Inventory Manager': ['dashboard', 'products', 'product-form', 'inventory', 'suppliers', 'purchases', 'returns', 'profile', 'notifications', 'chat'],
  Cashier: ['dashboard', 'pos', 'sales', 'customers', 'returns', 'vouchers', 'profile', 'notifications', 'chat'],
  Accountant: ['dashboard', 'sales', 'customers', 'expenses', 'payroll', 'collections', 'reports', 'subscriptions', 'profile', 'notifications'],
};

const navGroups: Array<{ label: string; items: Array<{ id: AppPage; label: string; icon: LucideIcon }> }> = [
  { label: 'Workspace', items: [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'pos', label: 'POS', icon: ShoppingCart },
    { id: 'sales', label: 'Sales', icon: ReceiptText },
  ] },
  { label: 'Catalog', items: [
    { id: 'products', label: 'Products', icon: Cuboid },
    { id: 'inventory', label: 'Inventory', icon: PackageCheck },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'purchases', label: 'Purchases', icon: Truck },
    { id: 'returns', label: 'Returns', icon: Truck },
    { id: 'vouchers', label: 'Vouchers', icon: CreditCard },
  ] },
  { label: 'Relationships', items: [
    { id: 'customers', label: 'Customers', icon: UsersIcon },
    { id: 'users', label: 'Users', icon: UserRound },
    { id: 'collections', label: 'Collections', icon: ReceiptText },
  ] },
  { label: 'Operations', items: [
    { id: 'branches', label: 'Branches', icon: Building2 },
    { id: 'expenses', label: 'Expenses', icon: ReceiptText },
    { id: 'payroll', label: 'Payroll', icon: UserRound },
    { id: 'subscriptions', label: 'Billing', icon: CreditCard },
    { id: 'tenants', label: 'Tenants', icon: Building2 },
  ] },
  { label: 'Admin', items: [
    { id: 'reports', label: 'Reports', icon: ChartColumnBig },
    { id: 'insights', label: 'Insights', icon: CreditCard },
    { id: 'chat', label: 'Chat', icon: Bell },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'profile', label: 'Profile', icon: UserRound },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ] },
];

const renderPage = (page: AppPage, onNavigate: (nextPage: AppPage) => void) => {
  switch (page) {
    case 'dashboard':
      return <Dashboard />;
    case 'pos':
      return <POS />;
    case 'sales':
      return <Sales />;
    case 'products':
      return <Products />;
    case 'product-form':
      return <ProductForm />;
    case 'inventory':
      return <Inventory />;
    case 'customers':
      return <Customers />;
    case 'users':
      return <Users />;
    case 'profile':
      return <Profile />;
    case 'suppliers':
      return <Suppliers />;
    case 'purchases':
      return <Purchases />;
    case 'expenses':
      return <Expenses />;
    case 'branches':
      return <Branches />;
    case 'payroll':
      return <Payroll />;
    case 'subscriptions':
      return <Subscriptions />;
    case 'tenants':
      return <Tenants />;
    case 'returns':
      return <Returns />;
    case 'vouchers':
      return <Vouchers />;
    case 'collections':
      return <Collections />;
    case 'notifications':
      return <Notifications />;
    case 'reports':
      return <Reports />;
    case 'insights':
      return <Insights />;
    case 'chat':
      return <Chat />;
    case 'invitations':
      return <Invitations />;
    case 'settings':
      return <Settings />;
    case 'forbidden':
      return <Forbidden />;
    case 'not-found':
      return <NotFound />;
    case 'landing':
      return <Landing onNavigate={onNavigate} />;
    case 'public-about':
      return <PublicFeaturePage page="public-about" onNavigate={onNavigate} />;
    case 'public-contact':
      return <PublicFeaturePage page="public-contact" onNavigate={onNavigate} />;
    case 'public-plans':
      return <PublicFeaturePage page="public-plans" onNavigate={onNavigate} />;
    case 'login':
      return <Login onNavigate={onNavigate} />;
    case 'register':
      return <Register onNavigate={onNavigate} />;
    case 'verify':
      return <Verify />;
    case 'pending':
      return <Pending />;
    case 'legal':
      return <Legal />;
    case 'server-error':
      return <ServerError />;
    default:
      return <Dashboard />;
  }
};

export function AppRoutes() {
  const { resolvedTheme, setTheme } = useTheme();
  const { session, loading, logout } = useAuth();
  const [activePage, setActivePage] = useState<AppPage>('landing');
  const roleName = session?.user.role;
  const currentRole: UserRole = roleName === 'Manager' || roleName === 'Inventory Manager' || roleName === 'Cashier' || roleName === 'Accountant' ? roleName : 'Owner';
  const [search, setSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);

  useEffect(() => {
    const hashPages: Record<string, AppPage> = { '#home': 'landing', '#about': 'public-about', '#contact': 'public-contact', '#plans': 'public-plans' };
    const handleHash = () => { const page = hashPages[window.location.hash]; if (page) setActivePage(page); };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const allowedPages = rolePermissions[currentRole];
  const visibleNavGroups = navGroups
    .map((group) => ({ ...group, items: group.items.filter((item) => allowedPages.includes(item.id)) }))
    .filter((group) => group.items.length > 0);
  const pageToRender = allowedPages.includes(activePage) ? activePage : 'forbidden';
  const navigate = (nextPage: AppPage) => {
    const publicHashes: Partial<Record<AppPage, string>> = { landing: '', 'public-about': '#about', 'public-contact': '#contact', 'public-plans': '#plans' };
    if (nextPage in publicHashes) window.history.pushState({}, '', publicHashes[nextPage] || window.location.pathname);
    setActivePage(nextPage);
  };
  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  const quickStats = useMemo(() => [
    { label: 'Revenue', value: 'KES 184,250', trend: '+12.4%' },
    { label: 'Orders', value: '87', trend: '+18%' },
    { label: 'Inventory', value: 'KES 3.84M', trend: '+8.4%' },
    { label: 'Customers', value: '1,284', trend: '+7.2%' },
  ], []);

  if (activePage === 'landing' || activePage.startsWith('public-')) return renderPage(activePage, navigate);
  if (activePage === 'login' || activePage === 'register' || activePage === 'verify' || activePage === 'pending' || activePage === 'legal' || activePage === 'server-error') return renderPage(activePage, navigate);
  if (loading) return <div className="auth-shell"><div className="auth-panel"><p className="eyebrow">BizOs workspace</p><h2>Loading your session...</h2></div></div>;
  if (!session) return renderPage('login', navigate);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-mark-wrap">
            <div className="brand-mark">B</div>
            <div className="brand-copy">
              <strong>BizOs</strong>
              <span>Business OS</span>
            </div>
          </div>
        </div>

        <nav className="nav-groups">
          {visibleNavGroups.map((group) => {
            const isCollapsed = collapsedGroups.includes(group.label);
            const toggleGroup = () => setCollapsedGroups((current) => (
              current.includes(group.label)
                ? current.filter((label) => label !== group.label)
                : [...current, group.label]
            ));

            return (
              <div key={group.label} className="nav-group">
                <button className="nav-group-title" onClick={toggleGroup} type="button">
                  <span>{group.label}</span>
                  <ChevronDown size={14} className={isCollapsed ? 'rotated' : ''} />
                </button>
                {!isCollapsed && group.items.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    className={`nav-item ${activePage === id ? 'active' : ''}`}
                    onClick={() => setActivePage(id)}
                    type="button"
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="mini-card">
            <span className="mini-label">Operations</span>
            <div className="mini-row"><Building2 size={14} /> Multi-branch</div>
          </div>
          <div className="mini-card user-card">
            <div className="avatar">JM</div>
            <div>
              <strong>John Mwangi</strong>
              <small>{currentRole}</small>
            </div>
          </div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <div className="branch-switcher">
              <Building2 size={16} />
              <span>Main Branch</span>
            </div>
          </div>

          <div className="topbar-center">
            <div className="global-search">
              <Search size={15} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products, customers, sales..." />
            </div>
          </div>

          <div className="topbar-actions">
            <span className="role-switcher">{currentRole}</span>
            <button className="secondary-button small" type="button" onClick={() => { void logout(); setActivePage('landing'); }}>Sign out</button>
            <button className="icon-button subtle" type="button" onClick={() => setActivePage('notifications')} aria-label="Open notifications" title="Open notifications">
              <Bell size={16} />
            </button>
            <button className="icon-button subtle" type="button" onClick={toggleTheme} aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} theme`}>
              {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="status-pill online">
              <span className="dot" />
              Online
            </div>
          </div>
        </header>

        <div className="page-shell">
          <section className="stats-row four-col">
            {quickStats.map((stat) => (
              <div key={stat.label} className="stat-card compact">
                <div className="stat-header">
                  <span>{stat.label}</span>
                  <span className="trend up">{stat.trend}</span>
                </div>
                <div className="stat-value">{stat.value}</div>
              </div>
            ))}
          </section>

          {renderPage(pageToRender, navigate)}
        </div>
      </main>
    </div>
  );
}
