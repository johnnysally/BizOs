import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { isEmail } from '@/utils/validation';
import { ROUTES } from '@/utils/constants';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isEmail(email)) {
      setError('Enter a valid email');
      return;
    }

    setSubmitting(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError((err as { message?: string }).message || 'Could not send reset link');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 size={40} className="text-green-600 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-900">
          Check your email
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          If an account exists for <strong>{email}</strong>, we've sent a reset link.
          The link expires in 1 hour.
        </p>
        <Link to={ROUTES.login} className="inline-block mt-6">
          <Button variant="outline">Back to login</Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-slate-600">
        Enter your email and we'll send you a link to reset your password.
      </p>

      <FormField label="Email" required error={error || undefined}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </FormField>

      <Button type="submit" fullWidth loading={submitting} size="lg">
        Send reset link
      </Button>

      <p className="text-sm text-slate-500 text-center">
        <Link to={ROUTES.login} className="text-brand-600 hover:underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}