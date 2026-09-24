import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { storage } from '@/utils/storage';
import { ROUTES } from '@/utils/constants';
import { Button } from '@/components/ui/Button';

const KEY = 'bizos_cookie_consent';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = storage.get(KEY);
    if (!choice) setVisible(true);
  }, []);

  const accept = () => {
    storage.set(KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    storage.set(KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-40 animate-slide-in-right">
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-4">
        <p className="text-sm text-slate-700">
          We use cookies to keep you signed in and improve the app. Read our{' '}
          <Link
            to={ROUTES.legal('privacy')}
            className="text-brand-600 underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={decline}>
            Decline
          </Button>
          <Button size="sm" onClick={accept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}