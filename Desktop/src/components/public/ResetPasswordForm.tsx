import { FormEvent, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { PasswordStrength } from './PasswordStrength';
import { isStrongPassword } from '@/utils/validation';
import { ROUTES } from '@/utils/constants';

export function ResetPasswordForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="text-center py-8">
        <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-900">
          Invalid reset link
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          This link is missing or malformed.
        </p>
        <Link to={ROUTES.forgotPassword} className="inline-block mt-4">
          <Button variant="outline">Request a new link</Button>
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 size={40} className="text-green-600 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-900">
          Password updated
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          You can now log in with your new password.
        </p>
        <Link to={ROUTES.login} className="inline-block mt-4">
          <Button>Go to login</Button>
        </Link>
      </div>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isStrongPassword(password)) {
      setError('Min 8 chars, 1 letter, 1 number');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate(ROUTES.login), 3000);
    } catch (err) {
      setError((err as { message?: string }).message || 'Could not reset password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField label="New password" required>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </FormField>

      <PasswordStrength password={password} />

      <FormField label="Confirm password" required>
        <Input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </FormField>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <Button type="submit" fullWidth loading={submitting} size="lg">
        Reset password
      </Button>

      <p className="text-sm text-slate-500 text-center">
        <Link to={ROUTES.login} className="text-brand-600 hover:underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}