import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  MessageCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useNotifications } from '@/context/NotificationContext';
import { useClient } from '@/context/ClientContext';
import { insightApi, InsightTodayResponse } from '@/api/insights';
import { reportApi, TopProduct } from '@/api/reports';
import { formatCurrency } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { ROUTES } from '@/utils/constants';
import type { DailyMetric } from '@/types/insight';

export default function Insights() {
  const { settings } = useClient();
  const { toast } = useNotifications();
  const currency = (settings.currency as string) || 'KES';

  const [loading, setLoading] = useState(true);
  const [today, setToday] = useState<InsightTodayResponse | null>(null);
  const [week, setWeek] = useState<DailyMetric[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      insightApi.today().catch(() => ({ latestMetric: null, lowStock: [] })),
      insightApi.range({ period: 'week' }).catch(() => []),
      reportApi.topProducts({ period: 'week', limit: 5 }).catch(() => []),
    ])
      .then(([t, w, p]) => {
        if (!active) return;
        setToday(t);
        setWeek(w);
        setTopProducts(p);
      })
      .catch(() => {
        if (!active) return;
        toast({ type: 'error', message: 'Could not load insights' });
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [toast]);

  const metrics = useMemo(() => {
    const latest = today?.latestMetric;
    const totalSales = week.reduce((sum, m) => sum + (m.totalSales || 0), 0);
    const totalTx = week.reduce((sum, m) => sum + (m.totalTransactions || 0), 0);
    const avgBasket = totalTx > 0 ? totalSales / totalTx : 0;
    const lowStock = today?.lowStock || [];
    return {
      todaySales: latest?.totalSales || 0,
      todayTx: latest?.totalTransactions || 0,
      todayAvg: latest?.avgBasket || 0,
      weekSales: totalSales,
      weekTx: totalTx,
      weekAvg: avgBasket,
      lowStockCount: lowStock.length,
    };
  }, [today, week]);

  const chartMax = useMemo(() => {
    const max = Math.max(...week.map((m) => m.totalSales || 0), 1);
    return max;
  }, [week]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  const latestDate = today?.latestMetric?.date;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-brand-600 dark:text-brand-400" />
            <h1 className="text-2xl font-semibold text-fg">Insights</h1>
          </div>
          <p className="text-sm text-muted mt-1">
            {latestDate
              ? `Latest metrics from ${formatDate(latestDate, 'long')}`
              : 'Metrics will appear once your scheduler runs for the first time.'}
          </p>
        </div>
        <Link to={ROUTES.chat}>
          <Button icon={<MessageCircle size={14} />}>Ask AI assistant</Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          label="Sales today"
          value={formatCurrency(metrics.todaySales, currency)}
          hint={`${metrics.todayTx} transactions`}
          icon={<DollarSign size={18} />}
        />
        <Kpi
          label="7-day revenue"
          value={formatCurrency(metrics.weekSales, currency)}
          hint={`${metrics.weekTx} transactions`}
          icon={<TrendingUp size={18} />}
        />
        <Kpi
          label="Avg basket"
          value={formatCurrency(Math.round(metrics.weekAvg), currency)}
          hint="This week"
          icon={<ShoppingCart size={18} />}
        />
        <Kpi
          label="Low stock"
          value={String(metrics.lowStockCount)}
          hint={metrics.lowStockCount > 0 ? 'Needs attention' : 'All good'}
          icon={<AlertTriangle size={18} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card title="Revenue trend" description="Last 7 days">
            {week.length === 0 ? (
              <p className="text-sm text-muted py-12 text-center">
                No daily metrics yet. The scheduler generates them overnight.
              </p>
            ) : (
              <div className="flex items-end justify-between gap-2 h-48 pt-4">
                {week.map((m) => {
                  const pct = ((m.totalSales || 0) / chartMax) * 100;
                  return (
                    <div
                      key={m._id || m.date}
                      className="flex-1 flex flex-col items-center gap-2 min-w-0"
                    >
                      <div className="w-full flex-1 flex items-end">
                        <div
                          className="w-full rounded-t bg-brand-500 dark:bg-brand-400 transition"
                          style={{ height: `${Math.max(2, pct)}%` }}
                          title={formatCurrency(m.totalSales || 0, currency)}
                        />
                      </div>
                      <span className="text-[10px] text-muted truncate">
                        {new Date(m.date).toLocaleDateString('en-KE', {
                          weekday: 'short',
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <Card title="Top products" description="This week">
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted py-12 text-center">
              No sales recorded this week yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((p, i) => (
                <li key={p._id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 text-xs font-semibold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-fg truncate">{p.name}</p>
                    <p className="text-xs text-muted">
                      {p.qty} sold · {formatCurrency(p.revenue, currency)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {today && today.lowStock.length > 0 && (
        <Card
          title={`Low stock (${today.lowStock.length})`}
          description="Products below their reorder threshold"
          actions={
            <Link to={ROUTES.inventory}>
              <Button size="sm" variant="ghost">
                View inventory
              </Button>
            </Link>
          }
        >
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {today.lowStock.slice(0, 10).map((p) => (
              <li
                key={p._id}
                className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2"
              >
                <span className="text-sm text-fg truncate">{p.name}</span>
                <Badge variant={p.stock === 0 ? 'danger' : 'warning'}>
                  {p.stock} left
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted">{label}</p>
          <p className="text-xl font-semibold text-fg mt-1 truncate">{value}</p>
          <p className="text-xs text-muted mt-1">{hint}</p>
        </div>
        <div className="shrink-0 w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}