import { Link } from 'react-router-dom';
import { ExternalLink, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/utils/constants';
import { formatCurrency } from '@/utils/currency';

const FEATURE_LABELS: Record<string, string> = {
  aiInsights: 'AI insights',
  multiLocation: 'Multi-location',
  api: 'API access',
  prioritySupport: 'Priority support',
  customDomain: 'Custom domain',
};

export function BillingTab() {
  const { plan, invoice, tenant } = useAuth();

  return (
    <div className="space-y-4">
      <Card
        title="Current plan"
        description="Your subscription and workspace limits."
        actions={
          <Link to={ROUTES.pricing} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" icon={<ExternalLink size={14} />}>
              Manage plan
            </Button>
          </Link>
        }
      >
        {!plan ? (
          <p className="text-sm text-muted">No plan information available.</p>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-fg">{plan.name}</h3>
              <Badge variant="brand">{plan.code}</Badge>
            </div>

            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
                Limits
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <LimitRow label="Owners" value={plan.limits.maxOwners} />
                <LimitRow label="Managers" value={plan.limits.maxManagers} />
                <LimitRow label="Cashiers" value={plan.limits.maxCashiers} />
                <LimitRow label="Products" value={plan.limits.maxProducts} />
                <LimitRow
                  label="Tx / month"
                  value={plan.limits.maxTransactionsPerMonth}
                  unlimited={plan.limits.maxTransactionsPerMonth === 0}
                />
                <LimitRow label="AI calls / day" value={plan.limits.maxAiCallsPerDay} />
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">
                Features
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(plan.features).map(([key, enabled]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    {enabled ? (
                      <Check size={14} className="text-green-600 dark:text-green-400 shrink-0" />
                    ) : (
                      <X size={14} className="text-muted shrink-0" />
                    )}
                    <span className={enabled ? 'text-fg' : 'text-muted'}>
                      {FEATURE_LABELS[key] || key}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card title="Latest invoice" description="Most recent subscription charge.">
        {!invoice ? (
          <p className="text-sm text-muted">
            No invoices on record for {tenant?.name || 'this workspace'}.
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-fg font-mono">{invoice.number}</p>
              <p className="text-xs text-muted mt-1">
                Status: {invoice.status}
                {invoice.dueDate && ` · Due ${invoice.dueDate}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-fg">
                {formatCurrency(invoice.amountDue, invoice.currency)}
              </p>
              {invoice.amountDue > 0 && (
                <a
                  href={invoice.payUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Pay invoice →
                </a>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function LimitRow({
  label,
  value,
  unlimited,
}: {
  label: string;
  value: number;
  unlimited?: boolean;
}) {
  return (
    <div className="bg-elevated rounded-md px-3 py-2">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-semibold text-fg mt-0.5">
        {unlimited ? 'Unlimited' : value.toLocaleString()}
      </p>
    </div>
  );
}