import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';
import { classNames } from '@/utils/classNames';

interface Props {
  defaultLabel: string;
  itemCount: number;
  total: string;
  saving: boolean;
  onConfirm: (payload: { label: string; note: string }) => void;
  onClose: () => void;
}

export function HoldSaleModal({
  defaultLabel,
  itemCount,
  total,
  saving,
  onConfirm,
  onClose,
}: Props) {
  const [label, setLabel] = useState(defaultLabel);
  const [note, setNote] = useState('');

  return (
    <Modal
      open
      onClose={onClose}
      title="Hold sale"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={saving}
            onClick={() => onConfirm({ label: label.trim() || 'Walk-in', note: note.trim() })}
          >
            Hold sale
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-md bg-elevated px-3 py-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Items</span>
            <span className="text-fg">{itemCount}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-muted">Total</span>
            <span className="text-fg font-medium">{total}</span>
          </div>
        </div>

        <FormField
          label="Label"
          hint="A short name so you can find it later"
        >
          <Input
            autoFocus
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Mary or Walk-in"
          />
        </FormField>

        <FormField label="Note" hint="Optional context about this sale">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Customer will return in 10 minutes"
          />
        </FormField>

        <p className={classNames('text-xs text-muted')}>
          Held sales expire automatically after 24 hours.
        </p>
      </div>
    </Modal>
  );
}