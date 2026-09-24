import { VerifyForm } from '@/components/public/VerifyForm';

export default function Verify() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-6 sm:p-8">
        <VerifyForm />
      </div>
    </div>
  );
}