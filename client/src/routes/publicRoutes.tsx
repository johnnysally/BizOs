import { lazy, Suspense, ReactNode } from 'react';
import { Navigate, Outlet, RouteObject } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/public/PublicLayout';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Spinner';

const Landing = lazy(() => import('@/pages/public/Landing'));
const Pricing = lazy(() => import('@/pages/public/Pricing'));
const Help = lazy(() => import('@/pages/public/Help'));
const Downloads = lazy(() => import('@/pages/public/Downloads'));
const Register = lazy(() => import('@/pages/public/Register'));
const Login = lazy(() => import('@/pages/public/Login'));
const Verify = lazy(() => import('@/pages/public/Verify'));
const ForgotPassword = lazy(() => import('@/pages/public/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/public/ResetPassword'));
const Pending = lazy(() => import('@/pages/public/Pending'));
const InvoicePay = lazy(() => import('@/pages/public/InvoicePay'));
const NotFound = lazy(() => import('@/pages/public/NotFound'));
const ServerError = lazy(() => import('@/pages/public/ServerError'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner size="lg" />
    </div>
  );
}

function GuestOnly() {
  const { status, scope } = useAuth();

  if (status === 'idle' || status === 'loading') return <PageLoader />;
  if (status !== 'authenticated') return <Outlet />;
  if (scope === 'pending') return <Navigate to="/pending" replace />;
  return <Navigate to="/app" replace />;
}

const wrap = (el: ReactNode) => <Suspense fallback={<PageLoader />}>{el}</Suspense>;

const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    errorElement: wrap(<ServerError />),
    children: [
      { index: true, element: wrap(<Landing />) },
      { path: 'pricing', element: wrap(<Pricing />) },
      { path: 'help', element: wrap(<Help />) },
      { path: 'downloads', element: wrap(<Downloads />) },
      {
        element: <GuestOnly />,
        children: [
          { path: 'register', element: wrap(<Register />) },
          { path: 'login', element: wrap(<Login />) },
          { path: 'forgot-password', element: wrap(<ForgotPassword />) },
          { path: 'reset-password', element: wrap(<ResetPassword />) },
        ],
      },
      { path: 'verify', element: wrap(<Verify />) },
      { path: 'pending', element: wrap(<Pending />) },
      { path: 'pay/:invoiceNumber', element: wrap(<InvoicePay />) },
      { path: '*', element: wrap(<NotFound />) },
    ],
  },
];

export default publicRoutes;