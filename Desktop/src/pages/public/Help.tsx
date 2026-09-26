import { Link } from 'react-router-dom';
import {
  Rocket,
  CreditCard,
  Package,
  Users,
  BarChart3,
  Settings as SettingsIcon,
  Mail,
  Phone,
  MessageCircle,
  Clock3,
  ShieldCheck,
} from 'lucide-react';
import { useSite } from '@/context/SiteContext';
import { FAQ } from '@/components/public/FAQ';
import { ROUTES } from '@/utils/constants';

const CATEGORIES = [
  {
    icon: Rocket,
    title: 'Getting Started',
    description: 'Create an account, pick a plan, and set up your business.',
  },
  {
    icon: CreditCard,
    title: 'Payments',
    description: 'Accept cash, card, and M-Pesa. Configure payment methods.',
  },
  {
    icon: Package,
    title: 'Inventory',
    description: 'Track stock, get low-stock alerts, and manage suppliers.',
  },
  {
    icon: Users,
    title: 'Staff & Roles',
    description: 'Invite owners, managers, and cashiers with the right access.',
  },
  {
    icon: BarChart3,
    title: 'Reports & AI',
    description: 'See how your business is doing and ask AI for insights.',
  },
  {
    icon: SettingsIcon,
    title: 'Account & Billing',
    description: 'Update your profile, manage your subscription, and export data.',
  },
];

const SUPPORT_STATS = [
  { label: 'Avg. response', value: '2 hours', icon: Clock3 },
  { label: 'Support coverage', value: 'Mon–Sat', icon: ShieldCheck },
  { label: 'Help topics', value: '40+', icon: Rocket },
];

export default function Help() {
  const { settings } = useSite();

  const email = settings?.supportEmail || 'support@bizos.co.ke';
  const phone = settings?.supportPhone || '+254 700 000 000';
  const waNumber = phone.replace(/[^\d]/g, '');

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-slate-50 to-white py-16 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),transparent_32%)]" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
              Support center
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50">
              How can we help?
            </h1>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Browse common topics or connect with our team directly.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {SUPPORT_STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-center shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70">
                <div className="mx-auto mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                  <Icon size={18} />
                </div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
              Popular topics
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-50">
              Everything you need to keep moving
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {c.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
              Talk to us
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-50">
              We’re here when you need a hand
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <a
              href={`mailto:${email}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900"
            >
              <Mail size={20} className="mb-3 text-brand-600 dark:text-brand-300" />
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Email</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{email}</p>
            </a>

            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900"
            >
              <Phone size={20} className="mb-3 text-brand-600 dark:text-brand-300" />
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Call</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{phone}</p>
            </a>

            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900"
            >
              <MessageCircle size={20} className="mb-3 text-brand-600 dark:text-brand-300" />
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">WhatsApp</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Message us</p>
            </a>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            We usually reply within a few hours during business days.
          </p>
        </div>
      </section>

      <FAQ />

      <section className="pb-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Can't find what you're looking for?{' '}
            <Link to={ROUTES.downloads} className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
              Check our resources
            </Link>{' '}
            or{' '}
            <a href={`mailto:${email}`} className="font-semibold text-brand-600 hover:underline dark:text-brand-300">
              email support
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}