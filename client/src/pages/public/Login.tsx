import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { LoginForm } from '@/components/public/LoginForm';
import { ROUTES } from '@/utils/constants';
import { useSite } from '@/context/SiteContext';

export default function Login() {
  const { settings } = useSite();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-bg px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto grid min-h-[650px] max-w-6xl overflow-hidden rounded-2xl border border-border bg-surface shadow-xl shadow-slate-200/50 dark:shadow-black/20 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 p-8 text-white sm:p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-brand-400/20" />
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-brand-400/20" />
          <div className="relative">
            <Link to={ROUTES.home} className="flex items-center gap-3">
              {settings?.platformLogoUrl ? <img src={settings.platformLogoUrl} alt={settings.platformName || 'BizOS'} className="h-9" /> : <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold">B</div>}
              <div><p className="text-sm font-semibold">{settings?.platformName || 'BizOS'}</p><p className="mt-1 text-xs text-slate-400">Business operating system</p></div>
            </Link>
            <div className="mt-24 max-w-md">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-300"><Sparkles size={13} /> Your business, in rhythm</p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight">Everything important, right where work happens.</h1>
              <p className="mt-5 text-sm leading-7 text-slate-400">Pick up where you left off across sales, inventory, customers, and the decisions that keep your business moving.</p>
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4"><BarChart3 size={18} className="text-brand-300" /><p className="mt-6 text-xs font-semibold">See the signal</p><p className="mt-1 text-[11px] text-slate-400">Reports that stay useful</p></div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4"><ShieldCheck size={18} className="text-brand-300" /><p className="mt-6 text-xs font-semibold">Stay in control</p><p className="mt-1 text-[11px] text-slate-400">Secure by design</p></div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-16">
          <div className="w-full max-w-sm">
            <div className="mb-10 lg:hidden">
              <Link to={ROUTES.home} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white">B</div>
                <div><p className="text-sm font-semibold text-fg">{settings?.platformName || 'BizOS'}</p><p className="mt-1 text-xs text-muted">Business operating system</p></div>
              </Link>
            </div>
            <div className="mb-8">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-600">Welcome back</p>
              <h2 className="text-3xl font-semibold tracking-tight text-fg">Log in to your workspace.</h2>
              <p className="mt-2 text-sm leading-6 text-muted">Enter your details to continue where your business left off.</p>
            </div>
            <LoginForm />
            <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-muted"><CheckCircle2 size={13} className="text-emerald-500" /> Secure workspace access <ArrowRight size={13} className="text-brand-500" /></p>
            <p className="mt-4 text-center text-xs text-muted">By logging in you agree to our <Link to={ROUTES.legal('terms')} className="text-brand-600 hover:underline">Terms</Link>.</p>
          </div>
        </section>
      </div>
    </div>
  );
}