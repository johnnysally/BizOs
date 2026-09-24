import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { legalApi } from '@/api/legal';
import type { LegalType, LegalCurrentPublic } from '@/types/legal';

interface Props {
  open: boolean;
  onClose: () => void;
  type: LegalType;
}

export function LegalModal({ open, onClose, type }: Props) {
  const [doc, setDoc] = useState<LegalCurrentPublic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || doc) return;
    setLoading(true);
    setError(null);
    legalApi
      .getCurrent(type)
      .then(setDoc)
      .catch((e) => setError(e.message || 'Could not load document'))
      .finally(() => setLoading(false));
  }, [open, type, doc]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={doc?.title || type.toUpperCase()}
      size="xl"
    >
      {loading && (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {doc && (
        <div className="prose prose-slate max-w-none text-sm whitespace-pre-wrap">
          {doc.content}
        </div>
      )}
    </Modal>
  );
}