import { useEffect, useState } from 'react';
import { Save, KeyRound, User as UserIcon, Shield } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { classNames } from '@/utils/classNames';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { api } from '@/api/axios';
import { formatDateTime } from '@/utils/date';

type Tab = 'personal' | 'security';

export default function Profile() {
  const { user, hydrate } = useAuth();
  const { toast } = useNotifications();

  const [tab, setTab] = useState<Tab>('personal');
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const saveProfile = async () => {
    if (!fullName.trim()) {
      toast({ type: 'error', message: 'Name is required' });
      return;
    }
    setSavingProfile(true);
    try {
      await api.patch('/client/auth/me', {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });
      await hydrate();
      toast({ type: 'success', message: 'Profile updated' });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Update failed',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast({ type: 'error', message: 'Both passwords are required' });
      return;
    }
    if (newPassword.length < 8) {
      toast({ type: 'error', message: 'New password must be at least 8 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    setSavingPassword(true);
    try {
      await api.post('/client/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast({ type: 'success', message: 'Password changed' });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Change failed',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  const initials = user.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-fg">Profile</h1>
        <p className="text-sm text-muted mt-1">
          Manage your account details and password.
        </p>
      </div>

      <Card padded={false}>
        <div className="p-5 border-b border-border flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-brand-600 text-white flex items-center justify-center text-lg font-semibold shrink-0">
            {initials || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-semibold text-fg truncate">
              {user.fullName}
            </p>
            <p className="text-sm text-muted truncate">{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <Badge variant="brand">{user.role}</Badge>
              <Badge variant={user.status === 'active' ? 'success' : 'warning'}>
                {user.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setTab('personal')}
            className={classNames(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition',
              tab === 'personal'
                ? 'text-brand-700 dark:text-brand-300 border-b-2 border-brand-600'
                : 'text-muted hover:text-fg'
            )}
          >
            <UserIcon size={14} />
            Personal
          </button>
          <button
            type="button"
            onClick={() => setTab('security')}
            className={classNames(
              'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition',
              tab === 'security'
                ? 'text-brand-700 dark:text-brand-300 border-b-2 border-brand-600'
                : 'text-muted hover:text-fg'
            )}
          >
            <Shield size={14} />
            Security
          </button>
        </div>

        {tab === 'personal' && (
          <div className="p-5 space-y-4">
            <FormField label="Full name" required>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </FormField>
            <FormField label="Email" hint="Contact support to change your email">
              <Input value={user.email} disabled />
            </FormField>
            <FormField label="Phone">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+254..."
              />
            </FormField>
            <FormField label="Role" hint="Only an owner can change your role">
              <Input value={user.role} disabled />
            </FormField>

            <div className="flex justify-end">
              <Button
                icon={<Save size={14} />}
                loading={savingProfile}
                onClick={saveProfile}
              >
                Save changes
              </Button>
            </div>
          </div>
        )}

        {tab === 'security' && (
          <div className="p-5 space-y-4">
            <FormField label="Current password" required>
              <Input
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </FormField>
            <FormField
              label="New password"
              hint="At least 8 characters"
              required
            >
              <Input
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </FormField>
            <FormField label="Confirm new password" required>
              <Input
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </FormField>

            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={() => setShowPasswords((v) => !v)}
              />
              Show passwords
            </label>

            <div className="flex justify-end">
              <Button
                icon={<KeyRound size={14} />}
                loading={savingPassword}
                onClick={changePassword}
              >
                Change password
              </Button>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted">
                Password changes are logged. You'll get a confirmation email when
                it completes.
              </p>
            </div>
          </div>
        )}
      </Card>

      <Card title="Account" description="Read-only information about your account.">
        <div className="space-y-2 text-sm">
          <Row label="Role" value={user.role} />
          <Row label="Status" value={user.status} />
          <Row
            label="Last login"
            value={user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}
          />
          {user.createdAt && (
            <Row label="Joined" value={formatDateTime(user.createdAt)} />
          )}
        </div>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="text-fg capitalize">{value}</span>
    </div>
  );
}