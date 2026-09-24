import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useTheme } from '@/context/ThemeContext';
import { useClient } from '@/context/ClientContext';
import { useNotifications } from '@/context/NotificationContext';
import { classNames } from '@/utils/classNames';

export function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const { settings, update, status, load } = useClient();
  const { toast } = useNotifications();

  const [compactMode, setCompactMode] = useState(false);
  const [sounds, setSounds] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading' || status === 'idle') return;
    if (!settings || Object.keys(settings).length === 0) {
      load();
      return;
    }
    setCompactMode(settings.compactMode ?? false);
    setSounds(settings.sounds ?? true);
  }, [settings, status, load]);

  const toggleSetting = async (key: 'compactMode' | 'sounds', value: boolean) => {
    setSaving(key);
    if (key === 'compactMode') setCompactMode(value);
    else setSounds(value);
    try {
      await update({ [key]: value });
      toast({ type: 'success', message: 'Preference updated' });
    } catch (e) {
      if (key === 'compactMode') setCompactMode(!value);
      else setSounds(!value);
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Update failed',
      });
    } finally {
      setSaving(null);
    }
  };

  const themes = [
    { id: 'light' as const, label: 'Light', icon: Sun },
    { id: 'dark' as const, label: 'Dark', icon: Moon },
    { id: 'system' as const, label: 'System', icon: Monitor },
  ];

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card title="Theme" description="Choose a theme for this device.">
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => {
            const Icon = t.icon;
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={classNames(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border transition',
                  active
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10'
                    : 'border-border bg-surface hover:bg-elevated'
                )}
              >
                <Icon
                  size={20}
                  className={active ? 'text-brand-600 dark:text-brand-400' : 'text-muted'}
                />
                <span
                  className={classNames(
                    'text-sm font-medium',
                    active ? 'text-brand-700 dark:text-brand-300' : 'text-fg'
                  )}
                >
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title="Layout & behaviour" description="Fine-tune how the workspace feels.">
        <div className="divide-y divide-border">
          <label className="flex items-center justify-between gap-4 py-3 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-fg">Compact tables</p>
              <p className="text-xs text-muted mt-0.5">
                Fit more rows into sales, inventory and reports.
              </p>
            </div>
            <Toggle
              value={compactMode}
              busy={saving === 'compactMode'}
              onChange={(v) => toggleSetting('compactMode', v)}
            />
          </label>

          <label className="flex items-center justify-between gap-4 py-3 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-fg">POS sounds</p>
              <p className="text-xs text-muted mt-0.5">
                Play a subtle sound when items are added at the register.
              </p>
            </div>
            <Toggle
              value={sounds}
              busy={saving === 'sounds'}
              onChange={(v) => toggleSetting('sounds', v)}
            />
          </label>
        </div>
      </Card>
    </div>
  );
}

function Toggle({
  value,
  busy,
  onChange,
}: {
  value: boolean;
  busy: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onChange(!value)}
      className={classNames(
        'relative inline-flex h-6 w-11 items-center rounded-full transition shrink-0 disabled:opacity-50',
        value ? 'bg-brand-600' : 'bg-slate-300 dark:bg-slate-700'
      )}
      aria-pressed={value}
    >
      <span
        className={classNames(
          'inline-block h-4 w-4 transform rounded-full bg-white transition',
          value ? 'translate-x-6' : 'translate-x-1'
        )}
      />
    </button>
  );
}