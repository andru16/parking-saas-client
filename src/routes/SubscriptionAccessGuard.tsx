import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { getPostLoginPath } from '@/modules/auth/authRedirect';

const ALLOWED_WHEN_AWAITING = [
  '/bienvenida-plan',
  '/activar-suscripcion',
  '/prueba-finalizada',
  '/soporte-contacto',
];

const ALLOWED_WHEN_BLOCKED = [
  '/prueba-finalizada',
  '/activar-suscripcion',
  '/soporte-contacto',
];

/**
 * Restringe el acceso según el estado de suscripción (awaiting / blocked).
 */
export function SubscriptionAccessGuard({ children }: { children?: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const sub = user?.organization?.subscription;
  const path = location.pathname;

  if (!user?.organization || !sub) {
    return children ? <>{children}</> : <Outlet />;
  }

  const awaiting =
    sub.status === 'awaiting_activation' ||
    sub.isAwaitingActivation ||
    sub.accessMode === 'activation_pending';

  const blocked = Boolean(sub.isBlocked || sub.accessMode === 'blocked');

  if (awaiting && !ALLOWED_WHEN_AWAITING.some((p) => path.startsWith(p))) {
    return <Navigate to="/bienvenida-plan" replace />;
  }

  if (blocked && !ALLOWED_WHEN_BLOCKED.some((p) => path.startsWith(p))) {
    return <Navigate to="/prueba-finalizada" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

/** Si ya tiene acceso operativo, saca de pantallas de onboarding de plan. */
export function PlanOnboardingRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const sub = user?.organization?.subscription;

  if (
    sub &&
    sub.status !== 'awaiting_activation' &&
    !sub.isAwaitingActivation &&
    sub.accessMode !== 'activation_pending' &&
    sub.accessMode !== 'blocked' &&
    !sub.isBlocked
  ) {
    return <Navigate to={getPostLoginPath(user!)} replace />;
  }

  return children;
}
