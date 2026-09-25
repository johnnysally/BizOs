import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { legalApi } from '@/api/legal';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { LEGAL_TYPES } from '@/utils/constants';
import type { LegalType, LegalCurrentPublic } from '@/types/legal';

export default function Legal() {
  const { type = 'terms' } = useParams();
  const [doc, setDoc] = useState<LegalCurrentPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!LEGAL_TYPES.includes(type as LegalType)) {
      setError('Unknown legal document');
      setLoading(false);
      return;
    }
    setLoading(true);
    legalApi
      .getCurrent(type as LegalType)
      .then(setDoc)
      .catch((e) => setError(e.message || 'Could not load document'))
      .finally(() => setLoading(false));
  }, [type]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-block mb-6">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} />}>
            Back home
          </Button>
        </Link>

        {error ? (
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold text-slate-900">
              Document not found
            </h1>
            <p className="text-sm text-slate-500 mt-2">{error}</p>
          </div>
        ) : (
          <article>
            <header className="mb-8 pb-6 border-b border-slate-200">
              <h1 className="text-3xl font-bold text-slate-900">{doc?.title}</h1>
              <p className="text-xs text-slate-500 mt-2">
                Version {doc?.version}
                {doc?.effectiveAt && ` · Effective ${doc.effectiveAt}`}
              </p>
            </header>
            <div className="prose prose-slate max-w-none whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
              {doc?.content}
            </div>
          </article>
        )}
      </div>
    </div>
  );
}