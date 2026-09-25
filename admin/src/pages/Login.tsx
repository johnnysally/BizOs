import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, Signal } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';

export default function Login() {
  const { login, status } = useAuth();
  const { toast } = useNotifications();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      toast({ type: 'success', message: 'Welcome back' });
      navigate('/');
    } catch (err) {
      const msg = (err as { message?: string }).message || 'Login failed';
      setError(msg);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-900 sm:p-6 lg:p-10">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-2xl border border-slate-800 bg-white shadow-2xl shadow-slate-950/30 sm:min-h-[calc(100vh-3rem)] lg:grid-cols-[1.05fr_0.95fr] lg:min-h-[calc(100vh-5rem)]">
        <section className="relative hidden overflow-hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-brand-400/20" />
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-brand-400/20" />

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 text-sm font-bold shadow-lg shadow-brand-500/20">B</div>
              <div><p className="text-sm font-semibold leading-none">BizOS</p><p className="mt-1 text-xs text-slate-400">Control center</p></div>
            </div>
            <div className="mt-24 max-w-md">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-brand-300"><Signal size={13} /> Operations console</p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight">Keep the whole system in view.</h1>
              <p className="mt-5 text-sm leading-7 text-slate-400">Manage tenants, plans, platform health, audit activity, and backups from one protected workspace.</p>
            </div>
          </div>

          <div className="relative grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4"><ShieldCheck className="text-brand-300" size={18} /><p className="mt-6 text-xs font-semibold">Protected access</p><p className="mt-1 text-[11px] text-slate-400">Super admin only</p></div>
            <div className="rounded-xl border border-slate-800 bg-slate-800/60 p-4"><LockKeyhole className="text-brand-300" size={18} /><p className="mt-6 text-xs font-semibold">Private console</p><p className="mt-1 text-[11px] text-slate-400">Session encrypted</p></div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-white px-6 py-10 sm:px-12 lg:px-16">
          <div className="w-full max-w-sm">
            <div className="mb-10 lg:hidden">
              <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">B</div><div><p className="text-sm font-semibold leading-none text-slate-900">BizOS</p><p className="mt-1 text-xs text-slate-500">Admin control center</p></div></div>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-600">Secure sign in</p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-950">Welcome back.</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Use your administrator credentials to continue to the console.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-5">
              <FormField label="Email" required>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bizos.co.ke"
                  autoComplete="email"
                  required
                />
              </FormField>

              <FormField label="Password" required>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </FormField>

              {error && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">{error}</div>}

              <Button type="submit" fullWidth size="lg" loading={status === 'loading'} icon={<ArrowRight size={17} />} className="mt-2">
                Enter console
              </Button>
            </form>

            <p className="mt-8 flex items-center justify-center gap-2 text-center text-[11px] text-slate-400"><ShieldCheck size={13} /> Authorized administrators only</p>
          </div>
        </section>
      </div>
    </main>
  );
}