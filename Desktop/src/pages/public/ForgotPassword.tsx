import { ForgotPasswordForm } from '@/components/public/ForgotPasswordForm';

export default function ForgotPassword() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Reset your password
          </h1>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}