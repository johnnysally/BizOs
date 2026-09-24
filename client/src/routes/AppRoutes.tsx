import { lazy, Suspense, ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Navigate, Outlet } from 'react-router-dom';
import { AppLayout } from '@/components/layout/app/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';
import publicRoutes from './publicRoutes';

const Dashboard = lazy(() => import('@/pages/app/Dashboard'));
const POS = lazy(() => import('@/pages/app/POS'));
const Products = lazy(() => import('@/pages/app/Products'));
const Inventory = lazy(() => import('@/pages/app/Inventory'));
const Sales = lazy(() => import('@/pages/app/Sales'));
const SaleDetail = lazy(() => import('@/pages/app/SaleDetail'));
const Customers = lazy(() => import('@/pages/app/Customers'));
const Suppliers = lazy(() => import('@/pages/app/Suppliers'));
const PurchaseOrders = lazy(() => import('@/pages/app/PurchaseOrders'));
const PurchaseOrderForm = lazy(() => import('@/pages/app/PurchaseOrderForm'));
const PurchaseOrderDetail = lazy(() => import('@/pages/app/PurchaseOrderDetail'));
const Invoices = lazy(() => import('@/pages/app/Invoices'));
const Reports = lazy(() => import('@/pages/app/Reports'));
const Insights = lazy(() => import('@/pages/app/Insights'));
const SettingsPage = lazy(() => import('@/pages/app/Settings'));
const Chat = lazy(() => import('@/pages/app/Chat'));
const Users = lazy(() => import('@/pages/app/Users'));
const Invitations = lazy(() => import('@/pages/app/Invitations'));
const Profile = lazy(() => import('@/pages/app/Profile'));
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

          { path: 'pos', element: wrap(<POS />) },

          {
            path: 'products',
            element: <Allow roles={['owner', 'manager']}>{wrap(<Products />)}</Allow>,
          },
          {
            path: 'products/new',
            element: <Allow roles={['owner', 'manager']}>{soon('Add product')}</Allow>,
          },
          {
            path: 'products/:id/edit',
            element: <Allow roles={['owner', 'manager']}>{soon('Edit product')}</Allow>,
          },

          { path: 'sales', element: wrap(<Sales />) },
          { path: 'sales/:id', element: wrap(<SaleDetail />) },

          {
            path: 'customers',
            element: <Allow roles={['owner', 'manager']}>{wrap(<Customers />)}</Allow>,
          },
          {
            path: 'inventory',
            element: <Allow roles={['owner', 'manager']}>{wrap(<Inventory />)}</Allow>,
          },

          {
            path: 'suppliers',
            element: <Allow roles={['owner', 'manager']}>{wrap(<Suppliers />)}</Allow>,
          },
          {
            path: 'purchase-orders',
            element: <Allow roles={['owner', 'manager']}>{wrap(<PurchaseOrders />)}</Allow>,
          },
          {
            path: 'purchase-orders/new',
            element: <Allow roles={['owner', 'manager']}>{wrap(<PurchaseOrderForm />)}</Allow>,
          },
          {
            path: 'purchase-orders/:id',
            element: <Allow roles={['owner', 'manager']}>{wrap(<PurchaseOrderDetail />)}</Allow>,
          },

          {
            path: 'invoices',
            element: <Allow roles={['owner', 'manager']}>{wrap(<Invoices />)}</Allow>,
          },

          {
            path: 'users',
            element: <Allow roles={['owner']}>{wrap(<Users />)}</Allow>,
          },
          {
            path: 'invitations',
            element: <Allow roles={['owner']}>{wrap(<Invitations />)}</Allow>,
          },
          {
            path: 'settings',
            element: <Allow roles={['owner']}>{wrap(<SettingsPage />)}</Allow>,
          },
          { path: 'profile', element: wrap(<Profile />) },

          {
            path: 'insights',
            element: <Allow roles={['owner', 'manager']}>{wrap(<Insights />)}</Allow>,
          },
          {
            path: 'chat',
            element: <Allow roles={['owner', 'manager']}>{wrap(<Chat />)}</Allow>,
          },
          {
            path: 'reports',
            element: <Allow roles={['owner', 'manager']}>{wrap(<Reports />)}</Allow>,
          },

          { path: '403', element: soon('Access denied') },
          { path: '*', element: soon('Page not found') },
        ],
      },
    ],
  },
];

export const AppRoutes: RouteObject[] = [...publicRoutes, ...appRoutes];