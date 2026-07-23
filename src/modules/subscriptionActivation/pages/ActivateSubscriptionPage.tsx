import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Check, Circle, Clock3 } from 'lucide-react';
import {
  createActivationRequest,
  fetchActivationWelcome,
  type ActivationRequest,
  type ActivationRequestPayload,
} from '@/api/subscriptionActivation';
import { useAuth } from '@/modules/auth/AuthProvider';
import { AppLogo } from '@/components/brand/AppLogo';

type FormValues = ActivationRequestPayload;

function TimelineStep({
  title,
  subtitle,
  state,
}: {
  title: string;
  subtitle: string;
  state: 'done' | 'current' | 'pending';
}) {
  const icon =
    state === 'done' ? (
      <Check className="h-4 w-4" strokeWidth={3} />
    ) : state === 'current' ? (
      <Clock3 className="h-4 w-4" />
    ) : (
      <Circle className="h-3.5 w-3.5" />
    );

  const colors =
    state === 'done'
      ? 'bg-emerald-500 text-white'
      : state === 'current'
        ? 'bg-amber-400 text-amber-950'
        : 'bg-slate-200 text-slate-500';

  return (
    <li className="flex gap-4">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colors}`}>
        {icon}
      </div>
      <div className="pb-8">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
      </div>
    </li>
  );
}

function PendingRequestCard({ request }: { request: ActivationRequest }) {
  const statusText =
    request.status === 'IN_REVIEW'
      ? 'En revisión por nuestro equipo'
      : 'En espera de revisión';

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 shadow-sm sm:p-8">
      <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-900 ring-1 ring-amber-200">
        Solicitud {request.statusLabel || request.status}
      </div>
      <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">
        Tu solicitud está {statusText.toLowerCase()}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        Ya recibimos tu pedido de activación
        {request.plan?.name ? ` del plan ${request.plan.name}` : ''}. No es necesario enviar otra
        solicitud. Nuestro equipo te contactará para finalizar la configuración.
      </p>
      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Empresa</dt>
          <dd className="font-medium text-slate-900">{request.company}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Contacto</dt>
          <dd className="font-medium text-slate-900">{request.contactName}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Correo</dt>
          <dd className="font-medium text-slate-900">{request.email}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Enviada</dt>
          <dd className="font-medium text-slate-900">
            {request.createdAt
              ? new Date(request.createdAt).toLocaleString('es-CO')
              : '—'}
          </dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/dashboard"
          className="inline-flex rounded-xl bg-[#1a73e8] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1765cc]"
        >
          Volver al panel
        </Link>
        <Link
          to="/support"
          className="inline-flex rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Contactar soporte
        </Link>
      </div>
    </section>
  );
}

export function ActivateSubscriptionPage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const welcomeQuery = useQuery({
    queryKey: ['activation', 'welcome'],
    queryFn: fetchActivationWelcome,
  });

  const org = welcomeQuery.data?.organization;
  const plan = welcomeQuery.data?.plan ?? welcomeQuery.data?.subscription?.plan;
  const sub = welcomeQuery.data?.subscription ?? user?.organization?.subscription;
  const openRequest = welcomeQuery.data?.openActivationRequest ?? null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      company: org?.name || user?.organization?.name || '',
      contactName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
      email: user?.email || '',
      phone: org?.phone || user?.phone || '',
      city: org?.city || user?.organization?.city || '',
      dailyVehicles: undefined,
      branches: 1,
      schedule: '',
      comments: '',
    },
    values: welcomeQuery.data
      ? {
          company: org?.name || '',
          contactName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          email: user?.email || '',
          phone: org?.phone || '',
          city: org?.city || '',
          dailyVehicles: undefined,
          branches: 1,
          schedule: '',
          comments: '',
        }
      : undefined,
  });

  const mutation = useMutation({
    mutationFn: createActivationRequest,
    onSuccess: async () => {
      await refreshUser();
      await queryClient.invalidateQueries({ queryKey: ['activation', 'welcome'] });
      reset();
    },
  });

  const onSubmit = handleSubmit((values) => {
    mutation.mutate({
      ...values,
      dailyVehicles: values.dailyVehicles ? Number(values.dailyVehicles) : null,
      branches: values.branches ? Number(values.branches) : 1,
    });
  });

  const trialActive = sub?.status === 'trial_premium';
  const planDone = Boolean(plan);
  const activationPending = Boolean(openRequest) || mutation.isSuccess;
  const pendingRequest = openRequest || mutation.data?.data?.request || null;

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-80"
        style={{
          background:
            'radial-gradient(ellipse 70% 80% at 50% 0%, rgba(26,115,232,0.12), transparent)',
        }}
      />

      <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 max-w-2xl">
          <div className="mb-4">
            <AppLogo size="md" className="max-h-16" />
          </div>
          <p className="text-sm font-medium text-[#1a73e8]">Activar suscripción</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {activationPending
              ? 'Solicitud en espera'
              : 'Estás a un paso de tu plan completo'}
          </h1>
          <p className="mt-3 text-slate-600">
            {activationPending
              ? 'Tu solicitud ya fue enviada. Mientras tanto puedes seguir usando tu período de prueba.'
              : 'Parking SaaS activa clientes de forma personalizada para acompañarte en la implementación. Completa la solicitud y nuestro equipo te contactará.'}
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Progreso
            </h2>
            <ol className="mt-6">
              <TimelineStep
                title="Plan seleccionado"
                subtitle={plan?.name ? `Plan ${plan.name}` : 'Completado'}
                state={planDone ? 'done' : 'pending'}
              />
              <TimelineStep
                title="Prueba gratuita"
                subtitle={trialActive ? 'En curso' : 'Pendiente o finalizada'}
                state={trialActive ? (activationPending ? 'done' : 'current') : planDone ? 'done' : 'pending'}
              />
              <TimelineStep
                title="Activación"
                subtitle={
                  openRequest?.status === 'IN_REVIEW'
                    ? 'En revisión'
                    : activationPending
                      ? 'En espera'
                      : 'Pendiente'
                }
                state={activationPending ? 'current' : 'pending'}
              />
            </ol>
          </aside>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
              <h2 className="text-xl font-semibold tracking-tight">¿Cómo activo mi suscripción?</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Actualmente Parking SaaS realiza la activación de nuevos clientes de manera
                personalizada para garantizar una correcta configuración del sistema y
                acompañarte durante la implementación.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Nuestro equipo se comunicará contigo para finalizar el proceso. En una próxima
                versión podrás pagar en línea desde este mismo flujo.
              </p>
            </section>

            {welcomeQuery.isLoading ? (
              <p className="text-sm text-slate-500">Cargando…</p>
            ) : pendingRequest || openRequest ? (
              <PendingRequestCard request={(pendingRequest || openRequest)!} />
            ) : (
              <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-semibold tracking-tight">Solicitud de activación</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Completa los datos para que podamos contactarte.
                </p>

                {mutation.isError && (
                  <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    {(mutation.error as { response?: { data?: { message?: string } } })?.response
                      ?.data?.message || 'No se pudo enviar la solicitud.'}
                  </div>
                )}

                <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Empresa" error={errors.company?.message} className="sm:col-span-2">
                    <input
                      className={inputClass}
                      {...register('company', { required: 'Obligatorio' })}
                    />
                  </Field>
                  <Field label="Nombre del contacto" error={errors.contactName?.message}>
                    <input
                      className={inputClass}
                      {...register('contactName', { required: 'Obligatorio' })}
                    />
                  </Field>
                  <Field label="Correo" error={errors.email?.message}>
                    <input
                      type="email"
                      className={inputClass}
                      {...register('email', { required: 'Obligatorio' })}
                    />
                  </Field>
                  <Field label="Teléfono" error={errors.phone?.message}>
                    <input
                      className={inputClass}
                      {...register('phone', { required: 'Obligatorio' })}
                    />
                  </Field>
                  <Field label="Ciudad" error={errors.city?.message}>
                    <input
                      className={inputClass}
                      {...register('city', { required: 'Obligatorio' })}
                    />
                  </Field>
                  <Field label="Vehículos diarios (aprox.)" error={errors.dailyVehicles?.message}>
                    <input
                      type="number"
                      min={0}
                      className={inputClass}
                      {...register('dailyVehicles')}
                    />
                  </Field>
                  <Field label="Cantidad de sedes" error={errors.branches?.message}>
                    <input
                      type="number"
                      min={1}
                      className={inputClass}
                      {...register('branches')}
                    />
                  </Field>
                  <Field label="Horario de atención" className="sm:col-span-2">
                    <input
                      className={inputClass}
                      placeholder="Ej. Lun–Sáb 6:00–22:00"
                      {...register('schedule')}
                    />
                  </Field>
                  <Field label="Comentarios adicionales" className="sm:col-span-2">
                    <textarea rows={4} className={inputClass} {...register('comments')} />
                  </Field>

                  <div className="sm:col-span-2 flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || mutation.isPending}
                      className="rounded-xl bg-[#1a73e8] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1765cc] disabled:opacity-60"
                    >
                      {mutation.isPending ? 'Enviando…' : 'Enviar solicitud'}
                    </button>
                    <Link
                      to="/dashboard"
                      className="text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                      Volver al panel
                    </Link>
                  </div>
                </form>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-[#1a73e8] focus:outline-none focus:ring-2 focus:ring-[#1a73e8]/30';

function Field({
  label,
  error,
  children,
  className = '',
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
