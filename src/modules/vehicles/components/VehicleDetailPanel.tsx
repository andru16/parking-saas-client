import { useEffect, useState } from 'react';
import { hasPermission, PERMISSIONS } from '@/modules/auth/permissions';
import { useAuth } from '@/modules/auth/AuthProvider';
import { useUpdateVehicle, useVehicleDetail } from '@/modules/vehicles/hooks/useVehicles';

function formatMoney(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatMinutes(minutes: number | null) {
  if (minutes == null) return '—';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

export function VehicleDetailPanel({ vehicleId, onClose }: { vehicleId: string; onClose: () => void }) {
  const { user } = useAuth();
  const canUpdate = hasPermission(user?.permissions, PERMISSIONS.VEHICLES_UPDATE);
  const { data, isLoading } = useVehicleDetail(vehicleId);
  const update = useUpdateVehicle();
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data?.vehicle) {
      setNotes(data.vehicle.notes ?? '');
      setStatus(data.vehicle.status);
    }
  }, [data?.vehicle]);

  if (isLoading || !data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-400">Cargando detalle...</p>
      </div>
    );
  }

  const { vehicle, stats, owner, history, activeMembership } = data;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Detalle</p>
          <h2 className="text-xl font-semibold text-slate-900">{vehicle.plate}</h2>
          <p className="text-sm text-slate-500">
            {vehicle.vehicleCategoryId?.name ?? 'Sin categoría'}
            {vehicle.memberId?.name ? ` · ${vehicle.memberId.name}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          Cerrar
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label="Ingresos totales" value={String(stats.totalEntries)} />
        <Stat label="Recaudado" value={formatMoney(stats.totalCollected)} />
        <Stat
          label="Promedio permanencia"
          value={formatMinutes(stats.averageStayMinutes)}
        />
        <Stat
          label="Último ingreso"
          value={
            stats.lastEntryAt
              ? new Date(stats.lastEntryAt).toLocaleString('es-CO')
              : '—'
          }
        />
        <Stat
          label="Última salida"
          value={
            stats.lastExitAt ? new Date(stats.lastExitAt).toLocaleString('es-CO') : '—'
          }
        />
        <Stat
          label="Membresía activa"
          value={stats.hasActiveMembership ? 'Sí' : 'No'}
        />
      </div>

      {activeMembership && (
        <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-3 text-sm text-teal-900">
          Membresía vigente:{' '}
          <span className="font-medium">
            {(activeMembership as { name?: string }).name ?? 'Activa'}
          </span>
        </div>
      )}

      {owner && (
        <section>
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Propietario</h3>
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Nombre</dt>
              <dd className="font-medium text-slate-900">{owner.name}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Documento</dt>
              <dd className="text-slate-900">{owner.documentNumber ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Teléfono</dt>
              <dd className="text-slate-900">{owner.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Correo</dt>
              <dd className="text-slate-900">{owner.email ?? '—'}</dd>
            </div>
            {owner.address && (
              <div className="sm:col-span-2">
                <dt className="text-slate-500">Dirección</dt>
                <dd className="text-slate-900">{owner.address}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">Historial de ingresos</h3>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400">Sin ingresos registrados</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Ingreso</th>
                  <th className="px-3 py-2">Salida</th>
                  <th className="px-3 py-2">Duración</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr key={h._id}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {new Date(h.entryAt).toLocaleString('es-CO')}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {h.exitAt ? new Date(h.exitAt).toLocaleString('es-CO') : '—'}
                    </td>
                    <td className="px-3 py-2">{formatMinutes(h.durationMinutes ?? null)}</td>
                    <td className="px-3 py-2">
                      {h.coveredByMembership
                        ? 'Membresía'
                        : h.total != null
                          ? formatMoney(h.total)
                          : '—'}
                    </td>
                    <td className="px-3 py-2 capitalize">{h.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {canUpdate && (
        <form
          className="space-y-3 border-t border-slate-100 pt-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              await update.mutateAsync({
                id: vehicleId,
                payload: { notes: notes || null, status },
              });
            } catch (err) {
              setError(err instanceof Error ? err.message : 'No se pudo actualizar');
            }
          }}
        >
          <h3 className="text-sm font-semibold text-slate-900">Actualizar</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas"
              rows={2}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={update.isPending}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {update.isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
