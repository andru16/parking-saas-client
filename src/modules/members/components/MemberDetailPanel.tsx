import { useState } from 'react';
import type { Member } from '@/api/members';
import { listVehicles } from '@/api/vehicles';
import {
  useLinkMemberVehicle,
  useMemberDetail,
  useUnlinkMemberVehicle,
} from '@/modules/members/hooks/useMembers';
import { MemberFormModal } from '@/modules/members/components/MemberFormModal';

function formatMoney(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const TABS = [
  { id: 'data', label: 'Datos' },
  { id: 'vehicles', label: 'Vehículos' },
  { id: 'memberships', label: 'Mensualidades' },
  { id: 'payments', label: 'Pagos' },
  { id: 'entries', label: 'Ingresos' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function MemberDetailPanel({
  memberId,
  onClose,
}: {
  memberId: string;
  onClose: () => void;
}) {
  const { data, isLoading } = useMemberDetail(memberId);
  const [tab, setTab] = useState<TabId>('data');
  const [showEdit, setShowEdit] = useState(false);

  if (isLoading || !data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-400">Cargando detalle...</p>
      </div>
    );
  }

  const { member, vehicles, memberships, payments, entries } = data;

  return (
    <>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Miembro</p>
            <h2 className="text-xl font-semibold text-slate-900">{member.name}</h2>
            <p className="text-sm text-slate-500">
              {member.documentType} {member.documentNumber ?? ''}
              {' · '}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  member.status === 'active'
                    ? 'bg-teal-50 text-teal-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {member.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowEdit(true)}
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
            >
              Editar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cerrar
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                tab === t.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'data' && <MemberDataTab member={member} />}
        {tab === 'vehicles' && (
          <MemberVehiclesTab memberId={memberId} vehicles={vehicles} />
        )}
        {tab === 'memberships' && <MemberMembershipsTab memberships={memberships} />}
        {tab === 'payments' && <MemberPaymentsTab payments={payments} />}
        {tab === 'entries' && <MemberEntriesTab entries={entries} />}
      </div>

      {showEdit && (
        <MemberFormModal member={member} onClose={() => setShowEdit(false)} />
      )}
    </>
  );
}

function MemberDataTab({ member }: { member: Member }) {
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      <Field label="Nombre" value={member.name} />
      <Field
        label="Documento"
        value={`${member.documentType ?? ''} ${member.documentNumber ?? '—'}`}
      />
      <Field label="Teléfono" value={member.phone ?? '—'} />
      <Field label="Correo" value={member.email ?? '—'} />
      <Field label="Dirección" value={member.address ?? '—'} className="sm:col-span-2" />
      <Field label="Observaciones" value={member.notes ?? '—'} className="sm:col-span-2" />
      <Field
        label="Creado"
        value={member.createdAt ? new Date(member.createdAt).toLocaleString('es-CO') : '—'}
      />
      <Field
        label="Actualizado"
        value={member.updatedAt ? new Date(member.updatedAt).toLocaleString('es-CO') : '—'}
      />
    </dl>
  );
}

