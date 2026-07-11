import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  duplicateAdminPlan,
  fetchAdminPlans,
  setAdminPlanActive,
  type PlatformPlan,
} from '@/modules/superAdmin/api';

export function SuperAdminPlansPage() {
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const plansQuery = useQuery({
    queryKey: ['super-admin', 'plans'],
    queryFn: async () => (await fetchAdminPlans()).data.plans,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      setAdminPlanActive(id, isActive),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['super-admin', 'plans'] });
      setError(null);
    },
    onError: (err: unknown) => {
      setError(isAxiosError(err) ? (err.response?.data?.message ?? 'Error') : 'Error');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateAdminPlan(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['super-admin', 'plans'] }),
    onError: (err: unknown) => {
      setError(isAxiosError(err) ? (err.response?.data?.message ?? 'Error') : 'Error');
    },
  });

  const plans = plansQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Planes comerciales</h2>
          <p className="mt-1 text-sm text-slate-500">
            Trial, Starter, Professional y Enterprise · los ciclos Mensual/Trimestral/… son
            modalidades de pago, no planes
          </p>
        </div>
        <Link
          to="/admin/plans/new"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Nuevo plan (avanzado)
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {plansQuery.isLoading && (
          <p className="text-sm text-slate-500">Cargando planes...</p>
        )}
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onToggle={() =>
              statusMutation.mutate({ id: plan.id, isActive: !plan.isActive })
            }
            onDuplicate={() => duplicateMutation.mutate(plan.id)}
          />
        ))}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  onToggle,
  onDuplicate,
}: {
  plan: PlatformPlan;
  onToggle: () => void;
  onDuplicate: () => void;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: plan.color }}
            />
            <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
            {plan.isRecommended && (
              <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-800">
                Recomendado
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-500">{plan.code}</p>
        </div>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            plan.isActive ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {plan.isActive ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <p className="mt-3 line-clamp-2 flex-1 text-sm text-slate-600">
        {plan.description || 'Sin descripción'}
      </p>

      <p className="mt-4 text-2xl font-semibold tabular-nums text-slate-900">
        {plan.isTrialPlan
          ? 'Gratis'
          : formatMoney(plan.pricing.monthly, plan.currency)}
        {!plan.isTrialPlan && (
          <span className="text-sm font-normal text-slate-500"> / mes</span>
        )}
      </p>

      {!plan.isTrialPlan && (
        <ul className="mt-2 space-y-0.5 text-xs text-slate-500">
          <li>Trimestral: {formatMoney(plan.pricing.quarterly, plan.currency)}</li>
          <li>Semestral: {formatMoney(plan.pricing.semiannual, plan.currency)}</li>
          <li>Anual: {formatMoney(plan.pricing.annual, plan.currency)}</li>
        </ul>
      )}

      <p className="mt-2 text-xs text-slate-500">
        {plan.organizationsCount ?? 0} org(s) ·{' '}
        {plan.isTrialPlan ? 'Plan Trial' : `Orden ${plan.sortOrder}`}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        <Link
          to={`/admin/plans/${plan.id}`}
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
        >
          Editar
        </Link>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          {plan.isActive ? 'Desactivar' : 'Activar'}
        </button>
        <button
          type="button"
          onClick={onDuplicate}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          Duplicar
        </button>
      </div>
    </article>
  );
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
