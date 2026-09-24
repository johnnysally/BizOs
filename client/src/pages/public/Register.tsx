import { useEffect, useState, type FormEvent } from 'react';
import { authApi } from '../../api/auth';
import { siteApi, type Country, type PublicPlan } from '../../api/site';
import type { AppPage } from '../../routes/AppRoutes';

export function Register({ onNavigate }: { onNavigate: (page: AppPage) => void }) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [form, setForm] = useState({ businessName: '', ownerName: '', email: '', phone: '', country: 'KE', businessType: 'retail', password: '', confirmPassword: '', planId: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    void Promise.all([siteApi.getCountries(), siteApi.getBusinessTypes(), siteApi.getPlans()])
      .then(([countryList, typeList, planList]) => {
        if (!active) return;
        setCountries(countryList);
        setBusinessTypes(typeList);
        setPlans(planList);
        setForm((current) => ({ ...current, country: current.country || countryList[0]?.code || 'KE', businessType: current.businessType || typeList[0] || 'retail', planId: current.planId || planList[0]?.code || '' }));
      })
      .catch(() => setError('Unable to load registration options. Please try again.'));
    return () => { active = false; };
  }, []);

  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!form.planId) { setError('Please select a plan.'); return; }
    setSubmitting(true);
    try {
      await authApi.register({ businessName: form.businessName, ownerName: form.ownerName, email: form.email, phone: form.phone, country: form.country, businessType: form.businessType, password: form.password, planId: form.planId });
      onNavigate('pending');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to create your account.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <h2>Create business</h2>
        <p>Set up your workspace and choose the plan that fits your operation.</p>
        <form className="auth-form" onSubmit={submit}>
          <label className="field"><span>Business name</span><input required value={form.businessName} onChange={(event) => update('businessName', event.target.value)} autoComplete="organization" placeholder="Mwangi Electrical Supplies" /></label>
          <label className="field"><span>Owner name</span><input required value={form.ownerName} onChange={(event) => update('ownerName', event.target.value)} autoComplete="name" placeholder="John Mwangi" /></label>
          <div className="field-grid two-col"><label className="field"><span>Email</span><input required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} autoComplete="email" placeholder="you@business.co.ke" /></label><label className="field"><span>Phone</span><input value={form.phone} onChange={(event) => update('phone', event.target.value)} autoComplete="tel" placeholder="+254 712 000 111" /></label></div>
          <div className="field-grid two-col"><label className="field"><span>Country</span><select value={form.country} onChange={(event) => update('country', event.target.value)}>{countries.length ? countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>) : <option value="KE">Kenya</option>}</select></label><label className="field"><span>Business type</span><select value={form.businessType} onChange={(event) => update('businessType', event.target.value)}>{businessTypes.length ? businessTypes.map((type) => <option key={type} value={type}>{type}</option>) : <option value="retail">Retail</option>}</select></label></div>
          <label className="field"><span>Plan</span><select required value={form.planId} onChange={(event) => update('planId', event.target.value)}><option value="" disabled>Select a plan</option>{plans.map((plan) => <option key={plan.code} value={plan.code}>{plan.name} · {plan.price.amount === 0 ? 'Free' : `${plan.price.currency} ${plan.price.amount}/${plan.price.interval}`}</option>)}</select></label>
          <div className="field-grid two-col"><label className="field"><span>Password</span><input required minLength={8} type="password" value={form.password} onChange={(event) => update('password', event.target.value)} autoComplete="new-password" /></label><label className="field"><span>Confirm password</span><input required minLength={8} type="password" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} autoComplete="new-password" /></label></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button large" type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Create account'}</button>
        </form>
        <button className="landing-text-button" type="button" onClick={() => onNavigate('login')}>Already have an account? Sign in</button>
      </div>
    </div>
  );
}
