import { Link } from 'react-router-dom';
import { BarChart3, ShieldCheck, Sparkles } from 'lucide-react';
import { RegisterForm } from '@/components/public/RegisterForm';
import { ROUTES } from '@/utils/constants';
import { useSite } from '@/context/SiteContext';

export default function Register() {
  const { settings } = useSite();

  return (
    <div className="min-h-screen bg-slate-100 px-3 py-3 sm:px-4 sm:py-4 lg:px-5 dark:bg-[#06121f]">
      <div className="mx-auto grid max-w-[1500px] overflow-hidden rounded-[30px] border border-border bg-surface shadow-[0_30px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-950/90 dark:shadow-[0_30px_80px_rgba(15,23,42,0.65)] lg:grid-cols-[0.88fr_1.12fr]">
        <section className="relative hidden overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.25),transparent_35%),linear-gradient(135deg,#081827_0%,#050d17_100%)] p-6 text-white sm:p-8 lg:flex lg:min-h-[620px] lg:flex-col lg:justify-between">
          <div className="absolute -right-14 -top-14 h-52 w-52 rounded-full border border-brand-400/20" />
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full border border-brand-400/20" />

          <div className="relative">
            <Link to={ROUTES.home} className="flex items-center gap-3">
              {settings?.platformLogoUrl ? (
                <img src={settings.platformLogoUrl} alt={settings.platformName || 'BizOS'} className="h-9" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">B</div>
              )}
              <div>
                <p className="text-sm font-semibold text-white">{settings?.platformName || 'BizOS'}</p>
                <p className="mt-1 text-xs text-slate-400">Business operating system</p>
              </div>
            </Link>

            <div className="mt-16 max-w-md">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-300">
                <Sparkles size={13} /> Your business, in rhythm
              </p>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white">
                A clearer way to run your business starts here.
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-400">
                Bring sales, inventory, customers, and everyday decisions into one workspace built around your business.
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-sm">
              <BarChart3 size={18} className="text-brand-300" />
              <p className="mt-6 text-xs font-semibold text-white">See the signal</p>
              <p className="mt-1 text-[11px] text-slate-400">Reports that stay useful</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 backdrop-blur-sm">
              <ShieldCheck size={18} className="text-brand-300" />
              <p className="mt-6 text-xs font-semibold text-white">Stay in control</p>
              <p className="mt-1 text-[11px] text-slate-400">Secure by design</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-slate-50 px-4 py-6 sm:px-6 dark:bg-slate-950/80 lg:px-8 xl:px-10">
          <div className="w-full max-w-2xl">
            <div className="mb-5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-500">Get started</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">Create your workspace.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Already registered?{' '}
                <Link to={ROUTES.login} className="font-medium text-brand-600 hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300">Log in</Link>
              </p>
            </div>
            <RegisterForm />
          </div>
        </section>
      </div>
    </div>
  );
}