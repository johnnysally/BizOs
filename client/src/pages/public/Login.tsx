import { Link } from 'react-router-dom';
import { LoginForm } from '@/components/public/LoginForm';
import { ROUTES } from '@/utils/constants';

export default function Login() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-brand-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-4">
            B
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">
            Log in to your BizOS account
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          By logging in you agree to our{' '}
          <Link to={ROUTES.legal('terms')} className="text-brand-600 hover:underline">
            Terms
          </Link>
          .
        </p>
      </div>
    </div>
  );
}