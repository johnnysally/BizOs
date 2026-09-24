import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/auth';
import type { AppPage } from '../../routes/AppRoutes';

export function Login({ onNavigate }: { onNavigate: (page: AppPage) => void }) {
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try { await login(email, password); onNavigate('dashboard'); } catch { /* context exposes the message */ } finally { setSubmitting(false); }
  };

  const forgotPassword = async () => {
    if (!email.trim()) return;
    try { await authApi.forgotPassword(email); setForgotSent(true); } catch { setForgotSent(false); }
  };

  return (
    <div className="auth-shell">
      <div className="auth-panel">
        <h2>Welcome back</h2>
        <p>Sign in to continue to your workspace.</p>
        <form className="auth-form" onSubmit={submit}>
          <label className="field"><span>Email</span><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label>
          <label className="field"><span>Password</span><input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          {forgotSent && <p className="form-success" role="status">Reset instructions sent to your email.</p>}
          <button className="primary-button large" type="submit" disabled={submitting || loading}>{submitting ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <button className="landing-text-button" type="button" onClick={() => void forgotPassword()}>Forgot password?</button>
        <button className="landing-text-button" type="button" onClick={() => onNavigate('landing')}>Back to BizOs</button>
      </div>
    </div>
  );
}
