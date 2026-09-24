import { useCallback, useEffect, useState } from 'react';
import { Mail, RefreshCw, X, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/context/NotificationContext';
import { invitationApi } from '@/api/invitations';
import { formatDateTime, relativeTime } from '@/utils/date';
import type { UserInvitation } from '@/types/auth';

export default function Invitations() {
  const { toast } = useNotifications();
  const [items, setItems] = useState<UserInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await invitationApi.list({ page: 1, limit: 50 });
      setItems(res.data);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Could not load invitations',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const resend = async (inv: UserInvitation) => {
    setBusy(inv._id);
    try {
      await invitationApi.resend(inv._id);
      toast({ type: 'success', message: `Invitation resent to ${inv.email}` });
      load();
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Resend failed',
      });
    } finally {
      setBusy(null);
    }
  };

  const cancel = async (inv: UserInvitation) => {
    if (!window.confirm(`Cancel invitation for ${inv.email}?`)) return;
    setBusy(inv._id);
    try {
      await invitationApi.cancel(inv._id);
      setItems((cur) => cur.filter((i) => i._id !== inv._id));
      toast({ type: 'success', message: 'Invitation cancelled' });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Cancel failed',
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-fg">Invitations</h1>
        <p className="text-sm text-muted mt-1">
          Pending invitations to join this workspace.
        </p>
      </div>

      <Card padded={false}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Mail size={32} className="mx-auto text-muted opacity-40 mb-3" />
            <p className="text-sm text-muted">No pending invitations.</p>
            <p className="text-xs text-muted mt-1">
              Invite team members from the Users page.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((inv) => {
              const expired = new Date(inv.expiresAt) < new Date();
              return (
                <li key={inv._id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-fg truncate">
                        {inv.email}
                      </p>
                      <Badge variant="brand">{inv.role}</Badge>
                      {expired && <Badge variant="danger">Expired</Badge>}
                    </div>
                    <p className="text-xs text-muted mt-1">
                      Invited {relativeTime(inv.createdAt)} · Expires{' '}
                      {formatDateTime(inv.expiresAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<RefreshCw size={12} />}
                      loading={busy === inv._id}
                      onClick={() => resend(inv)}
                    >
                      Resend
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<X size={12} />}
                      loading={busy === inv._id}
                      onClick={() => cancel(inv)}
                    >
                      Cancel
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}