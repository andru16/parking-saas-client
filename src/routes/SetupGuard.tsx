import { Navigate, useSearchParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';

/**
 * Redirige al setup wizard si la organización no completó la configuración inicial.
 * Respeta estados de activación / bloqueo de suscripción.
 */
export function SetupGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const sub = user?.organization?.subscription;

  if (sub?.isBlocked || sub?.accessMode === 'blocked') {
    return <Navigate to="/prueba-finalizada" replace />;
  }

  if (
    sub?.status === 'awaiting_activation' ||
    sub?.isAwaitingActivation ||
    sub?.accessMode === 'activation_pending'
  ) {
    return <Navigate to="/bienvenida-plan" replace />;
  }

  if (user?.organization && !user.organization.isSetupComplete) {
    return <Navigate to="/setup" replace />;
  }

  return children;
}

/**
 * Permite acceso al setup en primera ejecución.
 * Si ya está completo, redirige al dashboard salvo reapertura (?reopen=1).
 */
export function SetupRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const reopen = searchParams.get('reopen') === '1';
  const sub = user?.organization?.subscription;

  if (sub?.isBlocked || sub?.accessMode === 'blocked') {
    return <Navigate to="/prueba-finalizada" replace />;
  }

  if (
    sub?.status === 'awaiting_activation' ||
    sub?.isAwaitingActivation ||
    sub?.accessMode === 'activation_pending'
  ) {
    return <Navigate to="/bienvenida-plan" replace />;
  }

  if (user?.organization?.isSetupComplete && !reopen) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
