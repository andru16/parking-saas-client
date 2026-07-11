import { Link } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';

export function NotFoundPage() {
  return (
    <AuthLayout title="Página no encontrada" subtitle="La ruta que busca no existe o fue movida.">
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 text-center space-y-4">
        <p className="text-6xl font-bold text-gray-200">404</p>
        <Link
          to="/"
          className="inline-flex w-full justify-center rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800"
        >
          Volver al inicio
        </Link>
      </div>
    </AuthLayout>
  );
}
