import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, sessionExpired } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Verificando sesión...</p>
      </div>
    );
  }

  if (sessionExpired) {
    return <Navigate to="/sesion-expirada" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