function MemberVehiclesTab({
  memberId,
  vehicles,
}: {
  memberId: string;
  vehicles: Array<{
    _id: string;
    plate: string;
    status: string;
    vehicleCategoryId?: { name?: string } | null;
  }>;
}) {
  const link = useLinkMemberVehicle();
  const unlink = useUnlinkMemberVehicle();
  const [plateSearch, setPlateSearch] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{ _id: string; plate: string }>
  >([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!plateSearch.trim()) return;
    setSearching(true);
    setError(null);
    try {
      const res = await listVehicles({ search: plateSearch.trim(), limit: 10 });
      setSearchResults(res.data.items.map((v) => ({ _id: v._id, plate: v.plate })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          value={plateSearch}
          onChange={(e) => setPlateSearch(e.target.value)}
          placeholder="Buscar placa para vincular"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          disabled={searching}
          onClick={() => void handleSearch()}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          {searching ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {searchResults.length > 0 && (
        <ul className="space-y-1 rounded-lg border border-slate-200 p-2 text-sm">
          {searchResults.map((v) => (
            <li key={v._id} className="flex items-center justify-between gap-2">
              <span className="font-medium">{v.plate}</span>
              <button
                type="button"
                disabled={link.isPending}
                onClick={async () => {
                  setError(null);
                  try {
                    await link.mutateAsync({ memberId, vehicleId: v._id });
                    setSearchResults([]);
                    setPlateSearch('');
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'No se pudo vincular');
                  }
                }}
                className="text-xs text-teal-700 hover:underline"
              >
                Vincular
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {vehicles.length === 0 ? (
        <p className="text-sm text-slate-400">Sin vehículos vinculados</p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {vehicles.map((v) => (
            <li key={v._id} className="flex items-center justify-between px-3 py-2 text-sm">
              <div>
                <span className="font-medium text-slate-900">{v.plate}</span>
                <span className="ml-2 text-slate-500">
                  {v.vehicleCategoryId?.name ?? 'Sin categoría'} · {v.status}
                </span>
              </div>
              <button
                type="button"
                disabled={unlink.isPending}
                onClick={async () => {
                  try {
                    await unlink.mutateAsync({ memberId, vehicleId: v._id });
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'No se pudo desvincular');
                  }
                }}
                className="text-xs text-red-600 hover:underline"
              >
                Desvincular
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MemberMembershipsTab({
  memberships,
}: {
  memberships: Array<{
    _id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    amount?: number;
    vehicleId?: { plate?: string } | null;
  }>;
}) {
  if (memberships.length === 0) {
    return <p className="text-sm text-slate-400">Sin membresías</p>;
  }
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2">Nombre</th>
            <th className="px-3 py-2">Vehículo</th>
            <th className="px-3 py-2">Vigencia</th>
            <th className="px-3 py-2">Monto</th>
            <th className="px-3 py-2">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {memberships.map((m) => (
            <tr key={m._id}>
              <td className="px-3 py-2">{m.name}</td>
              <td className="px-3 py-2">{m.vehicleId?.plate ?? '—'}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                {new Date(m.startDate).toLocaleDateString('es-CO')} –{' '}
                {new Date(m.endDate).toLocaleDateString('es-CO')}
              </td>
              <td className="px-3 py-2">
                {m.amount != null ? formatMoney(m.amount) : '—'}
              </td>
              <td className="px-3 py-2 capitalize">{m.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MemberPaymentsTab({
  payments,
}: {
  payments: Array<{
    _id: string;
    amount: number;
    method: string;
    paidAt: string;
    notes?: string | null;
    vehicleId?: { plate?: string } | null;
    receivedByUserId?: { firstName?: string; lastName?: string } | null;
  }>;
}) {
  if (payments.length === 0) {
    return <p className="text-sm text-slate-400">Sin pagos registrados</p>;
  }
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2">Fecha</th>
            <th className="px-3 py-2">Monto</th>
            <th className="px-3 py-2">Método</th>
            <th className="px-3 py-2">Vehículo</th>
            <th className="px-3 py-2">Recibido por</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {payments.map((p) => (
            <tr key={p._id}>
              <td className="px-3 py-2 whitespace-nowrap">
                {new Date(p.paidAt).toLocaleString('es-CO')}
              </td>
              <td className="px-3 py-2">{formatMoney(p.amount)}</td>
              <td className="px-3 py-2">{p.method}</td>
              <td className="px-3 py-2">{p.vehicleId?.plate ?? '—'}</td>
              <td className="px-3 py-2">
                {p.receivedByUserId
                  ? `${p.receivedByUserId.firstName ?? ''} ${p.receivedByUserId.lastName ?? ''}`.trim()
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MemberEntriesTab({
  entries,
}: {
  entries: Array<{
    _id: string;
    status: string;
    entryAt: string;
    exitAt?: string | null;
    total?: number;
    coveredByMembership?: boolean;
    vehicleId?: { plate?: string } | null;
  }>;
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-slate-400">Sin ingresos registrados</p>;
  }
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-3 py-2">Placa</th>
            <th className="px-3 py-2">Ingreso</th>
            <th className="px-3 py-2">Salida</th>
            <th className="px-3 py-2">Total</th>
            <th className="px-3 py-2">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {entries.map((e) => (
            <tr key={e._id}>
              <td className="px-3 py-2">{e.vehicleId?.plate ?? '—'}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                {new Date(e.entryAt).toLocaleString('es-CO')}
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                {e.exitAt ? new Date(e.exitAt).toLocaleString('es-CO') : '—'}
              </td>
              <td className="px-3 py-2">
                {e.coveredByMembership
                  ? 'Membresía'
                  : e.total != null
                    ? formatMoney(e.total)
                    : '—'}
              </td>
              <td className="px-3 py-2 capitalize">{e.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Field({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}
