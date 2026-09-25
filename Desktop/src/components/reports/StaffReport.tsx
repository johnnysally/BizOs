import { useEffect, useMemo, useState } from 'react';
import { Printer, Download } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/context/NotificationContext';
import { useClient } from '@/context/ClientContext';
import { reportApi, StaffPerformance } from '@/api/reports';
import { formatCurrency } from '@/utils/currency';
import { printHtml } from '@/utils/printHtml';
import { reportsHtml, staffSection } from '@/utils/reportsHtml';

const RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'quarter', label: 'This quarter' },
];

export function StaffReport() {
  const { settings } = useClient();
  const { toast } = useNotifications();
  const currency = (settings.currency as string) || 'KES';

  const [period, setPeriod] = useState('month');
  const [loading, setLoading] = useState(true);
  const [staff, setStaff] = useState<StaffPerformance[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    reportApi
      .staff({ period })
      .then((res) => {
        if (active) setStaff(res);
      })
      .catch(() => toast({ type: 'error', message: 'Could not load staff report' }))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [period, toast]);

  const summary = useMemo(() => {
    const totalSales = staff.reduce((s, x) => s + x.totalSales, 0);
    const totalTx = staff.reduce((s, x) => s + x.transactions, 0);
    return { totalSales, totalTx, count: staff.length };
  }, [staff]);

  const rows = useMemo(
    () =>
      staff.map((s) => [
        s.name || 'Unknown',
        String(s.transactions),
        formatCurrency(s.totalSales, currency),
        formatCurrency(
          s.transactions > 0 ? Math.round(s.totalSales / s.transactions) : 0,
          currency
        ),
      ]),
    [staff, currency]
  );

  const rangeLabel = RANGES.find((r) => r.value === period)?.label || period;

  const print = () => {
    printHtml(
      reportsHtml({
        meta: {
          businessName: 'BizOS',
          currency,
          rangeLabel,
          generatedAt: new Date().toISOString(),
        },
        sections: [
          {
            kind: 'summary',
            title: 'Team summary',
            rows: [
              { label: 'Team members', value: String(summary.count) },
              { label: 'Transactions', value: String(summary.totalTx) },
              { label: 'Total sales', value: formatCurrency(summary.totalSales, currency) },
            ],
          },
          staffSection({
            rows: staff.map((s) => ({
              name: s.name || 'Unknown',
              totalSales: s.totalSales,
              transactions: s.transactions,
            })),
            currency,
          }),
        ],
      }),
      { title: `Staff report — ${rangeLabel}`, width: 900, height: 700 }
    );
  };

  const exportCsv = () => {
    const header = ['Team member', 'Transactions', 'Total sales', 'Avg order'];
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `staff-report-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ type: 'success', message: 'Staff report exported' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          options={RANGES}
          className="sm:w-48"
        />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" icon={<Printer size={14} />} onClick={print}>
            Print
          </Button>
          <Button size="sm" variant="outline" icon={<Download size={14} />} onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Team members" value={String(summary.count)} hint="Active cashiers" />
        <Kpi label="Transactions" value={String(summary.totalTx)} hint={rangeLabel} />
        <Kpi label="Total sales" value={formatCurrency(summary.totalSales, currency)} hint={rangeLabel} />
        <Kpi
          label="Avg per member"
          value={formatCurrency(
            summary.count > 0 ? Math.round(summary.totalSales / summary.count) : 0,
            currency
          )}
          hint="Sales per person"
        />
      </div>

      <Card padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-elevated border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted">Team member</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Transactions</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Total sales</th>
                <th className="px-4 py-3 text-right font-medium text-muted">Avg order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center text-muted">
                    No staff activity in this period.
                  </td>
                </tr>
              ) : (
                staff.map((s) => (
                  <tr key={s._id} className="hover:bg-elevated">
                    <td className="px-4 py-3 text-fg font-medium">
                      {s.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-right text-fg">{s.transactions}</td>
                    <td className="px-4 py-3 text-right text-fg">
                      {formatCurrency(s.totalSales, currency)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted">
                      {formatCurrency(
                        s.transactions > 0
                          ? Math.round(s.totalSales / s.transactions)
                          : 0,
                        currency
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-xl font-semibold text-fg mt-1 truncate">{value}</p>
      <p className="text-xs text-muted mt-1">{hint}</p>
    </div>
  );
}