import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '@/api/auth';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';

export function VerifyForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate(ROUTES.login), 3000);
      })
      .catch((e) => {
        setStatus('error');
        setMessage(e.message || 'Could not verify email');
      });
  }, [token, navigate]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500">Verifying your email…</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <CheckCircle2 size={40} className="text-green-600 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-slate-900">
          Email verified
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Redirecting you to login…
        </p>
        <Link to={ROUTES.login} className="inline-block mt-4">
          <Button variant="outline">Go to login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
      <h2 className="text-lg font-semibold text-slate-900">
        Verification failed
      </h2>
      <p className="text-sm text-slate-500 mt-2">{message}</p>
      <Link to={ROUTES.login} className="inline-block mt-4">
        <Button variant="outline">Back to login</Button>
      </Link>
    </div>
  );
}