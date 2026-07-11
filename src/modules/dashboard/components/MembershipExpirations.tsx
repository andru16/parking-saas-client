import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchReport } from '@/api/reports';
import { useAuth } from '@/modules/auth/AuthProvider';
import { hasPermission, PERMISSIONS } from '@/modules/auth/permissions';

const DAYS_AHEAD = 30;

export function MembershipExpirations() {
  const { user } = useAuth();
  const canView = hasPermission(user?.permissions, [
    PERMISSIONS.MEMBERSHIPS_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
  ]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'membership-expirations'],
    enabled: canView,
    queryFn: async () => {
      const res = await fetchReport('memberships', { page: 1, limit: 50 });
      return res.data.rows;
    },
  });

  const upcoming = useMemo(() => {
    if (!data) return [];
    const now = Date.now();
    const limit = now + DAYS_AHEAD * 24 * 60 * 60 * 1000;

    return data
      .map((row) => {
        const end = row.endDate ? new Date(String(row.endDate)).getTime() : NaN;
        return {
          name: String(row.name ?? 'Membresía'),
          status: String(row.status ?? ''),
          endDate: Number.isFinite(end) ? new Date(end) : null,
          endMs: end,
        };
      })
      .filter((m) => m.endDate && m.endMs >= now && m.endMs <= limit)
      .sort((a, b) => a.endMs - b.endMs)
      .slice(0, 8);
  }, [data]);

  if (!canView) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Próximos vencimientos</h2>
          <p className="text-xs text-slate-500">Membresías en los próximos {DAYS_AHEAD} días</p>
        </div>
        <Link to="/memberships" className="text-xs font-medium text-teal-700 hover:underline">
          Ver todas
        </Link>
      </header>

      <div className="p-2">
        {isLoading && <p className="p-3 text-sm text-slate-400">Cargando...</p>}
        {isError && (
          <p className="p-3 text-sm text-amber-700">No se pudieron cargar las membresías.</p>
        )}
        {!isLoading && !isError && upcoming.length === 0 && (
          <p className="p-4 text-center text-sm text-slate-400">
            No hay vencimientos próximos
          </p>
        )}
        <ul className="divide-y divide-slate-50">
          {upcoming.map((item) => (
            <li key={`${item.name}-${item.endMs}`} className="flex items-center justify-between px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.name}</p>
                <p className="text-xs text-slate-500">{item.status}</p>
              </div>
              <p className="text-xs font-medium text-amber-700">
                {item.endDate?.toLocaleDateString('es-CO')}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
