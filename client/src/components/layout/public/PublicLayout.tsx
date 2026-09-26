import { Outlet } from 'react-router-dom';
import { PublicHeader } from './PublicHeader';
import { PublicFooter } from './PublicFooter';
import { CookieBanner } from '@/components/public/CookieBanner';

export function PublicLayout() {
  return (
    <div className="public-theme min-h-screen flex flex-col bg-bg text-fg">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
      <CookieBanner />
    </div>
  );
}