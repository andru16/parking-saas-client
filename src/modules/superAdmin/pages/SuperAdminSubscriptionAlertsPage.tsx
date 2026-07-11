import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import {
  fetchSubscriptionAlerts,
  fetchSchedulerStatus,
  runSubscriptionScheduler,
  type SubscriptionAlertFilter,
} from '@/modules/superAdmin/api';

const FILTERS: Array<{ id: SubscriptionAlertFilter | 'all'; label: string; countKey?: string }> = [
  { id: 'all', label: 'Todas las alertas' },
  { id: 'trials_expiring', label: 'Trials por vencer', countKey: 'trialsExpiring' },
  { id: 'subscriptions_expiring', label: 'Suscripciones por vencer', countKey: 'subscriptionsExpiring' },
  { id: 'grace_period', label: 'Período de gracia', countKey: 'gracePeriod' },
  { id: 'suspended', label: 'Suspendidas', countKey: 'suspended' },
  { id: 'subscriptions_expired', label: 'Vencidas', countKey: 'expired' },
];

function statusLabel(status: string) {
  const map: Record<string, string> = {
    trial: 'Trial',
    active: 'Activa',
    grace_period: 'Gracia',
    suspended: 'Suspendida',
    expired: 'Vencida',
    cancelled: 'Cancelada',
  };
  return map[status] ?? status;
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    trial: 'bg-sky-50 text-sky-800',
    active: 'bg-teal-50 text-teal-800',
    grace_period: 'bg-amber-50 text-amber-800',
    suspended: 'bg-rose-50 text-rose-800',
    expired: 'bg-slate-100 text-slate-700',
  };
  return map[status] ?? 'bg-slate-100 text-slate-700';
}

export function SuperAdminSubscriptionAlertsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<SubscriptionAlertFilter | 'all'>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['super-admin', 'subscription-alerts', filter, search],
    queryFn: async () =>
      (
        await fetchSubscriptionAlerts({
          filter: filter === 'all' ? undefined : filter,
          search: search || undefined,
        })
      ).data,
  });

  const { data: scheduler } = useQuery({
    queryKey: ['super-admin', 'scheduler'],
    queryFn: async () => (await fetchSchedulerStatus()).data.scheduler,
  });

  const runMutation = useMutation({
    mutationFn: runSubscriptionScheduler,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'subscription-alerts'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'scheduler'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin', 'dashboard'] });
    },
  });

  const counts = data?.counts;

  const filterButtons = useMemo(
    () =>
      FILTERS.map((f) => ({
        ...f,
        count:
          f.countKey && counts
            ? (counts as Record<string, number>)[f.countKey]
            : undefined,
      })),
    [counts],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Suscripciones</h2>
          <p className="mt-1 text-sm text-slate-500">
            Alertas del motor automático · trials, gracia, vencidas y suspendidas
          </p>
        </div>
        <button
          type="button"
          onClick={() => runMutation.mutate()}
          disabled={runMutation.isPending}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {runMutation.isPending ? 'Ejecutando…' : 'Ejecutar motor ahora'}
        </button>
      </div>

      {scheduler && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
          Scheduler:{' '}
          <span className="font-medium text-slate-900">
            {scheduler.enabled ? 'activo' : 'deshabilitado'}
          </span>
          {' · '}
          cron <code className="text-xs text-teal-700">{scheduler.cron}</code>
          {' · '}
          gracia {scheduler.gracePeriodDays}d
          {scheduler.lastRun?.finishedAt && (
            <>
              {' · '}
              última corrida{' '}
              {new Date(scheduler.lastRun.finishedAt).toLocaleString('es-CO')}
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {filterButtons.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === f.id
                ? 'bg-teal-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {f.label}
            {typeof f.count === 'number' ? ` (${f.count})` : ''}
          </button>
        ))}
      </div>

      <div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por organización, email o plan…"
          className="w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {isLoading && <p className="text-sm text-slate-500">Cargando alertas…</p>}
      {isError && <p className="text-sm text-red-600">No se pudieron cargar las alertas.</p>}

      {!isLoading && data && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Organización</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold">Vence</th>
                <th className="px-4 py-3 font-semibold">Días</th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Sin resultados para este filtro
                  </td>
                </tr>
              )}
              {data.items.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">
                      {row.organization?.name ?? '—'}
                    </p>
                    <p className="text-xs text-slate-500">{row.organization?.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{row.plan?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${statusClass(row.status)}`}
                    >
                      {statusLabel(row.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {row.status === 'grace_period' && row.gracePeriodEndsAt
                      ? new Date(row.gracePeriodEndsAt).toLocaleDateString('es-CO')
                      : row.endDate
                        ? new Date(row.endDate).toLocaleDateString('es-CO')
                        : '—'}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-700">
                    {row.status === 'grace_period'
                      ? `${row.graceDaysRemaining ?? 0}d gracia`
                      : `${row.daysRemaining}d`}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.organization && (
                      <Link
                        to={`/admin/organizations/${row.organization.id}`}
                        className="text-sm font-medium text-teal-700 hover:underline"
                      >
                        Ver
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
