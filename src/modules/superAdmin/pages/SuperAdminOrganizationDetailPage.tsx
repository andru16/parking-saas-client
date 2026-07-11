import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  changeAdminOrgPlan,
  changeAdminOrgStatus,
  extendAdminOrgTrial,
  fetchAdminOrganization,
  fetchAdminPlans,
  requestImpersonation,
} from '@/modules/superAdmin/api';

export function SuperAdminOrganizationDetailPage() {
  const { organizationId = '' } = useParams();
  const qc = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [planId, setPlanId] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [changeMode, setChangeMode] = useState<'immediate' | 'scheduled'>('immediate');

  const detailQuery = useQuery({
    queryKey: ['super-admin', 'organization', organizationId],
    enabled: Boolean(organizationId),
    queryFn: async () => (await fetchAdminOrganization(organizationId)).data,
  });

  const plansQuery = useQuery({
    queryKey: ['super-admin', 'plans'],
    queryFn: async () => (await fetchAdminPlans()).data.plans,
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['super-admin', 'organization', organizationId] });
    void qc.invalidateQueries({ queryKey: ['super-admin', 'organizations'] });
    void qc.invalidateQueries({ queryKey: ['super-admin', 'dashboard'] });
  };

  const statusMutation = useMutation({
    mutationFn: (action: string) => changeAdminOrgStatus(organizationId, action),
    onSuccess: () => {
      setMessage('Estado actualizado');
      setError(null);
      invalidate();
    },
    onError: (err: unknown) => {
      setError(
        isAxiosError(err) ? (err.response?.data?.message ?? 'Error') : 'Error al cambiar estado',
      );
    },
  });

  const trialMutation = useMutation({
    mutationFn: () => extendAdminOrgTrial(organizationId, 15),
    onSuccess: () => {
      setMessage('Trial extendido 15 días');
      setError(null);
      invalidate();
    },
    onError: (err: unknown) => {
      setError(isAxiosError(err) ? (err.response?.data?.message ?? 'Error') : 'Error');
    },
  });

  const planMutation = useMutation({
    mutationFn: () =>
      changeAdminOrgPlan(organizationId, {
        planId,
        billingCycle,
        changeMode,
      }),
    onSuccess: () => {
      setMessage('Plan actualizado');
      setError(null);
      invalidate();
    },
    onError: (err: unknown) => {
      setError(isAxiosError(err) ? (err.response?.data?.message ?? 'Error') : 'Error');
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: () => requestImpersonation(organizationId, 'Soporte técnico'),
    onError: (err: unknown) => {
      setError(
        isAxiosError(err)
          ? (err.response?.data?.message ?? 'Impersonación no disponible')
          : 'Impersonación no disponible',
      );
      setMessage(null);
    },
  });

  if (detailQuery.isLoading) {
    return <p className="text-sm text-slate-500">Cargando organización...</p>;
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div>
        <p className="text-sm text-red-600">No se encontró la organización.</p>
        <Link to="/admin/organizations" className="mt-2 inline-block text-sm text-teal-700">
          Volver
        </Link>
      </div>
    );
  }

  const { organization, subscription, stats, users, paymentHistory, support, subscriptionHistory } =
    detailQuery.data;
  const plans = (plansQuery.data ?? []).filter((p) => p.isActive);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link to="/admin/organizations" className="text-sm text-teal-700 hover:underline">
            ← Organizaciones
          </Link>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{organization.name}</h2>
          <p className="text-sm text-slate-500">
            {organization.email} · Estado: <strong>{organization.status}</strong>
          </p>
        </div>
      </div>

      {(message || error) && (
        <div
          className={`rounded-lg px-3 py-2 text-sm ${
            error ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'
          }`}
        >
          {error ?? message}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900">Información general</h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
            <Item label="Razón social" value={organization.legalName} />
            <Item label="NIT" value={organization.taxId} />
            <Item label="Teléfono" value={organization.phone} />
            <Item label="Ciudad" value={organization.city} />
            <Item label="Departamento" value={organization.stateOrDepartment} />
            <Item label="País" value={organization.country} />
            <Item label="Dirección" value={organization.address} />
            <Item
              label="Registro"
              value={new Date(organization.createdAt).toLocaleString('es-CO')}
            />
            <Item
              label="Setup completo"
              value={organization.isSetupComplete ? 'Sí' : 'No'}
            />
            <Item
              label="Último acceso"
              value={
                stats.lastAccessAt
                  ? `${new Date(stats.lastAccessAt).toLocaleString('es-CO')} (${stats.lastAccessUser?.name ?? ''})`
                  : '—'
              }
            />
          </dl>
        </section>

        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Plan actual</h3>
            {subscription ? (
              <div className="mt-3 space-y-1 text-sm text-slate-700">
                <p className="font-medium">{subscription.plan?.name ?? '—'}</p>
                <p>
                  Ciclo:{' '}
                  {subscription.billingCycleLabel ??
                    subscription.billingCycle ??
                    '—'}
                </p>
                <p>Estado: {subscription.status}</p>
                <p>
                  Inicio:{' '}
                  {subscription.startDate
                    ? new Date(subscription.startDate).toLocaleDateString('es-CO')
                    : '—'}
                </p>
                <p>
                  Vence:{' '}
                  {subscription.endDate
                    ? new Date(subscription.endDate).toLocaleDateString('es-CO')
                    : '—'}
                </p>
                {subscription.nextRenewalAt && (
                  <p>
                    Próx. renovación:{' '}
                    {new Date(subscription.nextRenewalAt).toLocaleDateString('es-CO')}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Sin suscripción activa</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MiniStat label="Usuarios" value={stats.usersCount} />
            <MiniStat label="Vehículos" value={stats.vehiclesCount} />
            <MiniStat label="Tickets" value={stats.ticketsCount} />
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Acciones</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton
            label="Activar"
            onClick={() => statusMutation.mutate('activate')}
            disabled={statusMutation.isPending}
          />
          <ActionButton
            label="Suspender"
            tone="danger"
            onClick={() => statusMutation.mutate('suspend')}
            disabled={statusMutation.isPending}
          />
          <ActionButton
            label="Reactivar"
            onClick={() => statusMutation.mutate('reactivate')}
            disabled={statusMutation.isPending}
          />
          <ActionButton
            label="Extender trial +15d"
            onClick={() => trialMutation.mutate()}
            disabled={trialMutation.isPending}
          />
          <ActionButton
            label="Impersonar (próximamente)"
            tone="muted"
            onClick={() => impersonateMutation.mutate()}
            disabled={impersonateMutation.isPending}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-slate-100 pt-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Cambiar plan</label>
            <select
              value={planId}
              onChange={(e) => {
                const next = e.target.value;
                setPlanId(next);
                const selected = plans.find((p) => p.id === next);
                if (selected?.isTrialPlan) setBillingCycle('trial');
                else if (billingCycle === 'trial') setBillingCycle('monthly');
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Seleccione plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.isRecommended ? ' ★' : ''} — {p.pricing?.monthly ?? 0} {p.currency}/mes
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Ciclo de facturación
            </label>
            <select
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              disabled={plans.find((p) => p.id === planId)?.isTrialPlan}
            >
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
              <option value="semiannual">Semestral</option>
              <option value="annual">Anual</option>
              <option value="trial">Trial</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Modo</label>
            <select
              value={changeMode}
              onChange={(e) => setChangeMode(e.target.value as 'immediate' | 'scheduled')}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="immediate">Inmediato</option>
              <option value="scheduled">Programado</option>
            </select>
          </div>
          <button
            type="button"
            disabled={!planId || planMutation.isPending}
            onClick={() => planMutation.mutate()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            Aplicar plan
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Usuarios</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-4">Nombre</th>
                <th className="py-2 pr-4">Correo</th>
                <th className="py-2 pr-4">Rol</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2">Último acceso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-2 pr-4">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4">{u.role?.name ?? '—'}</td>
                  <td className="py-2 pr-4">{u.status}</td>
                  <td className="py-2">
                    {u.lastLoginAt
                      ? new Date(u.lastLoginAt).toLocaleString('es-CO')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-900">Historial de suscripción</h3>
        {(subscriptionHistory?.length ?? 0) === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Sin eventos registrados</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            {subscriptionHistory!.map((h) => (
              <li key={h.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span>
                  <span className="font-medium">{h.action}</span>
                  {h.fromPlan || h.toPlan
                    ? ` · ${h.fromPlan?.name ?? '—'} → ${h.toPlan?.name ?? '—'}`
                    : null}
                  {h.notes ? ` · ${h.notes}` : null}
                </span>
                <span className="text-slate-500">
                  {new Date(h.createdAt).toLocaleString('es-CO')}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
          <h3 className="text-sm font-semibold text-slate-900">Historial de pagos</h3>
          <p className="mt-2 text-sm text-slate-500">{paymentHistory.note}</p>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
          <h3 className="text-sm font-semibold text-slate-900">Soporte / región</h3>
          <p className="mt-2 text-sm text-slate-500">
            Locale: {support.locale} · Moneda: {support.currency} · Región:{' '}
            {support.region ?? '—'} · Incidencias abiertas: {support.openIncidents}
          </p>
        </div>
      </section>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-900">{value || '—'}</dd>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm">
      <p className="text-lg font-semibold text-slate-900">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  tone = 'default',
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger' | 'muted';
}) {
  const styles =
    tone === 'danger'
      ? 'border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100'
      : tone === 'muted'
        ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
        : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${styles}`}
    >
      {label}
    </button>
  );
}
