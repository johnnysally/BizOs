import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { authApi } from '@/api/auth';
import {
  setTokenGetter,
  setOnTokenRefreshed,
  setOnUnauthorized,
} from '@/api/axios';
import type {
  User,
  Tenant,
  Plan,
  LatestInvoice,
  RegisterInput,
  AuthScope,
} from '@/types/auth';

type Status = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthValue {
  user: User | null;
  tenant: Tenant | null;
  plan: Plan | null;
  invoice: LatestInvoice | null;
  accessToken: string | null;
  scope: AuthScope | null;
  status: Status;
  error: string | null;
  register: (input: RegisterInput) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

const USER_KEY = 'bizos_client_user';
const REFRESH_KEY = 'bizos_client_refresh';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [invoice, setInvoice] = useState<LatestInvoice | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [scope, setScope] = useState<AuthScope | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTokenGetter(() => accessToken);
  }, [accessToken]);

  useEffect(() => {
    setOnTokenRefreshed((token) => setAccessToken(token));
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null);
      setTenant(null);
      setPlan(null);
      setInvoice(null);
      setAccessToken(null);
      setScope(null);
      setStatus('unauthenticated');
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(REFRESH_KEY);
    });
  }, []);

  const register = async (input: RegisterInput) => {
    setStatus('loading');
    setError(null);
    try {
      const data = await authApi.register(input);
      setUser(data.user);
      setTenant(data.tenant);
      setPlan(data.plan);
      setInvoice(null);
      setAccessToken(data.accessToken);
      setScope('pending');
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      localStorage.setItem(REFRESH_KEY, data.refreshToken);
      setStatus('authenticated');
    } catch (e) {
      const msg = (e as { message?: string }).message || 'Registration failed';
      setError(msg);
      setStatus('unauthenticated');
      throw e;
    }
  };

  const login = async (email: string, password: string) => {
    setStatus('loading');
    setError(null);
    try {
      const data = await authApi.login(email, password);
      setUser(data.user);
      setTenant(data.tenant);
      setPlan(data.plan);
      setInvoice(data.invoice || null);
      setAccessToken(data.accessToken);
      setScope(data.scope);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      localStorage.setItem(REFRESH_KEY, data.refreshToken);
      setStatus('authenticated');
    } catch (e) {
      const msg = (e as { message?: string }).message || 'Login failed';
      setError(msg);
      setStatus('unauthenticated');
      throw e;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    } finally {
      setUser(null);
      setTenant(null);
      setPlan(null);
      setInvoice(null);
      setAccessToken(null);
      setScope(null);
      setStatus('unauthenticated');
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
  };

  const refresh = async () => {
    const rt = localStorage.getItem(REFRESH_KEY);
    if (!rt) throw new Error('No refresh token');
    const data = await authApi.refresh(rt);
    setAccessToken(data.accessToken);
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
  };

  const hydrate = async () => {
    const cached = localStorage.getItem(USER_KEY);
    const rt = localStorage.getItem(REFRESH_KEY);

    if (!rt) {
      setStatus('unauthenticated');
      return;
    }

    setStatus('loading');

    try {
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setUser(parsed);
        } catch {
          /* ignore malformed cache */
        }
      }

      const refreshed = await authApi.refresh(rt);
      setAccessToken(refreshed.accessToken);
      localStorage.setItem(REFRESH_KEY, refreshed.refreshToken);

      const me = await authApi.me();
      setUser(me.user);
      setTenant(me.tenant);
      setPlan(me.plan);
      setInvoice(me.invoice || null);
      setScope(me.scope);
      localStorage.setItem(USER_KEY, JSON.stringify(me.user));
      setStatus('authenticated');
    } catch {
      setUser(null);
      setTenant(null);
      setPlan(null);
      setInvoice(null);
      setAccessToken(null);
      setScope(null);
      setStatus('unauthenticated');
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
  };

  useEffect(() => {
    hydrate();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        plan,
        invoice,
        accessToken,
        scope,
        status,
        error,
        register,
        login,
        logout,
        hydrate,
        refresh,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};