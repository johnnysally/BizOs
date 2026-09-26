import { BrowserRouter, HashRouter, RouterProvider, createBrowserRouter, createHashRouter } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { SiteProvider } from '@/context/SiteContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { AuthProvider } from '@/context/AuthContext';
import { ClientProvider } from '@/context/ClientContext';
import { Toast } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppRoutes } from '@/routes/AppRoutes';

const isElectron =
  typeof window !== 'undefined' &&
  (navigator.userAgent.includes('Electron') ||
    typeof (window as unknown as { electronAPI?: unknown }).electronAPI !== 'undefined');

const future = {
  v7_relativeSplatPath: true,
  v7_fetcherPersist: true,
  v7_normalizeFormMethod: true,
  v7_partialHydration: true,
  v7_skipActionErrorRevalidation: true,
} as const;

const router = isElectron
  ? createHashRouter(AppRoutes, { future })
  : createBrowserRouter(AppRoutes, { future });

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SiteProvider>
          <NotificationProvider>
            <AuthProvider>
              <ClientProvider>
                <RouterProvider
                  router={router}
                  future={{ v7_startTransition: false }}
                />
                <Toast />
              </ClientProvider>
            </AuthProvider>
          </NotificationProvider>
        </SiteProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}