import { useEffect, useState } from 'react';
import {
  Server,
  Database,
  Zap,
  Mail,
  MessageSquare,
  HardDrive,
  DatabaseBackup,
  RefreshCw,
  Activity,
  CheckCircle2,
  Cpu,
  Gauge,
  MemoryStick,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { healthApi } from '@/api/health';
import type { HealthResponse } from '@/types/health';
import type { HealthMetricsResponse } from '@/types/health';
import { bytes } from '@/utils/format';

function StatusDot({ status }: { status: string }) {
  const ok = ['up', 'enabled', 'connected', 'healthy'].includes(status);
  const warn = status === 'disabled' || status === 'degraded';
  const cls = ok ? 'bg-green-500' : warn ? 'bg-slate-400' : 'bg-red-500';
  return <span className={`inline-block w-2 h-2 rounded-full ${cls}`} />;
}

export default function Health() {
  const [data, setData] = useState<HealthResponse | null>(null);
  const [metrics, setMetrics] = useState<HealthMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [health, runtime] = await Promise.all([healthApi.get(), healthApi.metrics()]);
      setData(health);
      setMetrics(runtime);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-end sm:justify-between sm:p-6">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700"><Activity size={12} /> Live monitoring</div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">System health</h1>
          <p className="mt-1 text-sm text-slate-500">
            {data.overall.up}/{data.overall.total} services up · updated {new Date(data.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-3"><span className="hidden items-center gap-1.5 text-xs font-medium text-emerald-600 sm:inline-flex"><span className="h-2 w-2 rounded-full bg-emerald-500" /> {data.status}</span><Button variant="outline" icon={<RefreshCw size={14} />} onClick={load} loading={loading}>Refresh</Button></div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <RuntimeMetric icon={<Gauge size={18} />} label="Service availability" value={`${data.overall.up}/${data.overall.total}`} detail="healthy services" />
        <RuntimeMetric icon={<Cpu size={18} />} label="Runtime memory" value={`${metrics?.memory.heapUsedMb ?? data.server.memoryHeapUsedMb} MB`} detail={`${metrics?.memory.heapTotalMb ?? 0} MB heap capacity`} />
        <RuntimeMetric icon={<MemoryStick size={18} />} label="Process uptime" value={metrics?.uptimeHuman || data.server.uptimeHuman} detail={`${metrics?.cpu.cores ?? data.server.cpuCores} CPU cores available`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="Server">
          <div className="space-y-2 text-sm">
            <Row label="Status"><Badge variant="success" dot>{data.server.status}</Badge></Row>
            <Row label="Node">{data.server.node}</Row>
            <Row label="Platform">{data.server.platform}</Row>
            <Row label="Uptime">{data.server.uptimeHuman}</Row>
            <Row label="CPU">{data.server.cpuCores} cores</Row>
            <Row label="Memory">{data.server.memoryRssMb} MB</Row>
          </div>
        </Card>

        <Card title="Database">
          <div className="space-y-2 text-sm">
            <Row label="Status"><StatusDot status={data.database.status} /> <span className="ml-1">{data.database.status}</span></Row>
            <Row label="Type">{data.database.type}</Row>
            <Row label="Database">{data.database.database || '—'}</Row>
            <Row label="Collections">{data.database.collections}</Row>
            <Row label="Documents">{data.database.documents.toLocaleString()}</Row>
          </div>
        </Card>

        <Card title="Redis">
          <div className="space-y-2 text-sm">
            <Row label="Status"><StatusDot status={data.redis.status} /> <span className="ml-1">{data.redis.status}</span></Row>
            <Row label="Enabled">{data.redis.enabled ? 'Yes' : 'No'}</Row>
            {data.redis.memoryUsed && <Row label="Memory">{data.redis.memoryUsed}</Row>}
            {data.redis.message && <Row label="Message">{data.redis.message}</Row>}
          </div>
        </Card>

        <Card title="Email">
          <div className="space-y-2 text-sm">
            <Row label="Status"><Badge variant={data.email.enabled ? 'success' : 'neutral'} dot>{data.email.status}</Badge></Row>
            <Row label="Provider">{data.email.provider}</Row>
            <Row label="From">{data.email.fromMasked || '—'}</Row>
            <Row label="Sender">{data.email.sender || '—'}</Row>
          </div>
        </Card>

        <Card title="SMS">
          <div className="space-y-2 text-sm">
            <Row label="Status"><Badge variant={data.sms.enabled ? 'success' : 'neutral'} dot>{data.sms.status}</Badge></Row>
            <Row label="Provider">{data.sms.provider}</Row>
            <Row label="Sender">{data.sms.sender || '—'}</Row>
          </div>
        </Card>

        <Card title="Storage">
          <div className="space-y-2 text-sm">
            <Row label="Status"><Badge variant={data.storage.enabled ? 'success' : 'neutral'} dot>{data.storage.status}</Badge></Row>
            <Row label="Type">{data.storage.type}</Row>
            <Row label="Cloud">{data.storage.cloud || '—'}</Row>
          </div>
        </Card>

        <Card title="Backups">
          <div className="space-y-2 text-sm">
            <Row label="Type">{data.backups.type}</Row>
            <Row label="Count">{data.backups.count}</Row>
            {data.backups.lastBackupAt && <Row label="Last">{new Date(data.backups.lastBackupAt).toLocaleString()}</Row>}
            {data.backups.lastBackupSize && <Row label="Size">{bytes(data.backups.lastBackupSize)}</Row>}
          </div>
        </Card>

        <Card title="CORS origins" className="md:col-span-2">
          <ul className="text-sm space-y-1">
            {data.cors.map((o) => (
              <li key={o} className="font-mono text-xs text-slate-600">{o}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center gap-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900 text-right">{children}</span>
    </div>
  );
}

function RuntimeMetric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600">{icon}</span>
      <div className="min-w-0"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 truncate text-lg font-semibold text-slate-900">{value}</p><p className="mt-0.5 truncate text-[11px] text-slate-400">{detail}</p></div>
      <CheckCircle2 className="ml-auto shrink-0 text-emerald-500" size={16} />
    </div>
  );
}