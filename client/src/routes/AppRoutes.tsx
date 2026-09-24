import { lazy, Suspense, ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Navigate, Outlet } from 'react-router-dom';
import { AppLayout } from '@/components/layout/app/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';
import publicRoutes from './publicRoutes';

const Dashboard = lazy(() => import('@/pages/app/Dashboard'));
const SettingsPage = lazy(() => import('@/pages/app/Settings'));
const Chat = lazy(() => import('@/pages/app/Chat'));
const ComingSoon = lazy(() => import('./ComingSoon'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner size="lg" />
    </div>
  );
}

function Authed() {
  const { status, scope } = useAuth();

  if (status === 'idle' || status === 'loading') return <PageLoader />;
  if (status !== 'authenticated') return <Navigate to="/login" replace />;
  if (scope === 'pending') return <Navigate to="/pending" replace />;
  return <Outlet />;
}

function Allow({ roles, children }: { roles: string[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/app/403" replace />;
  }
  return <>{children}</>;
}

const wrap = (el: ReactNode) => <Suspense fallback={<PageLoader />}>{el}</Suspense>;

const soon = (title: string) => wrap(<ComingSoon title={title} />);

const appRoutes: RouteObject[] = [
  {
    path: '/app',
    element: <Authed />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: wrap(<Dashboard />) },

          { path: 'pos', element: soon('Point of sale') },
          {
            path: 'products',
            element: <Allow roles={['owner', 'manager']}>{soon('Products')}</Allow>,
          },
          {
            path: 'products/new',
            element: <Allow roles={['owner', 'manager']}>{soon('Add product')}</Allow>,
          },
          {
            path: 'products/:id/edit',
            element: <Allow roles={['owner', 'manager']}>{soon('Edit product')}</Allow>,
          },
          { path: 'sales', element: soon('Sales') },
          { path: 'sales/:id', element: soon('Sale detail') },
          {
            path: 'customers',
            element: <Allow roles={['owner', 'manager']}>{soon('Customers')}</Allow>,
          },
          {
            path: 'inventory',
            element: <Allow roles={['owner', 'manager']}>{soon('Inventory')}</Allow>,
          },
          {
            path: 'suppliers',
            element: <Allow roles={['owner', 'manager']}>{soon('Suppliers')}</Allow>,
          },
          {
            path: 'purchase-orders',
            element: <Allow roles={['owner', 'manager']}>{soon('Purchase orders')}</Allow>,
          },
          {
            path: 'invoices',
            element: <Allow roles={['owner', 'manager']}>{soon('Invoices')}</Allow>,
          },
          { path: 'users', element: <Allow roles={['owner']}>{soon('Users')}</Allow> },
          {
            path: 'invitations',
            element: <Allow roles={['owner']}>{soon('Invitations')}</Allow>,
          },
          {
            path: 'settings',
            element: <Allow roles={['owner']}>{wrap(<SettingsPage />)}</Allow>,
          },
          { path: 'profile', element: soon('Profile') },
          {
            path: 'insights',
            element: <Allow roles={['owner', 'manager']}>{soon('Insights')}</Allow>,
          },
          {
            path: 'chat',
            element: <Allow roles={['owner', 'manager']}>{wrap(<Chat />)}</Allow>,
          },
          {
            path: 'reports',
            element: <Allow roles={['owner', 'manager']}>{soon('Reports')}</Allow>,
          },
          { path: '403', element: soon('Access denied') },
          { path: '*', element: soon('Page not found') },
        ],
      },
    ],
  },
];

export const AppRoutes: RouteObject[] = [...publicRoutes, ...appRoutes];