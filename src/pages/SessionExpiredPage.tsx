import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/AuthProvider';
import { AuthLayout } from '@/layouts/AuthLayout';

export function SessionExpiredPage() {
  const { clearSessionExpired, sessionExpired, isAuthenticated, isLoading } = useAuth();

  // Sin sesión previa / bandera: no tiene sentido mostrar esta pantalla.
  if (!isLoading && !sessionExpired && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AuthLayout title="Sesión expirada" subtitle="Su sesión ha finalizado por inactividad o seguridad.">
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xl">
          ⏱
        </div>
        <p className="text-sm text-gray-600">
          Por favor inicie sesión nuevamente para continuar trabajando en el parqueadero.
        </p>
        <Link
          to="/login"
          onClick={clearSessionExpired}
          className="inline-flex w-full justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Ir al inicio de sesión
        </Link>
      </div>
    </AuthLayout>
  );
}
