import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toast } from '@/components/ui/Toast';
import { AppRoutes } from '@/routes/AppRoutes';

const router = createBrowserRouter(AppRoutes);

export default function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toast />
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}