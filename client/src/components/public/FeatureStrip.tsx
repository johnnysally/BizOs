import { Check } from 'lucide-react';

const ITEMS = [
  'Works offline',
  'M-Pesa ready',
  'AI insights',
  'Multi-location',
];

export function FeatureStrip() {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-sm text-slate-600"
            >
              <Check size={14} className="text-green-600" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}