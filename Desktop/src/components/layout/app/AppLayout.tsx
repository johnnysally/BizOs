import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { AppFooter } from './AppFooter';
import { MobileNav } from './MobileNav';
import { useAuth } from '@/context/AuthContext';

export function AppLayout() {
  const { scope } = useAuth();

  return (
    <div className="h-screen overflow-hidden flex bg-bg">
      <AppSidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AppHeader />

        {scope === 'pending' && (
          <div className="shrink-0 bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/30 px-4 py-2 text-center text-xs text-amber-800 dark:text-amber-300">
            Your account is pending approval. Some features are limited.
          </div>
        )}

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>

        <AppFooter />
        <MobileNav />
      </div>
    </div>
  );
}