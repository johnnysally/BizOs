import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { SiteProvider } from '@/context/SiteContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { AuthProvider } from '@/context/AuthContext';
import { ClientProvider } from '@/context/ClientContext';
import { Toast } from '@/components/ui/Toast';
import { AppRoutes } from '@/routes/AppRoutes';

const router = createBrowserRouter(AppRoutes);

export default function App() {
  return (
    <ThemeProvider>
      <SiteProvider>
        <NotificationProvider>
          <AuthProvider>
            <ClientProvider>
              <RouterProvider router={router} />
              <Toast />
            </ClientProvider>
          </AuthProvider>
        </NotificationProvider>
      </SiteProvider>
    </ThemeProvider>
  );
}