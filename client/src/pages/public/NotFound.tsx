import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-20 px-4">
      <div className="text-center max-w-md">
        <FileQuestion size={48} className="text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-slate-900">Page not found</h1>
        <p className="text-sm text-slate-500 mt-2">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link to={ROUTES.home} className="inline-block mt-6">
          <Button>Back to home</Button>
        </Link>
      </div>
    </div>
  );
}