import { Link } from 'react-router-dom';
import { BarChart3, ShieldCheck, Sparkles } from 'lucide-react';
import { RegisterForm } from '@/components/public/RegisterForm';
import { ROUTES } from '@/utils/constants';
import { useSite } from '@/context/SiteContext';

export default function Register() {
  const { settings } = useSite();

  return (
    <div className="bg-bg px-3 py-4 sm:px-5 sm:py-6 lg:px-6">
      <div className="mx-auto grid min-h-[540px] max-w-6xl items-start rounded-2xl border border-border bg-surface shadow-xl shadow-slate-200/50 dark:shadow-black/20 lg:grid-cols-[0.8fr_1.2fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 p-6 text-white sm:p-8 lg:flex lg:min-h-[520px] lg:flex-col lg:justify-between lg:rounded-l-2xl">
          <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full border border-brand-400/20" />
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border border-brand-400/20" />

          <div className="relative">
            <Link to={ROUTES.home} className="flex items-center gap-3">
              {settings?.platformLogoUrl ? (
                <img src={settings.platformLogoUrl} alt={settings.platformName || 'BizOS'} className="h-9" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold">B</div>
              )}
              <div>
                <p className="text-sm font-semibold">{settings?.platformName || 'BizOS'}</p>
                <p className="mt-1 text-xs text-slate-400">Business operating system</p>
              </div>
            </Link>

            <div className="mt-14 max-w-md">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-300">
                <Sparkles size={13} /> Your business, in rhythm
              </p>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight">
                A clearer way to run your business starts here.
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Bring sales, inventory, customers, and everyday decisions into one workspace built around your business.
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <BarChart3 size={18} className="text-brand-300" />
              <p className="mt-6 text-xs font-semibold">See the signal</p>
              <p className="mt-1 text-[11px] text-slate-400">Reports that stay useful</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
              <ShieldCheck size={18} className="text-brand-300" />
              <p className="mt-6 text-xs font-semibold">Stay in control</p>
              <p className="mt-1 text-[11px] text-slate-400">Secure by design</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
          <div className="w-full max-w-2xl">
            <div className="mb-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600">Get started</p>
              <h2 className="text-3xl font-semibold tracking-tight text-fg">Create your workspace.</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Already registered?{' '}
                <Link to={ROUTES.login} className="text-brand-600 hover:underline">Log in</Link>
              </p>
            </div>
            <RegisterForm />
          </div>
        </section>
      </div>
    </div>
  );
}