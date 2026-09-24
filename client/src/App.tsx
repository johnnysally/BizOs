import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { SiteProvider } from '@/context/SiteContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { AuthProvider } from '@/context/AuthContext';
import { ClientProvider } from '@/context/ClientContext';
import { Toast } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppRoutes } from '@/routes/AppRoutes';

const router = createBrowserRouter(AppRoutes, {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
});

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