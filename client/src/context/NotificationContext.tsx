import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { randomId } from '@/utils/format';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface NotificationValue {
  toasts: Toast[];
  toast: (opts: { type: ToastType; message: string; duration?: number }) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

const NotificationContext = createContext<NotificationValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clear = useCallback(() => setToasts([]), []);

  const toast = useCallback(
    ({
      type,
      message,
      duration = 4000,
    }: {
      type: ToastType;
      message: string;
      duration?: number;
    }) => {
      const id = randomId();
      setToasts((prev) => [...prev, { id, type, message, duration }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  return (
    <NotificationContext.Provider value={{ toasts, toast, dismiss, clear }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
};