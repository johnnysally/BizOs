import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';

export default function ServerError() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-20 px-4">
      <div className="text-center max-w-md">
        <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-slate-900">
          Something went wrong
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          We couldn't load this page. Try again or head back home.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => window.location.reload()}>Reload</Button>
          <Link to={ROUTES.home}>
            <Button variant="outline">Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}