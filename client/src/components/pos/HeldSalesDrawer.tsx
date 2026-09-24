import { useEffect, useState } from 'react';
import { Clock, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { useNotifications } from '@/context/NotificationContext';
import { heldSalesApi } from '@/api/heldSales';
import { formatCurrency } from '@/utils/currency';
import { relativeTime } from '@/utils/date';
import type { HeldSale } from '@/types/heldSale';

interface Props {
  currency: string;
  onResume: (held: HeldSale) => void;
  onClose: () => void;
}

export function HeldSalesDrawer({ currency, onResume, onClose }: Props) {
  const { toast } = useNotifications();
  const [items, setItems] = useState<HeldSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await heldSalesApi.list();
      setItems(list);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Could not load held sales',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resume = async (held: HeldSale) => {
    setBusy(held._id);
    try {
      const full = await heldSalesApi.resume(held._id);
      onResume(full);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Could not resume',
      });
    } finally {
      setBusy(null);
    }
  };

  const remove = async (held: HeldSale) => {
    if (!window.confirm(`Delete held sale "${held.label}"?`)) return;
    setBusy(held._id);
    try {
      await heldSalesApi.remove(held._id);
      setItems((cur) => cur.filter((h) => h._id !== held._id));
      toast({ type: 'success', message: 'Held sale deleted' });
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Delete failed',
      });
    } finally {
      setBusy(null);
    }
  };

  const totalOf = (held: HeldSale) =>
    held.items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <Modal open onClose={onClose} title="Held sales" size="lg">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-12">
          <Clock size={32} className="mx-auto text-muted opacity-40 mb-3" />
          <p className="text-sm text-muted">No held sales.</p>
          <p className="text-xs text-muted mt-1">
            Held sales you create will appear here for 24 hours.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border -mx-5">
          {items.map((held) => (
            <li
              key={held._id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-fg truncate">
                    {held.label}
                  </p>
                  {held.resumedAt && (
                    <Badge variant="warning">Resumed</Badge>
                  )}
                </div>
                <p className="text-xs text-muted mt-1">
                  {held.items.length} item{held.items.length === 1 ? '' : 's'} ·{' '}
                  {formatCurrency(totalOf(held), currency)} ·{' '}
                  {relativeTime(held.createdAt)}
                </p>
                {held.note && (
                  <p className="text-xs text-muted mt-1 italic truncate">
                    {held.note}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Trash2 size={12} />}
                  loading={busy === held._id}
                  onClick={() => remove(held)}
                >
                  Delete
                </Button>
                <Button
                  size="sm"
                  icon={<Play size={12} />}
                  loading={busy === held._id}
                  onClick={() => resume(held)}
                >
                  Resume
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}