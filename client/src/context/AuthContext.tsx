import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from '../api/auth';
import { setOnTokenRefreshed, setOnUnauthorized, setTokenGetter } from '../api/axios';

const ACCESS_TOKEN_KEY = 'bizos_client_access';
const REFRESH_TOKEN_KEY = 'bizos_client_refresh';

export type AuthUser = { id?: string; _id?: string; email: string; fullName?: string; name?: string; role?: string; [key: string]: unknown };
export type AuthSession = { user: AuthUser; tenant?: Record<string, unknown> | null; plan?: Record<string, unknown> | null; scope?: string };

type AuthContextValue = {
	session: AuthSession | null;
	loading: boolean;
	error: string;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	clearError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function saveTokens(accessToken?: string, refreshToken?: string) {
	if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
	if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearTokens() {
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [session, setSession] = useState<AuthSession | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		setTokenGetter(() => localStorage.getItem(ACCESS_TOKEN_KEY));
		setOnTokenRefreshed((token) => localStorage.setItem(ACCESS_TOKEN_KEY, token));
		setOnUnauthorized(() => { clearTokens(); setSession(null); });

		if (!localStorage.getItem(ACCESS_TOKEN_KEY)) {
			setLoading(false);
			return undefined;
		}

		void authApi.me()
			.then((data) => setSession(data))
			.catch(() => clearTokens())
			.finally(() => setLoading(false));

		return undefined;
	}, []);

	const login = async (email: string, password: string) => {
		setError('');
		try {
			const data = await authApi.login(email, password);
			saveTokens(data.accessToken, data.refreshToken);
			const current = await authApi.me();
			setSession(current);
		} catch (reason) {
			setError(reason instanceof Error ? reason.message : 'Unable to sign in. Check your details and try again.');
			throw reason;
		}
	};

	const logout = async () => {
		try { await authApi.logout(); } finally { clearTokens(); setSession(null); }
	};

	return <AuthContext.Provider value={{ session, loading, error, login, logout, clearError: () => setError('') }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) throw new Error('useAuth must be used inside AuthProvider');
	return context;
}
