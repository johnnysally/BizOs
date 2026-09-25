const STEPS = [
  {
    n: 1,
    title: 'Create your account',
    description: 'Enter your business details and pick a plan.',
  },
  {
    n: 2,
    title: 'Pay once or subscribe',
    description: 'Pay via M-Pesa, card, or bank transfer.',
  },
  {
    n: 3,
    title: 'Start selling',
    description: 'Log in and ring up your first sale.',
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
            Up and running in minutes
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Three steps from signup to your first sale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center">
              <div className="w-12 h-12 rounded-full bg-brand-600 text-white text-lg font-bold flex items-center justify-center mx-auto mb-4">
                {s.n}
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">
                {s.title}
              </h3>
              <p className="text-sm text-slate-600">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}