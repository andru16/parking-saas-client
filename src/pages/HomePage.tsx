import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getHealth } from '@/api/health';

export function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
  });

  return (
    <div className="space-y-6">
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Bienvenido a Parking SaaS</h2>
            <p className="mt-2 text-gray-600">
              Plataforma profesional para la gestión de estacionamientos.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/login"
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/registro"
              className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Registrarse
            </Link>
          </div>
        </div>
        <Link
          to="/registro"
          className="mt-4 inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700"
        >
          Crear cuenta gratis
        </Link>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">Estado del API</h3>
        <div className="mt-4">
          {isLoading && <p className="text-gray-500">Conectando con el servidor...</p>}
          {isError && (
            <p className="text-red-600">
              No se pudo conectar con el servidor. Verifica que el core esté en ejecución.
            </p>
          )}
          {data && (
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="text-gray-700">{data.message}</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
