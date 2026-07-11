import { Link } from 'react-router-dom';

export function AccessDeniedPage() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600">
        !
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Acceso denegado</h1>
      <p className="mt-3 text-gray-600">
        No tiene permisos para acceder a esta sección. Si cree que es un error, contacte al
        administrador de su organización.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/dashboard"
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Ir al Dashboard
        </Link>
        <Link
          to="/"
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Inicio
        </Link>
      </div>
    </div>
  );
}
