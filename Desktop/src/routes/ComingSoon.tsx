import { Construction } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/utils/constants';

interface Props {
  title?: string;
  description?: string;
}

export default function ComingSoon({
  title = 'Coming soon',
  description = "We're still building this page. Check back shortly.",
}: Props) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="max-w-md mx-auto bg-surface border border-border rounded-lg p-8 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center mb-4">
          <Construction
            size={28}
            className="text-brand-600 dark:text-brand-400"
          />
        </div>

        <h1 className="text-xl font-semibold text-fg">{title}</h1>
        <p className="text-sm text-muted mt-2">{description}</p>

        <div className="mt-6 flex justify-center">
          <Link to={ROUTES.app}>
            <Button variant="outline">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}