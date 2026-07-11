import { useState } from 'react';
import { hasPermission, PERMISSIONS } from '@/modules/auth/permissions';
import { useAuth } from '@/modules/auth/AuthProvider';
import { MemberDetailPanel } from '@/modules/members/components/MemberDetailPanel';
import { MemberFormModal } from '@/modules/members/components/MemberFormModal';
import { useMembersList } from '@/modules/members/hooks/useMembers';

export function MembersPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, PERMISSIONS.MEMBERS_MANAGE);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useMembersList({
    page,
    search: search || undefined,
    status: status || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500">
            Clientes con mensualidad, vehículos asociados e historial.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Nuevo cliente
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por nombre o documento..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Documento</th>
              <th className="px-4 py-3">Teléfono</th>
              <th className="px-4 py-3">Correo</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Actualizado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  Cargando...
                </td>
              </tr>
            )}
            {!isLoading && (data?.items.length ?? 0) === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No hay miembros registrados
                </td>
              </tr>
            )}
            {data?.items.map((m) => (
              <tr
                key={m._id}
                onClick={() => setSelectedId(m._id)}
                className={`cursor-pointer hover:bg-slate-50 ${
                  selectedId === m._id ? 'bg-teal-50/40' : ''
                }`}
              >
                <td className="px-4 py-3 font-medium text-teal-800">{m.name}</td>
                <td className="px-4 py-3">
                  {m.documentType} {m.documentNumber ?? '—'}
                </td>
                <td className="px-4 py-3">{m.phone ?? '—'}</td>
                <td className="px-4 py-3">{m.email ?? '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      m.status === 'active'
                        ? 'bg-teal-50 text-teal-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {m.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                  {m.updatedAt ? new Date(m.updatedAt).toLocaleString('es-CO') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(data?.pagination.totalPages ?? 0) > 1 && (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border px-3 py-1 text-xs disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={page >= (data?.pagination.totalPages ?? 1)}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border px-3 py-1 text-xs disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {selectedId && (
        <MemberDetailPanel memberId={selectedId} onClose={() => setSelectedId(null)} />
      )}

      {showForm && <MemberFormModal onClose={() => setShowForm(false)} />}
    </div>
  );
}
