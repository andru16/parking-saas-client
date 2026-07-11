import type { AuthUser } from '@/api/auth';

/** Ruta post-login según estado del setup wizard */
export function getPostLoginPath(user: AuthUser): string {
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
  if (fromPath && fromPath !== '/login' && fromPath !== '/registro') {
    return fromPath;
  }
  return getPostLoginPath(user);
}
