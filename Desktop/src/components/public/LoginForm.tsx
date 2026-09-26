import { FormEvent, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { isEmail, isNonEmpty } from '@/utils/validation';
import { ROUTES } from '@/utils/constants';

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, scope } = useAuth();
  const { toast } = useNotifications();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isEmail(email)) {
      setError('Enter a valid email');
      return;
    }
    if (!isNonEmpty(password)) {
      setError('Password is required');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      toast({ type: 'success', message: 'Welcome back' });

      const from = (location.state as { from?: string })?.from;
      const target =
        scope === 'pending'
          ? ROUTES.pending
          : from || ROUTES.app;
      navigate(target);
    } catch (err) {
      setError((err as { message?: string }).message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField label="Email" required>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          icon={<Mail size={16} />}
        />
      </FormField>

      <FormField label="Password" required>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            icon={<LockKeyhole size={16} />}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-muted transition hover:bg-elevated hover:text-fg"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </FormField>

      <div className="flex justify-end">
        <Link
          to={ROUTES.forgotPassword}
          className="text-xs text-brand-600 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 dark:text-red-300 dark:bg-red-500/10 dark:border-red-500/30">
          {error}
        </div>
      )}

      <Button type="submit" fullWidth loading={submitting} size="lg">
        Log in
      </Button>

      <p className="text-sm text-muted text-center">
        Don't have an account?{' '}
        <Link to={ROUTES.register} className="text-brand-600 hover:underline">
          Get started
        </Link>
      </p>
    </form>
  );
}