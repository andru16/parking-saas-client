import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/AuthProvider';

/**
 * Rutas públicas de invitado: nunca forzar pantallazo de “sesión expirada”.
 * Esa pantalla solo aplica cuando había sesión y expiró.
 */
const GUEST_PUBLIC_PATHS = new Set([
  '/login',
  '/registro',
  '/recuperar-contrasena',
  '/sesion-expirada',
]);

export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user, sessionExpired, clearSessionExpired } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Si llega a login/registro con la bandera, límpiala: es un visitante entrando al flujo público.
    if (sessionExpired && (location.pathname === '/login' || location.pathname === '/registro')) {
      clearSessionExpired();
    }
  }, [sessionExpired, location.pathname, clearSessionExpired]);

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (sessionExpired && !GUEST_PUBLIC_PATHS.has(location.pathname)) {
    return <Navigate to="/sesion-expirada" replace />;
  }

  if (isAuthenticated && user && location.pathname !== '/registro') {
    const dest = user.organization && !user.organization.isSetupComplete ? '/setup' : '/dashboard';
    return <Navigate to={dest} replace />;
  }

  return children;
}
