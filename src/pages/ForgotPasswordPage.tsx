import { Link } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';

export function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Esta funcionalidad estará disponible próximamente."
    >
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 space-y-4">
        <p className="text-sm text-gray-600">
          Estamos preparando el flujo de recuperación de contraseña. Mientras tanto, contacte al
          administrador de su parqueadero si necesita restablecer su acceso.
        </p>
        <Link
          to="/login"
          className="inline-flex w-full justify-center rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </AuthLayout>
  );
}
