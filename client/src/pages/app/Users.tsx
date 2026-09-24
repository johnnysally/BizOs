import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  UserPlus,
  Mail,
  Ban,
  RotateCcw,
  KeyRound,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { classNames } from '@/utils/classNames';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { userApi } from '@/api/users';
import { formatDateTime, relativeTime } from '@/utils/date';
import { ROLES, ROLES_LIST } from '@/utils/constants';
import type { User, CreateStaffInput, UserRole } from '@/types/auth';

const PAGE_SIZE = 20;

const STATUS_VARIANT: Record<
  string,
  'success' | 'warning' | 'danger' | 'neutral'
> = {
  active: 'success',
  invited: 'warning',
  pending_user: 'warning',
  suspended: 'danger',
  rejected: 'danger',
};

export default function Users() {
  const { user: me } = useAuth();
  const { toast } = useNotifications();

  const [items, setItems] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selected, setSelected] = useState<User | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userApi.list({
        page,
        limit: PAGE_SIZE,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });
      setItems(res.data);
      setTotal(res.meta.total);
      if (res.data.length && !selected) setSelected(res.data[0]);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Could not load users',
      });
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, statusFilter, toast, selected]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter, statusFilter]);

  const filtered = useMemo(() => {
    if (!debouncedSearch.trim()) return items;
    const q = debouncedSearch.trim().toLowerCase();
    return items.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone || '').includes(q)
    );
  }, [items, debouncedSearch]);

  const stats = useMemo(() => {
    const active = items.filter((u) => u.status === 'active').length;
    const invited = items.filter((u) => u.status === 'invited').length;
    const suspended = items.filter((u) => u.status === 'suspended').length;
    return { active, invited, suspended };
  }, [items]);

  const changeRole = async (target: User, role: UserRole) => {
    if (target.role === role) return;
    setBusy(target._id);
    try {
      const updated = await userApi.updateRole(target._id, role);
      setItems((cur) => cur.map((u) => (u._id === updated._id ? updated : u)));
      if (selected?._id === updated._id) setSelected(updated);
      toast({ type: 'success', message: `${target.fullName} is now ${role}` });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Role change failed',
      });
    } finally {
      setBusy(null);
    }
  };

  const deactivate = async (target: User) => {
    if (!window.confirm(`Suspend ${target.fullName}?`)) return;
    setBusy(target._id);
    try {
      await userApi.deactivate(target._id);
      toast({ type: 'success', message: 'User suspended' });
      load();
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Suspend failed',
      });
    } finally {
      setBusy(null);
    }
  };

  const resetPassword = async (target: User) => {
    if (!window.confirm(`Reset password for ${target.fullName}? They'll get a new temp password by email.`)) return;
    setBusy(target._id);
    try {
      await userApi.resetPassword(target._id);
      toast({ type: 'success', message: 'Password reset — email sent' });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Reset failed',
      });
    } finally {
      setBusy(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-fg">Team</h1>
          <p className="text-sm text-muted mt-1">
            {total} user{total === 1 ? '' : 's'}
          </p>
        </div>
        <Button icon={<UserPlus size={16} />} onClick={() => setInviteOpen(true)}>
          Invite user
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Total" value={String(total)} hint="Team accounts" />
        <Kpi label="Active" value={String(stats.active)} hint="Enabled" />
        <Kpi label="Invited" value={String(stats.invited)} hint="Awaiting acceptance" />
        <Kpi label="Suspended" value={String(stats.suspended)} hint="Disabled" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-4">
        <Card padded={false}>
          <div className="flex flex-col sm:flex-row gap-2 p-4 border-b border-border">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone..."
              icon={<Search size={14} />}
            />
            <Select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All roles' },
                ...ROLES_LIST.map((r) => ({ value: r, label: r })),
              ]}
            />
            <Select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              options={[
                { value: '', label: 'All statuses' },
                { value: 'active', label: 'Active' },
                { value: 'invited', label: 'Invited' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-elevated border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted">User</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Last active</th>
                  <th className="px-4 py-3 text-left font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center">
                      <Spinner />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-16 text-center text-muted">
                      No users match these filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr
                      key={u._id}
                      onClick={() => setSelected(u)}
                      className={classNames(
                        'hover:bg-elevated cursor-pointer transition',
                        selected?._id === u._id && 'bg-brand-50 dark:bg-brand-500/10'
                      )}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-fg truncate">{u.fullName}</p>
                        <p className="text-xs text-muted mt-0.5 truncate">{u.email}</p>
                      </td>
                      <td className="px-4 py-3 text-muted capitalize">{u.role}</td>
                      <td className="px-4 py-3 text-muted">
                        {u.lastLoginAt ? relativeTime(u.lastLoginAt) : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={STATUS_VARIANT[u.status] || 'neutral'}>
                          {u.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-elevated text-sm">
              <span className="text-muted">
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {selected && (
          <Card padded={false}>
            <div className="p-5 border-b border-border">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-fg truncate">
                    {selected.fullName}
                  </h2>
                  <p className="text-xs text-muted mt-1 truncate">
                    {selected.email}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[selected.status] || 'neutral'}>
                  {selected.status}
                </Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={<KeyRound size={12} />}
                  loading={busy === selected._id}
                  onClick={() => resetPassword(selected)}
                >
                  Reset password
                </Button>
                {selected.status !== 'suspended' && selected._id !== me?.id && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={<Ban size={12} />}
                    loading={busy === selected._id}
                    onClick={() => deactivate(selected)}
                  >
                    Suspend
                  </Button>
                )}
              </div>
            </div>

            <div className="p-5 space-y-4">
              <FormField label="Role">
                <Select
                  value={selected.role}
                  onChange={(e) => changeRole(selected, e.target.value as UserRole)}
                  options={ROLES_LIST.map((r) => ({ value: r, label: r }))}
                  disabled={selected._id === me?.id}
                />
              </FormField>

              <div className="space-y-2 text-sm">
                <Row label="Phone" value={selected.phone || '—'} />
                <Row
                  label="Last login"
                  value={
                    selected.lastLoginAt
                      ? formatDateTime(selected.lastLoginAt)
                      : 'Never'
                  }
                />
                <Row
                  label="Joined"
                  value={selected.createdAt ? formatDateTime(selected.createdAt) : '—'}
                />
                {selected.mustChangePassword && (
                  <Row label="Password" value="Must change on next login" />
                )}
              </div>
            </div>
          </Card>
        )}
      </div>

      {inviteOpen && (
        <InviteModal
          onClose={() => setInviteOpen(false)}
          onCreated={() => {
            setInviteOpen(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-xl font-semibold text-fg mt-1 truncate">{value}</p>
      <p className="text-xs text-muted mt-1">{hint}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted">{label}</span>
      <span className="text-fg text-right truncate">{value}</span>
    </div>
  );
}

function InviteModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const { toast } = useNotifications();
  const [form, setForm] = useState<CreateStaffInput>({
    fullName: '',
    email: '',
    phone: '',
    role: ROLES.CASHIER,
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.fullName.trim() || !form.email.trim()) {
      toast({ type: 'error', message: 'Name and email are required' });
      return;
    }
    setSaving(true);
    try {
      await userApi.invite({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone?.trim() || undefined,
        role: form.role,
      });
      toast({ type: 'success', message: 'Invitation sent' });
      onCreated();
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Invite failed',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Invite team member"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={submit}>
            Send invitation
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Full name" required>
          <Input
            autoFocus
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </FormField>
        <FormField label="Email" required>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </FormField>
        <FormField label="Phone">
          <Input
            value={form.phone || ''}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+254..."
          />
        </FormField>
        <FormField label="Role">
          <Select
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value as UserRole })
            }
            options={ROLES_LIST.map((r) => ({ value: r, label: r }))}
          />
        </FormField>
        <p className="text-xs text-muted">
          They'll receive an email with a temporary password. They must change it
          on first login.
        </p>
      </div>
    </Modal>
  );
}