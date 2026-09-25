import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useClient } from '@/context/ClientContext';
import { reportApi, SalesSummary, TopProduct } from '@/api/reports';
import { insightApi, InsightTodayResponse } from '@/api/insights';
import { saleApi } from '@/api/sales';
import { productApi } from '@/api/products';
import { currency } from '@/utils/currency';
import { formatDateTime, relativeTime } from '@/utils/date';
import { ROUTES, ROLES } from '@/utils/constants';
import type { Sale } from '@/types/sale';

export default function Dashboard() {
  const { user, tenant } = useAuth();
  const { settings } = useClient();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [lowStock, setLowStock] = useState(0);
  const [insights, setInsights] = useState<InsightTodayResponse | null>(null);
  const [productCount, setProductCount] = useState(0);

  const curr = (settings.currency as string) || 'KES';
  const role = user?.role || ROLES.CASHIER;
  const isManager = role === ROLES.OWNER || role === ROLES.MANAGER;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const tasks: Promise<unknown>[] = [
          saleApi.list({ page: 1, limit: 5 }).then((r) => setRecentSales(r.data)),
        ];

        if (isManager) {
          tasks.push(
            reportApi
              .salesSummary({ period: 'today' })
              .then((s) => setSummary(s))
              .catch(() => {}),
            reportApi
              .topProducts({ period: 'week', limit: 5 })
              .then((p) => setTopProducts(p))
              .catch(() => {}),
            insightApi
              .today()
              .then((i) => {
                setInsights(i);
                setLowStock(i.lowStock.length);
              })
              .catch(() => {}),
            productApi
              .list({ page: 1, limit: 1, active: true })
              .then((r) => setProductCount(r.meta.total))
              .catch(() => {})
          );
        }

        await Promise.all(tasks);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isManager]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-fg truncate">
            Welcome back, {user?.fullName?.split(' ')[0]}
          </h1>
          <p className="text-sm text-muted mt-1 truncate">
            {tenant?.name} · {formatDateTime(new Date())}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link to={ROUTES.pos}>
            <Button icon={<ShoppingCart size={16} />}>Start sale</Button>
          </Link>
        </div>
      </div>

      {/* KPI cards — manager+ only */}
      {isManager && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Sales today"
            value={summary ? currency(summary.totalSales, curr) : currency(0, curr)}
            hint={
              summary
                ? `${summary.totalTransactions} transaction${summary.totalTransactions === 1 ? '' : 's'}`
                : 'No sales yet'
            }
            icon={<DollarSign size={18} />}
          />
          <StatCard
            label="Top products"
            value={topProducts.length > 0 ? String(topProducts.length) : '0'}
            hint="This week"
            icon={<TrendingUp size={18} />}
          />
          <StatCard
            label="Products"
            value={productCount.toLocaleString()}
            hint="Active catalog"
            icon={<Package size={18} />}
          />
          <StatCard
            label="Low stock"
            value={lowStock.toLocaleString()}
            hint={lowStock > 0 ? 'Needs attention' : 'All good'}
            icon={<AlertTriangle size={18} />}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent sales */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title="Recent sales"
            actions={
              <Link to={ROUTES.sales}>
                <Button size="sm" variant="ghost">
                  View all
                </Button>
              </Link>
            }
            padded={false}
          >
            {recentSales.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted">
                No sales yet. Start selling to see activity here.
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {recentSales.map((sale) => (
                  <li key={sale._id}>
                    <Link
                      to={ROUTES.saleDetail(sale._id)}
                      className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-elevated transition"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-fg truncate">
                          {sale.saleNumber}
                        </p>
                        <p className="text-xs text-muted">
                          {sale.items.length} item{sale.items.length === 1 ? '' : 's'} ·{' '}
                          {relativeTime(sale.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant={sale.voided ? 'danger' : 'success'}>
                          {sale.voided ? 'voided' : 'paid'}
                        </Badge>
                        <span className="text-sm font-semibold text-fg">
                          {currency(sale.total, sale.currency || curr)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Top products */}
          {isManager && topProducts.length > 0 && (
            <Card title="Top products this week">
              <ul className="space-y-3">
                {topProducts.map((p, i) => (
                  <li key={p._id} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 text-xs font-semibold flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-fg truncate">
                        {p.name}
                      </p>
                      <p className="text-xs text-muted">
                        {p.qty} sold · {currency(p.revenue, curr)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* AI insights */}
          {isManager && insights?.latestMetric && (
            <Card
              title="Today's insight"
              actions={
                <Link to={ROUTES.insights}>
                  <Button size="sm" variant="ghost">
                    Open
                  </Button>
                </Link>
              }
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles
                    size={16}
                    className="text-brand-600 dark:text-brand-400"
                  />
                  <span className="font-medium text-fg">
                    {currency(insights.latestMetric.totalSales, curr)} sales
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted">Transactions</p>
                    <p className="font-semibold text-fg">
                      {insights.latestMetric.totalTransactions}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted">Avg basket</p>
                    <p className="font-semibold text-fg">
                      {currency(insights.latestMetric.avgBasket, curr)}
                    </p>
                  </div>
                </div>
                <Link to={ROUTES.chat}>
                  <Button size="sm" variant="outline" fullWidth>
                    Ask AI assistant
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Low stock */}
          {isManager && insights && insights.lowStock.length > 0 && (
            <Card
              title={`Low stock (${insights.lowStock.length})`}
              actions={
                <Link to={ROUTES.inventory}>
                  <Button size="sm" variant="ghost">
                    View
                  </Button>
                </Link>
              }
            >
              <ul className="space-y-2">
                {insights.lowStock.slice(0, 5).map((p) => (
                  <li
                    key={p._id}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="truncate text-fg">{p.name}</span>
                    <span
                      className={
                        p.stock === 0
                          ? 'text-red-600 dark:text-red-400 font-medium'
                          : 'text-amber-600 dark:text-amber-400 font-medium'
                      }
                    >
                      {p.stock} left
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Quick actions */}
          <Card title="Quick actions">
            <div className="space-y-2">
              <Link to={ROUTES.pos} className="block">
                <Button variant="outline" fullWidth icon={<ShoppingCart size={14} />}>
                  New sale
                </Button>
              </Link>
              {isManager && (
                <>
                  <Link to={ROUTES.productNew} className="block">
                    <Button variant="outline" fullWidth icon={<Package size={14} />}>
                      Add product
                    </Button>
                  </Link>
                  <Link to={ROUTES.customers} className="block">
                    <Button variant="outline" fullWidth icon={<Users size={14} />}>
                      Customers
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </Card>

          {/* Cashier hint */}
          {role === ROLES.CASHIER && (
            <Card>
              <p className="text-sm text-muted">
                You're logged in as a cashier. Tap POS to start selling, or
                view your sales for today.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}