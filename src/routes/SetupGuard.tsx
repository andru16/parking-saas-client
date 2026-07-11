import { Navigate, useSearchParams } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';

/**
 * Redirige al setup wizard si la organización no completó la configuración inicial.
 */
export function SetupGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth();

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

  if (user?.organization?.isSetupComplete && !reopen) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
