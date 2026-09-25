import { useMemo, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { classNames } from '@/utils/classNames';
import { useNotifications } from '@/context/NotificationContext';
import { customerApi } from '@/api/customers';
import type { Customer } from '@/types/customer';

interface Props {
  customers: Customer[];
  selected: Customer | null;
  onSelect: (c: Customer | null) => void;
  onCreate: (c: Customer) => void;
  onClose: () => void;
}

export function CustomerPicker({
  customers,
  selected,
  onSelect,
  onCreate,
  onClose,
}: Props) {
  const { toast } = useNotifications();
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        (c.phone || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q)
    );
  }, [customers, search]);

  const create = async () => {
    if (!form.name.trim()) {
      toast({ type: 'error', message: 'Name is required' });
      return;
    }
    setSaving(true);
    try {
      const created = await customerApi.create({
        name: form.name,
        phone: form.phone || undefined,
      });
      onCreate(created);
      onSelect(created);
    } catch (e) {
      toast({
        type: 'error',
        message: (e as { message?: string }).message || 'Create failed',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Select customer"
      size="md"
      footer={
        creating ? (
          <>
            <Button variant="outline" onClick={() => setCreating(false)}>
              Back
            </Button>
            <Button loading={saving} onClick={create}>
              Create
            </Button>
          </>
        ) : undefined
      }
    >
      {creating ? (
        <div className="space-y-4">
          <FormField label="Name" required>
            <Input
              autoFocus
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </FormField>
          <FormField label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+254..."
            />
          </FormField>
        </div>
      ) : (
        <>
          <Input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or phone..."
            icon={<Search size={14} />}
          />

          <div className="mt-3 -mx-5 max-h-80 overflow-y-auto scrollbar-thin">
            <button
              type="button"
              onClick={() => onSelect(null)}
              className={classNames(
                'w-full text-left px-5 py-3 hover:bg-elevated transition border-b border-border',
                !selected && 'bg-brand-50 dark:bg-brand-500/10'
              )}
            >
              <p className="text-sm font-medium text-fg">Walk-in customer</p>
              <p className="text-xs text-muted mt-0.5">
                No customer account attached
              </p>
            </button>

            {filtered.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted text-center">
                No customers found.
              </p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id || c._id}
                  type="button"
                  onClick={() => onSelect(c)}
                  className={classNames(
                    'w-full text-left px-5 py-3 hover:bg-elevated transition border-b border-border last:border-b-0',
                    selected &&
                      (selected.id || selected._id) === (c.id || c._id) &&
                      'bg-brand-50 dark:bg-brand-500/10'
                  )}
                >
                  <p className="text-sm font-medium text-fg">{c.name}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {c.phone || c.email || 'No contact'}
                  </p>
                </button>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => setCreating(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-dashed border-border text-sm text-muted hover:text-fg hover:border-brand-500 transition"
          >
            <Plus size={14} />
            Create new customer
          </button>
        </>
      )}
    </Modal>
  );
}