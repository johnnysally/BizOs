import { useSite } from '@/context/SiteContext';

export function AppFooter() {
  const { settings } = useSite();
  const year = new Date().getFullYear();

  const platformName = settings?.platformName || 'BizOS';
  const supportEmail = settings?.supportEmail;

  return (
    <footer className="hidden md:flex h-10 shrink-0 items-center justify-between px-6 border-t border-border bg-surface text-xs text-muted">
      <span>
        © {year} {platformName}
      </span>
      <div className="flex items-center gap-4">
        {supportEmail && (
          <a href={`mailto:${supportEmail}`} className="hover:text-fg">
            {supportEmail}
          </a>
        )}
        <span>v{__APP_VERSION__}</span>
      </div>
    </footer>
  );
}