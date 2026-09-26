import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSite } from '@/context/SiteContext';
import { useNotifications } from '@/context/NotificationContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { PlanCard } from './PlanCard';
import { LegalModal } from './LegalModal';
import { isEmail, isStrongPassword, isNonEmpty } from '@/utils/validation';
import { ROUTES } from '@/utils/constants';
import type { LegalType } from '@/types/legal';

export function RegisterForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register } = useAuth();
  const { plans, businessTypes, countries, status: siteStatus } = useSite();
  const { toast } = useNotifications();

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('KE');
  const [businessType, setBusinessType] = useState('retail');
  const [password, setPassword] = useState('');
  const [planId, setPlanId] = useState('');
  const [agreed, setAgreed] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [legal, setLegal] = useState<LegalType | null>(null);

  useEffect(() => {
    const wanted = params.get('plan');
    if (wanted && plans.some((p) => p.code === wanted)) {
      setPlanId(wanted);
    } else if (plans.length && !planId) {
      setPlanId(plans[0].code);
    }
  }, [params, plans, planId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!isNonEmpty(businessName)) e.businessName = 'Business name is required';
    if (!isNonEmpty(ownerName)) e.ownerName = 'Your name is required';
    if (!isEmail(email)) e.email = 'Enter a valid email';
    if (!isStrongPassword(password))
      e.password = 'Min 8 chars, 1 letter, 1 number';
    if (!planId) e.planId = 'Pick a plan';
    if (!agreed) e.agreed = 'You must accept the terms to continue';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await register({
        businessName,
        ownerName,
        email,
        phone,
        country,
        businessType,
        password,
        planId,
      });
      toast({ type: 'success', message: 'Account created' });
      navigate(ROUTES.pending);
    } catch (err) {
      const msg = (err as { message?: string }).message || 'Registration failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (siteStatus === 'loading') {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2.5 rounded-2xl border border-border bg-surface p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <h2 className="text-sm font-semibold text-fg sm:text-base dark:text-white">Business details</h2>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <FormField
              label="Business name"
              required
              error={fieldErrors.businessName}
              className="sm:col-span-2"
            >
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Mama Ngina Shop"
                className="rounded-xl border-border bg-white text-fg placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500"
              />
            </FormField>

            <FormField label="Your name" required error={fieldErrors.ownerName}>
              <Input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Jane Wanjiku"
                className="rounded-xl border-border bg-white text-fg placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500"
              />
            </FormField>

            <FormField label="Email" required error={fieldErrors.email}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="rounded-xl border-border bg-white text-fg placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500"
              />
            </FormField>

            <FormField label="Phone">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254712345678"
                className="rounded-xl border-border bg-white text-fg placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500"
              />
            </FormField>

            <FormField label="Country" required>
              <Select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="rounded-xl border-border bg-white text-fg dark:border-slate-700 dark:bg-slate-950/70 dark:text-white"
                options={
                  countries.length
                    ? countries.map((c) => ({ value: c.code, label: c.name }))
                    : [
                        { value: 'KE', label: 'Kenya' },
                        { value: 'UG', label: 'Uganda' },
                        { value: 'TZ', label: 'Tanzania' },
                      ]
                }
              />
            </FormField>

            <FormField label="Business type" required>
              <Select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="rounded-xl border-border bg-white text-fg dark:border-slate-700 dark:bg-slate-950/70 dark:text-white"
                options={
                  businessTypes.length
                    ? businessTypes.map((t) => ({
                        value: t,
                        label: t.charAt(0).toUpperCase() + t.slice(1),
                      }))
                    : [
                        { value: 'retail', label: 'Retail' },
                        { value: 'restaurant', label: 'Restaurant' },
                        { value: 'salon', label: 'Salon' },
                        { value: 'pharmacy', label: 'Pharmacy' },
                        { value: 'other', label: 'Other' },
                      ]
                }
              />
            </FormField>

            <FormField
              label="Password"
              required
              error={fieldErrors.password}
              hint="At least 8 characters, with 1 letter and 1 number"
              className="sm:col-span-2"
            >
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border-border bg-white text-fg placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950/70 dark:text-white dark:placeholder:text-slate-500"
              />
            </FormField>
          </div>
        </div>

        <div className="space-y-2.5 rounded-2xl border border-border bg-surface p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <div>
            <h2 className="text-sm font-semibold text-fg sm:text-base dark:text-white">Choose a plan</h2>
            {fieldErrors.planId && (
              <p className="mt-1 text-xs text-red-400">{fieldErrors.planId}</p>
            )}
          </div>

          {plans.length === 0 ? (
            <div className="rounded-xl border border-border bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300">
              No plans available right now. Contact support.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.code}
                  plan={plan}
                  selected={planId === plan.code}
                  onClick={() => setPlanId(plan.code)}
                  className="min-h-[200px] bg-slate-50 dark:bg-slate-950/50"
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2 rounded-2xl border border-border bg-surface p-3 dark:border-slate-800 dark:bg-slate-900/60">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                if (e.target.checked && fieldErrors.agreed) {
                  setFieldErrors((prev) => {
                    const next = { ...prev };
                    delete next.agreed;
                    return next;
                  });
                }
              }}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 bg-white text-brand-500 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-950"
            />
            <span className="text-sm leading-snug text-slate-600 dark:text-slate-300">
              I agree to the{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLegal('terms');
                }}
                className="text-brand-600 underline hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLegal('privacy');
                }}
                className="text-brand-600 underline hover:text-brand-500 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Privacy Policy
              </button>
              .
            </span>
          </label>

          {fieldErrors.agreed && (
            <p className="pl-7 text-xs text-red-400">{fieldErrors.agreed}</p>
          )}
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          loading={submitting}
          size="lg"
          disabled={!agreed}
          className="h-12 rounded-xl bg-brand-600 text-base font-semibold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-500"
        >
          Create account
        </Button>
      </form>

      <LegalModal
        open={!!legal}
        onClose={() => setLegal(null)}
        type={legal || 'terms'}
      />
    </>
  );
}