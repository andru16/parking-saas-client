import type { AuthUser } from '@/api/auth';

function subscriptionOf(user: AuthUser) {
  return user.organization?.subscription ?? null;
}

/** Ruta post-login según suscripción y setup. */
export function getPostLoginPath(user: AuthUser): string {
  const sub = subscriptionOf(user);

  if (sub?.accessMode === 'blocked' || sub?.isBlocked || sub?.status === 'expired') {
    return '/prueba-finalizada';
  }

  if (sub?.status === 'awaiting_activation' || sub?.isAwaitingActivation) {
    return '/bienvenida-plan';
  }

  if (user.organization && !user.organization.isSetupComplete) {
    return '/setup';
  }

  return '/dashboard';
}

/** Redirección para usuarios ya autenticados que visitan rutas públicas */
export function getAuthenticatedHomePath(user: AuthUser): string {
  return getPostLoginPath(user);
}

/** Resuelve ruta de retorno tras login (prioriza destino original) */
export function resolveLoginRedirect(user: AuthUser, fromPath?: string | null): string {
  const sub = subscriptionOf(user);
  if (sub?.accessMode === 'blocked' || sub?.isBlocked || sub?.status === 'expired') {
    return '/prueba-finalizada';
  }
  if (sub?.status === 'awaiting_activation' || sub?.isAwaitingActivation) {
    return '/bienvenida-plan';
  }

  if (fromPath && fromPath !== '/login' && fromPath !== '/registro') {
    return fromPath;
  }
  return getPostLoginPath(user);
}
