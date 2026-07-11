import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listFrequentVehicles } from '@/api/vehicles';
import { useAuth } from '@/modules/auth/AuthProvider';
import { hasPermission, PERMISSIONS } from '@/modules/auth/permissions';

export function FrequentVehicles() {
  const { user } = useAuth();
  const canView = hasPermission(user?.permissions, [
    PERMISSIONS.VEHICLES_VIEW,
    PERMISSIONS.REPORTS_VIEW,
  ]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'frequent-vehicles'],
    enabled: canView,
    queryFn: async () => (await listFrequentVehicles({ days: 30, limit: 8 })).data.items,
  });

  if (!canView) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Vehículos frecuentes</h2>
          <p className="text-xs text-slate-500">Más ingresos en los últimos 30 días</p>
        </div>
        <Link to="/reports" className="text-xs font-medium text-teal-700 hover:underline">
          Ver reportes
        </Link>
      </header>

      <div className="p-2">
        {isLoading && <p className="px-2 py-4 text-center text-xs text-slate-400">Cargando...</p>}
        {isError && (
          <p className="px-2 py-4 text-center text-xs text-rose-600">No se pudo cargar</p>
        )}
        {!isLoading && !isError && (data?.length ?? 0) === 0 && (
          <p className="px-2 py-4 text-center text-xs text-slate-400">Sin datos aún</p>
        )}
        <ul className="divide-y divide-slate-50">
          {data?.map((row) => (
            <li key={String(row.vehicleId)} className="flex items-center justify-between px-2 py-2">
              <span className="font-mono text-sm font-semibold text-slate-800">{row.plate}</span>
              <span className="text-xs tabular-nums text-slate-500">{row.entries} ingresos</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
