import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth/AuthProvider';

/** Rutas públicas donde no se fuerza el flujo de sesión expirada. */
const GUEST_PUBLIC_PATHS = new Set(['/registro', '/recuperar-contrasena', '/sesion-expirada']);

export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user, sessionExpired, clearSessionExpired } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (sessionExpired && location.pathname === '/registro') {
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

  // Permitir registro / recuperación aunque haya bandera de sesión expirada.
  if (sessionExpired && !GUEST_PUBLIC_PATHS.has(location.pathname)) {
    return <Navigate to="/sesion-expirada" replace />;
  }

  if (isAuthenticated && user && location.pathname !== '/registro') {
    const dest = user.organization && !user.organization.isSetupComplete ? '/setup' : '/dashboard';
    return <Navigate to={dest} replace />;
  }

  return children;
}
