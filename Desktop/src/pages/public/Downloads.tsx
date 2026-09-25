import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { CTASection } from '@/components/public/CTASection';
import { Spinner } from '@/components/ui/Spinner';
import { api } from '@/api/axios';

interface DownloadItem {
  id: string;
  name: string;
  version?: string | null;
  link: string;
  platform: string;
  description?: string | null;
}

const PLATFORM_LABEL: Record<string, string> = {
  template: 'Template',
  web: 'Web',
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  android: 'Android',
  ios: 'iOS',
  api: 'API',
  other: 'Other',
};

export default function Downloads() {
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ data: DownloadItem[] }>('/public/site/downloads')
      .then((r) => setItems(r.data.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="bg-gradient-to-b from-slate-50 to-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900">
            Resources & Downloads
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Templates and tools to help you get the most out of BizOS.
          </p>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-12">
              No downloads available right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((f) => (
                <a
                  key={f.id}
                  href={f.link}
                  target={f.link.startsWith('http') ? '_blank' : undefined}
                  rel={f.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  download={f.link.startsWith('/') ? f.name : undefined}
                  className="p-5 border border-slate-200 rounded-lg hover:border-brand-300 transition flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Download size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-slate-900 text-sm">{f.name}</p>
                      {f.version && (
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          v{f.version}
                        </span>
                      )}
                    </div>
                    {f.description && (
                      <p className="text-xs text-slate-500">{f.description}</p>
                    )}
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 mt-2">
                      {PLATFORM_LABEL[f.platform] || f.platform}
                    </p>
                  </div>
                  <Download size={16} className="text-slate-400 shrink-0 mt-1" />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection />
    </>
  );
}