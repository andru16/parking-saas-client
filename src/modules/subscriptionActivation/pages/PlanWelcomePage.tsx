import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Check, MessageCircle, Sparkles } from 'lucide-react';
import {
  fetchActivationWelcome,
  startPremiumTrialRequest,
} from '@/api/subscriptionActivation';
import { meRequest } from '@/api/auth';
import { useAuth } from '@/modules/auth/AuthProvider';
import { getPostLoginPath } from '@/modules/auth/authRedirect';
import { AppLogo } from '@/components/brand/AppLogo';

function formatMoney(value?: number | null) {
  if (value == null || !Number.isFinite(value) || value <= 0) return 'Consultar';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

function benefitLines(plan: {
  features?: Record<string, boolean>;
  limits?: { maxUsers?: number | null; maxSites?: number | null };
} | null) {
  if (!plan) return ['Todas las funciones del plan seleccionado'];
  const lines: string[] = [];
  if (plan.limits?.maxUsers != null) lines.push(`Hasta ${plan.limits.maxUsers} usuarios`);
  if (plan.limits?.maxSites != null) {
    lines.push(
      plan.limits.maxSites === 1 ? '1 sede' : `Hasta ${plan.limits.maxSites} sedes`,
    );
  }
  if (plan.features?.advancedReports) lines.push('Reportes avanzados');
  if (plan.features?.audit) lines.push('Auditoría');
  if (plan.features?.memberships) lines.push('Membresías de parqueadero');
  lines.push('Soporte prioritario');
  lines.push('Todas las funciones habilitadas durante la prueba');
  return lines;
}

export function PlanWelcomePage() {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const welcomeQuery = useQuery({
    queryKey: ['activation', 'welcome'],
    queryFn: fetchActivationWelcome,
  });

  const startMutation = useMutation({
    mutationFn: startPremiumTrialRequest,
    onSuccess: async () => {
      await refreshUser();
      await queryClient.invalidateQueries({ queryKey: ['activation'] });
      const me = await meRequest();
      navigate(getPostLoginPath(me.data.user), { replace: true });
    },
  });

  const data = welcomeQuery.data;
  const plan = data?.plan ?? data?.subscription?.plan ?? null;
  const days = data?.trialPremiumDays ?? 3;
  const support = data?.support;

  const whatsappHref = support?.whatsapp
    ? `https://wa.me/${support.whatsapp.replace(/\D/g, '')}`
    : null;
  const mailHref = support?.email ? `mailto:${support.email}` : null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f8fb] text-slate-900">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(66,133,244,0.18), transparent), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(52,168,83,0.08), transparent)',
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12 sm:px-6">
        <div className="mb-8 text-center animate-[fadeIn_0.5s_ease-out]">
          <div className="mb-4 flex justify-center">
            <AppLogo size="lg" className="max-h-28" />
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            ¡Excelente elección!
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Has seleccionado el{' '}
            <span className="font-semibold text-slate-900">
              Plan {plan?.name || 'Profesional'}
            </span>
            .
            <br />
            Solo falta un paso para comenzar a utilizar Parking SaaS.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Mientras nuestro equipo configura tu cuenta podrás disfrutar de una prueba completa
            del plan seleccionado.
          </p>
        </div>

        <article className="overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(60,64,67,0.3),0_2px_6px_2px_rgba(60,64,67,0.15)] animate-[fadeInUp_0.55s_ease-out]">
          <div
            className="h-1 w-full"
            style={{
              background:
                'linear-gradient(90deg,#ea4335,#fbbc04,#34a853,#4285f4,#9b72cb)',
            }}
          />

          <div className="px-6 pb-7 pt-6 sm:px-8">
            <div className="mb-5 flex items-center gap-2 text-slate-400">
              <Sparkles className="h-4 w-4 text-blue-500" aria-hidden />
              <span className="text-xs font-medium uppercase tracking-wider">Tu plan</span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {plan?.name || 'Profesional'}
            </h2>

            <div className="mt-3 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
              Prueba gratuita de {days} {days === 1 ? 'día' : 'días'}
            </div>

            <p className="mt-5 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                {formatMoney(plan?.priceMonthly)}
              </span>
              <span className="text-sm text-slate-500">/ mes</span>
            </p>

            <button
              type="button"
              disabled={startMutation.isPending || welcomeQuery.isLoading}
              onClick={() => startMutation.mutate()}
              className="mt-6 w-full rounded-xl bg-[#1a73e8] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1765cc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a73e8] focus-visible:ring-offset-2 disabled:opacity-60"
            >
              {startMutation.isPending ? 'Iniciando…' : 'Iniciar prueba'}
            </button>

            {(whatsappHref || mailHref) && (
              <div className="mt-3 flex gap-2">
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-600" aria-hidden />
                    Contactar soporte
                  </a>
                )}
                {!whatsappHref && mailHref && (
                  <a
                    href={mailHref}
                    className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Contactar soporte
                  </a>
                )}
              </div>
            )}

            {startMutation.isError && (
              <p className="mt-3 text-sm text-rose-600">
                No se pudo iniciar la prueba. Intenta de nuevo.
              </p>
            )}

            <div className="mt-7 border-t border-slate-100 pt-6">
              <p className="text-sm text-slate-600">
                Todo lo incluido en tu plan, disponible durante la prueba:
              </p>
              <ul className="mt-4 space-y-3">
                {benefitLines(plan).map((line) => (
                  <li key={line} className="flex items-start gap-2.5 text-sm text-slate-800">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </article>

        <p className="mt-8 text-center text-xs text-slate-400">
          ¿Ya tienes cuenta activa?{' '}
          <Link to="/login" className="font-medium text-[#1a73e8] hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  );
}
