import { useEffect, useState } from 'react';
import { Download, FileText, Sparkles, ArrowRight } from 'lucide-react';
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

const QUICK_ACTIONS = [
  { title: 'Templates', value: 'Ready to use', icon: FileText },
  { title: 'Playbooks', value: 'Setup guidance', icon: Sparkles },
  { title: 'Exports', value: 'Built for sharing', icon: Download },
];

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
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-slate-50 to-white py-16 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),transparent_32%)]" />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-600 dark:text-brand-300">
            Resources hub
          </span>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50">
            Resources & Downloads
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Templates, guides, and business tools to help your team get more from BizOS.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {QUICK_ACTIONS.map(({ title, value, icon: Icon }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-left shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/70">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                  <Icon size={18} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{title}</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-50">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
              No downloads available right now.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {items.map((f) => (
                <a
                  key={f.id}
                  href={f.link}
                  target={f.link.startsWith('http') ? '_blank' : undefined}
                  rel={f.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                  download={f.link.startsWith('/') ? f.name : undefined}
                  className="group flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-300">
                    <Download size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{f.name}</p>
                      {f.version && (
                        <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                          v{f.version}
                        </span>
                      )}
                    </div>

                    {f.description && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{f.description}</p>
                    )}

                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500">
                        {PLATFORM_LABEL[f.platform] || f.platform}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-300">
                        Download
                        <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
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