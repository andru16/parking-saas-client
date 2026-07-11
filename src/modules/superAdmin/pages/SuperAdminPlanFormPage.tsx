import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  createAdminPlan,
  fetchAdminPlan,
  fetchAdminPlanFeatures,
  updateAdminPlan,
  type PlanUpsertPayload,
  type PlatformPlan,
} from '@/modules/superAdmin/api';

const emptyLimits = {
  maxUsers: null as number | null,
  maxCashRegisters: null as number | null,
  maxSites: null as number | null,
  maxActiveVehicles: null as number | null,
  maxDailyTickets: null as number | null,
};

export function SuperAdminPlanFormPage() {
  const { planId } = useParams();
  const isNew = !planId || planId === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const featuresQuery = useQuery({
    queryKey: ['super-admin', 'plan-features'],
    queryFn: async () => (await fetchAdminPlanFeatures()).data.features,
  });

  const detailQuery = useQuery({
    queryKey: ['super-admin', 'plan', planId],
    enabled: !isNew && Boolean(planId),
    queryFn: async () => (await fetchAdminPlan(planId!)).data,
  });

  const [form, setForm] = useState<PlanUpsertPayload>({
    name: '',
    code: '',
    description: '',
    isActive: true,
    isTrialPlan: false,
    isRecommended: false,
    currency: 'COP',
    sortOrder: 0,
    color: '#0f766e',
    defaultDurationDays: 30,
    pricing: { monthly: 0, quarterly: 0, semiannual: 0, annual: 0 },
    limits: { ...emptyLimits },
    features: {},
    icon: { name: null, url: null },
  });

  useEffect(() => {
    if (detailQuery.data?.plan) {
      const p = detailQuery.data.plan;
      setForm({
        name: p.name,
        code: p.code,
        description: p.description,
        isActive: p.isActive,
        isTrialPlan: p.isTrialPlan,
        isRecommended: Boolean(p.isRecommended),
        currency: p.currency,
        sortOrder: p.sortOrder,
        color: p.color,
        defaultDurationDays: p.defaultDurationDays,
        pricing: p.pricing,
        limits: p.limits,
        features: p.features,
        icon: p.icon,
      });
    }
  }, [detailQuery.data]);

  useEffect(() => {
    if (!isNew || !featuresQuery.data) return;
    setForm((prev) => {
      if (Object.keys(prev.features || {}).length) return prev;
      const features = Object.fromEntries(featuresQuery.data.map((f) => [f.key, false]));
      return { ...prev, features };
    });
  }, [isNew, featuresQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (isNew) return createAdminPlan(form);
      return updateAdminPlan(planId!, form);
    },
    onSuccess: (res) => {
      void qc.invalidateQueries({ queryKey: ['super-admin', 'plans'] });
      navigate(`/admin/plans/${res.data.plan.id}`, { replace: true });
    },
    onError: (err: unknown) => {
      setError(isAxiosError(err) ? (err.response?.data?.message ?? 'Error') : 'Error');
    },
  });

  const featureGroups = useMemo(() => {
    const list = featuresQuery.data ?? [];
    const map = new Map<string, typeof list>();
    for (const f of list) {
      const arr = map.get(f.category) ?? [];
      arr.push(f);
      map.set(f.category, arr);
    }
    return [...map.entries()];
  }, [featuresQuery.data]);

  const orgs = detailQuery.data?.organizations ?? [];

  if (!isNew && detailQuery.isLoading) {
    return <p className="text-sm text-slate-500">Cargando plan...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/admin/plans" className="text-sm text-teal-700 hover:underline">
          ← Planes
        </Link>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          {isNew ? 'Nuevo plan' : form.name || 'Editar plan'}
        </h2>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</div>
      )}

      <form
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
      >
        <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
          <Field label="Nombre">
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Código único">
            <input
              required
              className={inputClass}
              value={form.code}
              disabled={!isNew}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toLowerCase().replace(/\s+/g, '_') })
              }
            />
          </Field>
          <Field label="Descripción" className="md:col-span-2">
            <textarea
              className={inputClass}
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Field label="Moneda">
            <input
              className={inputClass}
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
            />
          </Field>
          <Field label="Color">
            <input
              type="color"
              className="h-10 w-full rounded-lg border border-slate-300 bg-white"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
          </Field>
          <Field label="Orden">
            <input
              type="number"
              className={inputClass}
              value={form.sortOrder}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
            />
          </Field>
          <Field label="Duración por defecto (días)">
            <input
              type="number"
              min={1}
              className={inputClass}
              value={form.defaultDurationDays}
              onChange={(e) =>
                setForm({ ...form, defaultDurationDays: Number(e.target.value) })
              }
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Activo
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.isTrialPlan}
              onChange={(e) => setForm({ ...form, isTrialPlan: e.target.checked })}
            />
            Es plan Trial (signup)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={Boolean(form.isRecommended)}
              onChange={(e) => setForm({ ...form, isRecommended: e.target.checked })}
            />
            Plan recomendado
          </label>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Ciclos de facturación</h3>
          <p className="mt-1 text-xs text-slate-500">
            Modalidades de pago del plan (no son planes independientes)
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(['monthly', 'quarterly', 'semiannual', 'annual'] as const).map((key) => (
              <Field key={key} label={priceLabel(key)}>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.pricing?.[key] ?? 0}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      pricing: { ...form.pricing!, [key]: Number(e.target.value) },
                    })
                  }
                />
              </Field>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">
            Límites <span className="font-normal text-slate-500">(vacío = ilimitado)</span>
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(
              [
                ['maxUsers', 'Máx. usuarios'],
                ['maxCashRegisters', 'Máx. cajas'],
                ['maxSites', 'Máx. sedes'],
                ['maxActiveVehicles', 'Máx. vehículos activos'],
                ['maxDailyTickets', 'Máx. tickets diarios'],
              ] as const
            ).map(([key, label]) => (
              <Field key={key} label={label}>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.limits?.[key] ?? ''}
                  placeholder="Ilimitado"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      limits: {
                        ...form.limits!,
                        [key]: e.target.value === '' ? null : Number(e.target.value),
                      },
                    })
                  }
                />
              </Field>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-900">Features</h3>
          <div className="mt-4 space-y-4">
            {featureGroups.map(([category, items]) => (
              <div key={category}>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {category}
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((f) => (
                    <label
                      key={f.key}
                      className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(form.features?.[f.key])}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            features: { ...form.features, [f.key]: e.target.checked },
                          })
                        }
                      />
                      {f.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {!isNew && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Organizaciones usando este plan ({orgs.length})
            </h3>
            {orgs.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">Ninguna organización activa en este plan</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {orgs.map((o) => (
                  <li key={o.id} className="flex justify-between py-2">
                    <Link to={`/admin/organizations/${o.id}`} className="font-medium text-teal-700">
                      {o.name}
                    </Link>
                    <span className="text-slate-500">
                      {o.subscriptionStatus} · vence{' '}
                      {new Date(o.endDate).toLocaleDateString('es-CO')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500 disabled:opacity-60"
          >
            {saveMutation.isPending ? 'Guardando...' : 'Guardar plan'}
          </button>
          <Link
            to="/admin/plans"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600';

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function priceLabel(key: keyof NonNullable<PlatformPlan['pricing']>) {
  const map = {
    monthly: 'Mensual',
    quarterly: 'Trimestral',
    semiannual: 'Semestral',
    annual: 'Anual',
  };
  return map[key];
}
