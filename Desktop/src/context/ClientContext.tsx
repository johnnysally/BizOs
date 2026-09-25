import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { settingsApi } from '@/api/settings';
import { useAuth } from './AuthContext';
import type { TenantSettings, TenantPaymentMethod } from '@/api/settings';

interface ClientValue {
  settings: TenantSettings;
  paymentMethods: TenantPaymentMethod[];
  enabledPaymentMethods: string[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  load: () => Promise<void>;
  update: (patch: Partial<TenantSettings>) => Promise<void>;
  reset: () => void;
}

const ClientContext = createContext<ClientValue | null>(null);

export function ClientProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, scope } = useAuth();
  const [settings, setSettings] = useState<TenantSettings>({});
  const [paymentMethods, setPaymentMethods] = useState<TenantPaymentMethod[]>([]);
  const [enabledPaymentMethods, setEnabledPaymentMethods] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  const load = async () => {
    setStatus('loading');
    try {
      const data = await settingsApi.get();
      setSettings(data.settings || {});
      setPaymentMethods(data.paymentMethods || []);
      setEnabledPaymentMethods(data.enabledPaymentMethods || []);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  };

  const update = async (patch: Partial<TenantSettings>) => {
    const next = await settingsApi.update(patch);
    setSettings((prev) => ({ ...prev, ...next }));
  };

  const reset = () => {
    setSettings({});
    setPaymentMethods([]);
    setEnabledPaymentMethods([]);
    setStatus('idle');
  };

  useEffect(() => {
    if (authStatus === 'authenticated' && scope === 'active') {
      load();
    } else if (authStatus === 'unauthenticated') {
      reset();
    }
  }, [authStatus, scope]);

  return (
    <ClientContext.Provider
      value={{
        settings,
        paymentMethods,
        enabledPaymentMethods,
        status,
        load,
        update,
        reset,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export const useClient = () => {
  const ctx = useContext(ClientContext);
  if (!ctx) throw new Error('useClient must be used within ClientProvider');
  return ctx;
};