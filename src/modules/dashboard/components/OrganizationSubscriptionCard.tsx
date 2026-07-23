import { useAuth } from '@/modules/auth/AuthProvider';

const STATUS_LABELS: Record<string, string> = {
  trial: 'Trial',
  trial_premium: 'Prueba premium',
  awaiting_activation: 'Pendiente de activación',
  active: 'Activa',
  grace_period: 'Período de gracia',
  suspended: 'Suspendida',
  expired: 'Vencida',
  cancelled: 'Cancelada',
};

const BILLING_CYCLE_LABELS: Record<string, string> = {
  trial: 'Trial',
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

/** Resumen del plan SaaS de la organización (desde /auth/me). */
export function OrganizationSubscriptionCard() {
  const { user } = useAuth();
  const sub = user?.organization?.subscription;

  if (!sub?.hasSubscription || !sub.plan) return null;

  const isGrace = sub.status === 'grace_period';
  const isReadOnly = sub.accessMode === 'read_only';

  return (
    <section
      className={`rounded-2xl border bg-white p-5 shadow-sm ${
        isGrace || isReadOnly ? 'border-amber-200' : 'border-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Plan actual
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: sub.plan.color || '#0f766e' }}
            />
            {sub.plan.name}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Estado: <span className="font-medium">{STATUS_LABELS[sub.status ?? ''] ?? sub.status}</span>
            {sub.billingCycle
              ? ` · Ciclo: ${BILLING_CYCLE_LABELS[sub.billingCycle] ?? sub.billingCycle}`
              : null}
          </p>
          {isGrace && sub.gracePeriodEndsAt && (
            <p className="mt-2 text-sm text-amber-800">
              Período de gracia hasta{' '}
              {new Date(sub.gracePeriodEndsAt).toLocaleDateString('es-CO')}. Renueva para
              evitar la suspensión.
            </p>
          )}
          {isReadOnly && (
            <p className="mt-2 text-sm text-amber-800">
              Acceso limitado: puedes consultar y exportar. Las operaciones están bloqueadas
              hasta renovar.
            </p>
          )}
        </div>
        <div className="text-right text-sm text-slate-600">
          <p>
            Vence:{' '}
            <span className="font-medium text-slate-900">
              {sub.endDate ? new Date(sub.endDate).toLocaleDateString('es-CO') : '—'}
            </span>
          </p>
          <p className="mt-1">
            Días restantes:{' '}
            <span className="font-semibold tabular-nums text-slate-900">{sub.daysRemaining}</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {sub.autoRenewal && sub.nextRenewalAt
              ? `Próxima renovación: ${new Date(sub.nextRenewalAt).toLocaleDateString('es-CO')}`
              : 'Renovación automática desactivada'}
          </p>
        </div>
      </div>
    </section>
  );
}
