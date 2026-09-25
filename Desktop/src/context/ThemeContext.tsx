import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { storage } from '@/utils/storage';

type Theme = 'light' | 'dark' | 'system';

interface ThemeValue {
  theme: Theme;
  resolved: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

const STORAGE_KEY = 'bizos_theme';

const ThemeContext = createContext<ThemeValue | null>(null);

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme(): Theme {
  const stored = storage.get(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);
  const [resolved, setResolved] = useState<'light' | 'dark'>(
    theme === 'system' ? getSystemTheme() : theme
  );

  useEffect(() => {
    const apply = (next: 'light' | 'dark') => {
      const root = document.documentElement;
      root.classList.toggle('dark', next === 'dark');
      root.style.colorScheme = next;
      setResolved(next);
    };

    if (theme === 'system') {
      apply(getSystemTheme());

      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => apply(mq.matches ? 'dark' : 'light');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }

    apply(theme);
  }, [theme]);

  useEffect(() => {
    storage.set(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (next: Theme) => setThemeState(next);

  const toggle = () => {
    setThemeState((current) => {
      const effective = current === 'system' ? getSystemTheme() : current;
      return effective === 'dark' ? 'light' : 'dark';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, resolved, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};