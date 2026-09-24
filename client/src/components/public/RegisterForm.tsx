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
      <form onSubmit={onSubmit} className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Business details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              />
            </FormField>

            <FormField
              label="Your name"
              required
              error={fieldErrors.ownerName}
            >
              <Input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Jane Wanjiku"
              />
            </FormField>

            <FormField label="Email" required error={fieldErrors.email}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
              />
            </FormField>

            <FormField label="Phone">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254712345678"
              />
            </FormField>

            <FormField label="Country" required>
              <Select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
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
              />
            </FormField>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Choose a plan
            </h2>
            {fieldErrors.planId && (
              <p className="text-xs text-red-600 mt-1">
                {fieldErrors.planId}
              </p>
            )}
          </div>

          {plans.length === 0 ? (
            <div className="text-sm text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-4">
              No plans available right now. Contact support.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.code}
                  plan={plan}
                  selected={planId === plan.code}
                  onClick={() => setPlanId(plan.code)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Legal agreement */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
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
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 shrink-0"
            />
            <span className="text-sm text-slate-600 leading-snug">
              I agree to the{' '}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setLegal('terms');
                }}
                className="text-brand-600 underline hover:text-brand-700"
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
                className="text-brand-600 underline hover:text-brand-700"
              >
                Privacy Policy
              </button>
              .
            </span>
          </label>

          {fieldErrors.agreed && (
            <p className="text-xs text-red-600 pl-7">{fieldErrors.agreed}</p>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <Button
          type="submit"
          fullWidth
          loading={submitting}
          size="lg"
          disabled={!agreed}
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