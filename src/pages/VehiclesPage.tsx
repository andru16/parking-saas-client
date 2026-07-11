import { useState } from 'react';
import { VehicleDetailPanel } from '@/modules/vehicles/components/VehicleDetailPanel';
import { useVehiclesList } from '@/modules/vehicles/hooks/useVehicles';

const PRESENCE_LABELS: Record<string, string> = {
  inside: 'Dentro',
  outside: 'Fuera',
};

const PRESENCE_COLORS: Record<string, string> = {
  inside: 'bg-teal-50 text-teal-800',
  outside: 'bg-slate-100 text-slate-600',
};

export function VehiclesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [presence, setPresence] = useState('');
  const [status, setStatus] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data, isLoading } = useVehiclesList({
    page,
    search: search || undefined,
    presence: presence || undefined,
    status: status || undefined,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vehículos</h1>
        <p className="text-sm text-slate-500">
          Consulta el parque vehicular, presencia y historial de ingresos.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar por placa..."
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={presence}
          onChange={(e) => {
            setPresence(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Toda presencia</option>
          <option value="inside">Dentro</option>
          <option value="outside">Fuera</option>
        </select>
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
              <th className="px-4 py-3">Placa</th>
              <th className="px-4 py-3">Tipo / Categoría</th>
              <th className="px-4 py-3">Presencia</th>
              <th className="px-4 py-3">Miembro</th>
              <th className="px-4 py-3">Membresía activa</th>
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
                  Los vehículos se crean automáticamente al ingresar en Operaciones
                </td>
              </tr>
            )}
            {data?.items.map((v) => (
              <tr
                key={v._id}
                onClick={() => setSelectedId(v._id)}
                className={`cursor-pointer hover:bg-slate-50 ${
                  selectedId === v._id ? 'bg-teal-50/40' : ''
                }`}
              >
                <td className="px-4 py-3 font-medium text-teal-800">{v.plate}</td>
                <td className="px-4 py-3">{v.vehicleCategoryId?.name ?? '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRESENCE_COLORS[v.presence] ?? ''}`}
                  >
                    {PRESENCE_LABELS[v.presence] ?? v.presence}
                  </span>
                </td>
                <td className="px-4 py-3">{v.memberId?.name ?? '—'}</td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                  {v.updatedAt ? new Date(v.updatedAt).toLocaleString('es-CO') : '—'}
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
        <VehicleDetailPanel vehicleId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
