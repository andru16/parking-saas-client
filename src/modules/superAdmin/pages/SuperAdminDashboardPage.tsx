import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchAdminDashboard } from '@/modules/superAdmin/api';

function StatCard({
  label,
  value,
  hint,
  to,
}: {
  label: string;
  value: string | number;
  hint?: string;
  to?: string;
}) {
  const content = (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

function formatMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
}

export function SuperAdminDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['super-admin', 'dashboard'],
    queryFn: async () => (await fetchAdminDashboard()).data.metrics,
  });

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando métricas...</p>;
  }

  if (isError || !data) {
    return <p className="text-sm text-red-600">No se pudieron cargar las métricas.</p>;
  }

  const subs = data.subscriptions;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Dashboard de plataforma</h2>
          <p className="mt-1 text-sm text-slate-500">
            Indicadores globales · {data.region} · {data.currency}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/subscriptions"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Ver alertas
          </Link>
          <Link
            to="/admin/organizations"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Ver organizaciones
          </Link>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Suscripciones</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Trials activos"
            value={subs.trialsActive ?? data.organizations.trial}
            to="/admin/subscriptions?filter=trials_expiring"
          />
          <StatCard
            label="Trials por vencer"
            value={subs.trialsExpiringSoon ?? 0}
            hint="Próximos 7 días"
            to="/admin/subscriptions"
          />
          <StatCard
            label="MRR estimado"
            value={formatMoney(data.estimatedMrr, data.currency)}
          />
          <StatCard
            label="Suscripciones activas"
            value={subs.active}
            hint="Planes de pago vigentes"
          />
          <StatCard
            label="Suspendidas"
            value={subs.suspended ?? data.organizations.suspended}
            to="/admin/subscriptions"
          />
          <StatCard
            label="Vencidas / gracia"
            value={`${subs.expired ?? 0} / ${subs.gracePeriod ?? 0}`}
            hint="Expired · Grace period"
            to="/admin/subscriptions"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Organizaciones</h3>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Orgs activas" value={data.organizations.active} />
          <StatCard label="En trial" value={data.organizations.trial} />
          <StatCard label="Suspendidas" value={data.organizations.suspended} />
          <StatCard
            label="Pend. verificación"
            value={data.organizations.pendingVerification}
          />
          <StatCard
            label="Por vencer (30d)"
            value={subs.expiringSoon}
            hint="Trials + activas"
          />
          <StatCard label="Nuevos registros (mes)" value={data.newRegistrationsThisMonth} />
          <StatCard label="Usuarios totales" value={data.totalUsers} />
          <StatCard label="Tickets procesados" value={data.totalTicketsProcessed} />
        </div>
      </div>
    </div>
  );
}
