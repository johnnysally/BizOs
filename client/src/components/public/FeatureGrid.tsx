import {
  ShoppingCart,
  Package,
  Users,
  Truck,
  FileText,
  Sparkles,
} from 'lucide-react';

const FEATURES = [
  {
    icon: ShoppingCart,
    title: 'Point of Sale',
    description: 'Ring up sales in seconds. Cash, card, M-Pesa.',
  },
  {
    icon: Package,
    title: 'Inventory',
    description: "Know what's in stock. Get alerts before it runs out.",
  },
  {
    icon: Users,
    title: 'Staff & Roles',
    description: 'Owner, manager, cashier — each with the right access.',
  },
  {
    icon: Truck,
    title: 'Suppliers & POs',
    description: 'Order from suppliers. Track deliveries and costs.',
  },
  {
    icon: FileText,
    title: 'Invoicing',
    description: 'Bill customers and get paid faster.',
  },
  {
    icon: Sparkles,
    title: 'AI Insights',
    description: 'Ask questions. Get answers from your own data.',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="scroll-mt-20 py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Everything your business needs
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            One platform instead of five. No integrations to maintain.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-6 rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-sm transition"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-600">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}