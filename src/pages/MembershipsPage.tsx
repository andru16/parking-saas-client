import { useState } from 'react';
import type { ParkingMembership } from '@/api/parkingMemberships';
import { hasPermission, PERMISSIONS } from '@/modules/auth/permissions';
import { useAuth } from '@/modules/auth/AuthProvider';
import {
  DISPLAY_STATUS_COLORS,
  DISPLAY_STATUS_LABELS,
  MembershipDetailPanel,
  MembershipFormModal,
  RenewMembershipModal,
} from '@/modules/memberships/components/MembershipModals';
import { useMembershipsList } from '@/modules/memberships/hooks/useMemberships';

export function MembershipsPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, PERMISSIONS.MEMBERSHIPS_MANAGE);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editMembership, setEditMembership] = useState<ParkingMembership | null>(null);
  const [renewId, setRenewId] = useState<string | null>(null);

  const { data, isLoading } = useMembershipsList({
    page,
    search: search || undefined,
    status: status || undefined,
  });

  const selectedMembership = data?.items.find((m) => m._id === selectedId) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mensualidades</h1>
          <p className="text-sm text-slate-500">
            Planes de estacionamiento, vigencia y vehículos cubiertos.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Nueva mensualidad
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
          placeholder="Buscar por nombre, miembro o placa..."
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
          <option value="active">Activa</option>
          <option value="expiring">Próxima a vencer</option>
          <option value="expired">Vencida</option>
          <option value="suspended">Suspendida</option>
          <option value="cancelled">Cancelada</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nombre</th>
              <th className="px-4 py-3">Miembro</th>
              <th className="px-4 py-3">Vehículo</th>
              <th className="px-4 py-3">Vigencia</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Monto</th>
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
                  No hay membresías registradas
                </td>
              </tr>
            )}
            {data?.items.map((m) => {
              const displayStatus = m.displayStatus ?? m.status;
              return (
                <tr
                  key={m._id}
                  onClick={() => setSelectedId(m._id)}
                  className={`cursor-pointer hover:bg-slate-50 ${
                    selectedId === m._id ? 'bg-teal-50/40' : ''
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-teal-800">{m.name}</td>
                  <td className="px-4 py-3">{m.memberId?.name ?? '—'}</td>
                  <td className="px-4 py-3">{m.vehicleId?.plate ?? '—'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {new Date(m.startDate).toLocaleDateString('es-CO')} –{' '}
                    {new Date(m.endDate).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${DISPLAY_STATUS_COLORS[displayStatus] ?? ''}`}
                    >
                      {DISPLAY_STATUS_LABELS[displayStatus] ?? displayStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {m.amount != null
                      ? new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          minimumFractionDigits: 0,
                        }).format(m.amount)
                      : '—'}
                  </td>
                </tr>
              );
            })}
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
        <MembershipDetailPanel
          membershipId={selectedId}
          onClose={() => setSelectedId(null)}
          onEdit={() => {
            if (selectedMembership) setEditMembership(selectedMembership);
          }}
          onRenew={() => setRenewId(selectedId)}
          onChangeStatus={() => {}}
        />
      )}

      {showForm && <MembershipFormModal onClose={() => setShowForm(false)} />}
      {editMembership && (
        <MembershipFormModal
          membership={editMembership}
          onClose={() => setEditMembership(null)}
        />
      )}
      {renewId && (
        <RenewMembershipModal membershipId={renewId} onClose={() => setRenewId(null)} />
      )}
    </div>
  );
}
