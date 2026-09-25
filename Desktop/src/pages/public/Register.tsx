import { Link } from 'react-router-dom';
import { RegisterForm } from '@/components/public/RegisterForm';
import { ROUTES } from '@/utils/constants';

export default function Register() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Create your BizOS account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Already registered?{' '}
            <Link to={ROUTES.login} className="text-brand-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}