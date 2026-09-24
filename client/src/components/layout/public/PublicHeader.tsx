import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSite } from '@/context/SiteContext';
import { classNames } from '@/utils/classNames';
import { ROUTES } from '@/utils/constants';
import { Button } from '@/components/ui/Button';

const NAV = [
  { to: ROUTES.pricing, label: 'Pricing' },
  { to: ROUTES.help, label: 'Help' },
  { to: ROUTES.downloads, label: 'Resources' },
];

export function PublicHeader() {
  const { status, scope } = useAuth();
  const { settings } = useSite();
  const [open, setOpen] = useState(false);

  const isAuthed = status === 'authenticated';
  const canGoApp = isAuthed && scope === 'active';
  const canGoPending = isAuthed && scope === 'pending';

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
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
                <span className="text-base font-semibold text-slate-900">
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
                className={({ isActive }) =>
                  classNames(
                    'px-3 py-2 rounded-md text-sm font-medium transition',
                    isActive
                      ? 'text-brand-700 bg-brand-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
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
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 rounded hover:bg-slate-100 text-slate-600"
            aria-label="Menu"
            type="button"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  classNames(
                    'block px-3 py-2 rounded-md text-sm font-medium',
                    isActive
                      ? 'text-brand-700 bg-brand-50'
                      : 'text-slate-600 hover:bg-slate-100'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div className="pt-3 mt-3 border-t border-slate-200 space-y-2">
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