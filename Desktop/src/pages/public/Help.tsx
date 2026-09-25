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

export default function Help() {
  const { settings } = useSite();

  const email = settings?.supportEmail || 'support@bizos.co.ke';
  const phone = settings?.supportPhone || '+254 700 000 000';
  const waNumber = phone.replace(/[^\d]/g, '');

  return (
    <>
      <section className="bg-gradient-to-b from-slate-50 to-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
            How can we help?
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Browse common topics or reach us directly.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="p-5 border border-slate-200 rounded-lg hover:border-brand-300 transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">
                    {c.title}
                  </h3>
                  <p className="text-sm text-slate-600">{c.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Talk to us
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href={`mailto:${email}`}
              className="p-5 border border-slate-200 rounded-lg hover:border-brand-300 transition block"
            >
              <Mail size={20} className="text-brand-600 mb-2" />
              <p className="font-medium text-slate-900 text-sm">Email</p>
              <p className="text-xs text-slate-500 mt-1">{email}</p>
            </a>

            <a
              href={`tel:${phone.replace(/\s+/g, '')}`}
              className="p-5 border border-slate-200 rounded-lg hover:border-brand-300 transition block"
            >
              <Phone size={20} className="text-brand-600 mb-2" />
              <p className="font-medium text-slate-900 text-sm">Call</p>
              <p className="text-xs text-slate-500 mt-1">{phone}</p>
            </a>

            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 border border-slate-200 rounded-lg hover:border-brand-300 transition block"
            >
              <MessageCircle size={20} className="text-brand-600 mb-2" />
              <p className="font-medium text-slate-900 text-sm">WhatsApp</p>
              <p className="text-xs text-slate-500 mt-1">Message us</p>
            </a>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            We usually reply within a few hours during business days.
          </p>
        </div>
      </section>

      <FAQ />

      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-slate-500">
            Can't find what you're looking for?{' '}
            <Link to={ROUTES.downloads} className="text-brand-600 hover:underline">
              Check our resources
            </Link>{' '}
            or{' '}
            <a href={`mailto:${email}`} className="text-brand-600 hover:underline">
              email support
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}