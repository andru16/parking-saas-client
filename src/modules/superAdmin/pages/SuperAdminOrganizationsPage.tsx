import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminOrganizations } from '@/modules/superAdmin/api';

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'Activas' },
  { value: 'trial', label: 'Trial' },
  { value: 'suspended', label: 'Suspendidas' },
  { value: 'pending_verification', label: 'Pend. verificación' },
];

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-800',
  trial: 'bg-sky-50 text-sky-800',
  suspended: 'bg-rose-50 text-rose-800',
  pending_verification: 'bg-amber-50 text-amber-900',
};

export function SuperAdminOrganizationsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [draftSearch, setDraftSearch] = useState('');

  const query = useQuery({
    queryKey: ['super-admin', 'organizations', search, status, page],
    queryFn: async () =>
      (
        await fetchAdminOrganizations({
          search: search || undefined,
          status: status || undefined,
          page,
          limit: 20,
        })
      ).data,
  });

  const rows = query.data?.organizations ?? [];
  const pagination = query.data?.pagination;

  const subtitle = useMemo(() => {
    if (!pagination) return '';
    return `${pagination.total} organización(es)`;
  }, [pagination]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Organizaciones</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle || 'Gestión multi-tenant de la plataforma'}</p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <form
          className="flex flex-1 flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(draftSearch.trim());
          }}
        >
          <input
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            placeholder="Buscar por nombre, correo, ciudad o NIT"
            className="min-w-[220px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
          />
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Buscar
          </button>
        </form>

        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value || 'all'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Organización</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Vence</th>
              <th className="px-4 py-3">Registro</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {query.isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Cargando...
                </td>
              </tr>
            )}
            {!query.isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  No hay organizaciones con esos filtros
                </td>
              </tr>
            )}
            {rows.map((org) => (
              <tr key={org.id} className="hover:bg-slate-50/80">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{org.name}</p>
                  <p className="text-xs text-slate-500">
                    {[org.city, org.country].filter(Boolean).join(', ') || org.email}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[org.status] ?? 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {org.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {org.subscription?.planName ?? '—'}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {org.subscription?.endDate
                    ? new Date(org.subscription.endDate).toLocaleDateString('es-CO')
                    : '—'}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {new Date(org.createdAt).toLocaleDateString('es-CO')}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/admin/organizations/${org.id}`}
                    className="font-medium text-teal-700 hover:text-teal-800"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-slate-500">
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
