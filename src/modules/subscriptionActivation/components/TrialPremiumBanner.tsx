import { Link } from 'react-router-dom';
import { useAuth } from '@/modules/auth/AuthProvider';

/**
 * Banner superior durante TRIAL_PREMIUM.
 */
export function TrialPremiumBanner() {
  const { user } = useAuth();
  const sub = user?.organization?.subscription;

  if (!sub || sub.status !== 'trial_premium') return null;

  const planName = sub.plan?.name || 'seleccionado';
  const days = sub.daysRemaining ?? 0;

  return (
    <div
      role="status"
      className="border-b border-amber-200 bg-amber-50 text-amber-950"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="text-sm">
          <p className="font-semibold">
            Actualmente estás utilizando una prueba gratuita del Plan {planName}.
          </p>
          <p className="text-amber-900/80">
            Tu prueba finaliza en {days} {days === 1 ? 'día' : 'días'}.
          </p>
        </div>
        <Link
          to="/activar-suscripcion"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-amber-900 px-4 py-2 text-sm font-semibold text-amber-50 transition hover:bg-amber-950"
        >
          Activar suscripción
        </Link>
      </div>
    </div>
  );
}
