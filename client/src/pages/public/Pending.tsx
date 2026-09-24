import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, LogOut, Mail, Phone, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSite } from '@/context/SiteContext';
import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ROUTES } from '@/utils/constants';

function formatMoney(amount: number, currency: string) {
  return `${currency} ${Number(amount).toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export default function Pending() {
  const navigate = useNavigate();
  const { user, tenant, plan, invoice, logout, status, scope, hydrate } = useAuth();
  const { settings } = useSite();
  const [refreshing, setRefreshing] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  // Fetch fresh data on mount — pulls invoice into context
  useEffect(() => {
    if (status !== 'authenticated' || scope !== 'pending') return;
    if (!firstLoad) return;

    setFirstLoad(false);

    hydrate().catch(() => {
      /* silent */
    });
  }, [status, scope, firstLoad, hydrate]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      navigate(ROUTES.login);
    }
    if (status === 'authenticated' && scope === 'active') {
      navigate(ROUTES.app);
    }
  }, [status, scope, navigate]);

  // Poll for approval every 30s
  useEffect(() => {
    if (status !== 'authenticated' || scope !== 'pending') return;
    const interval = setInterval(async () => {
      try {
        const me = await authApi.me();
        if (me.tenant.status === 'active') {
          window.location.reload();
        }
      } catch {
        /* silent */
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [status, scope]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const me = await authApi.me();
      if (me.tenant.status === 'active') {
        window.location.href = ROUTES.app;
        return;
      }
      window.location.reload();
    } catch {
      setRefreshing(false);
    }
  };

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const supportEmail = settings?.supportEmail || 'support@bizos.co.ke';
  const supportPhone = settings?.supportPhone || '+254 700 000 000';

  const hasInvoice = Boolean(invoice);
  const isPaid = invoice?.status === 'paid';
  const planName = plan?.name || tenant?.planId || 'Standard';

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <Clock size={32} className="text-amber-600" />
          </div>

          <h1 className="text-xl font-semibold text-slate-900">
            Waiting for approval
          </h1>

          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            Thanks for registering <strong>{tenant?.name}</strong>.
            {hasInvoice && !isPaid && (
              <>
                {' '}
                We've sent your invoice for the <strong>{planName}</strong> plan
                to <strong>{user?.email}</strong> — pay it to secure your account.
              </>
            )}
            {hasInvoice && isPaid && (
              <>
                {' '}
                We've received your payment for the{' '}
                <strong>{planName}</strong> plan.
              </>
            )}
            {!hasInvoice && (
              <>
                {' '}
                Your registration is now with our team for review.
              </>
            )}{' '}
            We'll notify you by email once you're approved.
          </p>

          <div className="mt-6 p-4 bg-slate-50 rounded-lg text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Business</span>
              <span className="font-medium truncate ml-2">{tenant?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Plan</span>
              <span className="font-medium capitalize">{planName}</span>
            </div>
            {hasInvoice && (
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice</span>
                <span className="font-medium font-mono text-xs">
                  {invoice?.number}
                </span>
              </div>
            )}
            {hasInvoice && (
              <div className="flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-medium">
                  {formatMoney(invoice!.amountDue || 0, invoice!.currency)}
                </span>
              </div>
            )}
            {hasInvoice && (
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span
                  className={
                    isPaid
                      ? 'font-medium text-green-600'
                      : 'font-medium text-amber-600'
                  }
                >
                  {isPaid ? 'Paid' : 'Unpaid'}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Email</span>
              <span className="font-medium truncate ml-2">{user?.email}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            {hasInvoice && !isPaid && invoice?.payUrl && (
              <Link to={invoice.payUrl.replace(/^https?:\/\/[^/]+/, '')}>
                <Button fullWidth icon={<FileText size={14} />}>
                  Pay invoice
                </Button>
              </Link>
            )}
            <Button
              variant={hasInvoice && !isPaid ? 'outline' : 'primary'}
              onClick={refresh}
              loading={refreshing}
            >
              Check status
            </Button>
            <Button variant="ghost" onClick={logout} icon={<LogOut size={14} />}>
              Log out
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 mb-3">Need help?</p>
            <div className="flex flex-col gap-1 text-xs">
              <a
                href={`mailto:${supportEmail}`}
                className="text-brand-600 hover:underline inline-flex items-center justify-center gap-1"
              >
                <Mail size={12} /> {supportEmail}
              </a>
              <a
                href={`tel:${supportPhone.replace(/\s+/g, '')}`}
                className="text-brand-600 hover:underline inline-flex items-center justify-center gap-1"
              >
                <Phone size={12} /> {supportPhone}
              </a>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-4">
          Usually takes less than 24 hours.
        </p>
      </div>
    </div>
  );
}