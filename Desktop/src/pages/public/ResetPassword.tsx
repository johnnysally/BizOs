import { ResetPasswordForm } from '@/components/public/ResetPasswordForm';

export default function ResetPassword() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Set a new password
          </h1>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8">
          <ResetPasswordForm />
        </div>
      </div>
    </div>
  );
}