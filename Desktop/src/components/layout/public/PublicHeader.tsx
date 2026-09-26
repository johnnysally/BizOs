import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSite } from '@/context/SiteContext';
import { useTheme } from '@/context/ThemeContext';
import { classNames } from '@/utils/classNames';
import { ROUTES } from '@/utils/constants';
import { Button } from '@/components/ui/Button';

const NAV = [
  { to: ROUTES.home, label: 'Home' },
  { to: ROUTES.pricing, label: 'Pricing' },
  { to: ROUTES.help, label: 'Help' },
  { to: ROUTES.downloads, label: 'Resources' },
];

export function PublicHeader() {
  const { status, scope } = useAuth();
  const { settings } = useSite();
  const { resolved, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  const isAuthed = status === 'authenticated';
  const canGoApp = isAuthed && scope === 'active';
  const canGoPending = isAuthed && scope === 'pending';

  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            {settings?.platformLogoUrl ? (
              <img
                src={settings.platformLogoUrl}
                alt={settings.platformName || 'BizOS'}
                className="h-8"
              />
            ) : (
              <>
                <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white text-sm font-bold">
                  B
                </div>
                <span className="text-base font-semibold text-fg">
                  {settings?.platformName || 'BizOS'}
                </span>
              </>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ROUTES.home}
                className={({ isActive }) =>
                  classNames(
                    'px-3 py-2 rounded-md text-sm font-medium transition',
                    isActive
                      ? 'text-brand-700 bg-brand-50 dark:text-brand-300 dark:bg-brand-500/10'
                      : 'text-muted hover:text-fg hover:bg-elevated'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggle}
              className="p-2 rounded-md text-muted hover:text-fg hover:bg-elevated transition"
              aria-label={resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {resolved === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {canGoApp && (
              <Link to={ROUTES.app}>
                <Button size="sm">Go to app</Button>
              </Link>
            )}
            {canGoPending && (
              <Link to={ROUTES.pending}>
                <Button size="sm" variant="outline">
                  Pending approval
                </Button>
              </Link>
            )}
            {!isAuthed && (
              <>
                <Link to={ROUTES.login}>
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to={ROUTES.register}>
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              onClick={toggle}
              className="p-2 rounded-md text-muted hover:text-fg hover:bg-elevated transition"
              aria-label={resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {resolved === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              className="p-2 rounded-md hover:bg-elevated text-muted"
              aria-label={open ? 'Close menu' : 'Open menu'}
              type="button"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-border py-3 space-y-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === ROUTES.home}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  classNames(
                    'block px-3 py-2 rounded-md text-sm font-medium',
                    isActive
                      ? 'text-brand-700 bg-brand-50 dark:text-brand-300 dark:bg-brand-500/10'
                      : 'text-muted hover:bg-elevated'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="pt-3 mt-3 border-t border-border space-y-2">
              {canGoApp && (
                <Link to={ROUTES.app} onClick={() => setOpen(false)}>
                  <Button fullWidth>Go to app</Button>
                </Link>
              )}
              {canGoPending && (
                <Link to={ROUTES.pending} onClick={() => setOpen(false)}>
                  <Button fullWidth variant="outline">
                    Pending approval
                  </Button>
                </Link>
              )}
              {!isAuthed && (
                <>
                  <Link to={ROUTES.login} onClick={() => setOpen(false)}>
                    <Button fullWidth variant="outline">
                      Log in
                    </Button>
                  </Link>
                  <Link to={ROUTES.register} onClick={() => setOpen(false)}>
                    <Button fullWidth>Get started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}