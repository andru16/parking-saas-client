import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import type { MembershipStatus, ParkingMembership } from '@/api/parkingMemberships';
import { getMember, listMembers } from '@/api/members';
import { listVehicleCategories } from '@/api/tickets';
import {
  useChangeMembershipStatus,
  useCreateMembership,
  useMembershipDetail,
  useRenewMembership,
  useUpdateMembership,
} from '@/modules/memberships/hooks/useMemberships';
import { useOrgPaymentMethods } from '@/modules/payments/hooks/useOrgPayments';
import { validatePersonContactFields } from '@/lib/validation/contactFields';
import {
  normalizePlate,
  plateKindLabel,
  resolveCategoryFromPlate,
} from '@/modules/operations/utils/colombianPlate';

function formatMoney(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const DISPLAY_STATUS_LABELS: Record<string, string> = {
  active: 'Activa',
  expiring: 'Próxima a vencer',
  expired: 'Vencida',
  suspended: 'Suspendida',
  cancelled: 'Cancelada',
};

export const DISPLAY_STATUS_COLORS: Record<string, string> = {
  active: 'bg-teal-50 text-teal-800',
  expiring: 'bg-amber-50 text-amber-800',
  expired: 'bg-red-50 text-red-800',
  suspended: 'bg-violet-50 text-violet-800',
  cancelled: 'bg-slate-100 text-slate-600',
};

export function MembershipFormModal({
  membership,
  onClose,
}: {
  membership?: ParkingMembership | null;
  onClose: () => void;
}) {
  const isEdit = Boolean(membership);
  const create = useCreateMembership();
  const update = useUpdateMembership();

  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing');
  const [memberId, setMemberId] = useState(membership?.memberId?._id ?? '');
  const [newClient, setNewClient] = useState({
    name: '',
    documentType: 'CC',
    documentNumber: '',
    phone: '',
    email: '',
    address: '',
  });

  const [vehicleMode, setVehicleMode] = useState<'existing' | 'plate'>('existing');
  const [vehicleId, setVehicleId] = useState(membership?.vehicleId?._id ?? '');
  const [plate, setPlate] = useState('');

  const [membershipType, setMembershipType] = useState(
    membership?.membershipType ?? 'Mensualidad',
  );
  const [startDate, setStartDate] = useState(
    membership?.startDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
  );
  const [endDate, setEndDate] = useState(
    membership?.endDate?.slice(0, 10) ??
      new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  );
  const [amount, setAmount] = useState(String(membership?.amount ?? ''));
  const [autoRenew, setAutoRenew] = useState(membership?.autoRenew ?? false);
  const [notes, setNotes] = useState(membership?.notes ?? '');
  const [error, setError] = useState<string | null>(null);

  const [members, setMembers] = useState<Array<{ _id: string; name: string }>>([]);
  const [vehicles, setVehicles] = useState<Array<{ _id: string; plate: string }>>([]);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; icon: string }>
  >([]);
  const [loadingOptions, setLoadingOptions] = useState(!isEdit);

  useEffect(() => {
    if (isEdit) return;
    let active = true;
    void (async () => {
      try {
        const [membersRes, catsRes] = await Promise.all([
          listMembers({ limit: 100, status: 'active' }),
          listVehicleCategories(),
        ]);
        if (!active) return;
        setMembers(membersRes.data.items.map((m) => ({ _id: m._id, name: m.name })));
        setCategories(
          catsRes.data.categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon })),
        );
      } finally {
        if (active) setLoadingOptions(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isEdit]);

  useEffect(() => {
    if (isEdit || clientMode !== 'existing' || !memberId) {
      if (!isEdit && (clientMode === 'new' || !memberId)) {
        setVehicles([]);
        setVehicleMode('plate');
      }
      return;
    }
    let active = true;
    void (async () => {
      try {
        const detail = await getMember(memberId);
        const memberVehicles = detail.data.vehicles.map((v) => ({
          _id: v._id,
          plate: v.plate,
        }));
        if (!active) return;
        setVehicles(memberVehicles);
        setVehicleMode(memberVehicles.length > 0 ? 'existing' : 'plate');
        setVehicleId('');
      } catch {
        if (active) {
          setVehicles([]);
          setVehicleMode('plate');
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [memberId, isEdit, clientMode]);

  const pending = create.isPending || update.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        className="max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          const parsedAmount = amount ? Number(amount) : undefined;
          try {
            if (isEdit && membership) {
              await update.mutateAsync({
                id: membership._id,
                payload: {
                  name: membershipType,
                  membershipType,
                  startDate,
                  endDate,
                  amount: parsedAmount,
                  autoRenew,
                  notes: notes || null,
                },
              });
            } else {
              if (clientMode === 'existing' && !memberId) {
                setError('Seleccione un cliente');
                return;
              }
              if (clientMode === 'new') {
                const clientError = validatePersonContactFields({
                  name: newClient.name,
                  email: newClient.email,
                  phone: newClient.phone,
                });
                if (clientError) {
                  setError(clientError);
                  return;
                }
              }
              if (vehicleMode === 'existing' && !vehicleId) {
                setError('Seleccione un vehículo o registre una placa');
                return;
              }

              let platePayload: { plate: string; vehicleCategoryId: string } | null = null;
              if (vehicleMode === 'plate') {
                const normalizedPlate = normalizePlate(plate);
                if (!normalizedPlate) {
                  setError('Ingrese la placa del vehículo');
                  return;
                }
                const resolved = resolveCategoryFromPlate(normalizedPlate, categories);
                if (resolved.message) {
                  setError(resolved.message);
                  return;
                }
                if (!resolved.categoryId) {
                  setError(
                    'No se pudo detectar la categoría por la placa. Verifique el formato (ej. CBF424 o ZGT26F).',
                  );
                  return;
                }
                platePayload = {
                  plate: normalizedPlate,
                  vehicleCategoryId: resolved.categoryId,
                };
              }

              await create.mutateAsync({
                ...(clientMode === 'existing'
                  ? { memberId }
                  : {
                      member: {
                        name: newClient.name.trim(),
                        documentType: newClient.documentType,
                        documentNumber: newClient.documentNumber.trim() || null,
                        phone: newClient.phone.trim() || null,
                        email: newClient.email.trim() || null,
                        address: newClient.address.trim() || null,
                      },
                    }),
                ...(vehicleMode === 'existing' ? { vehicleId } : platePayload!),
                membershipType,
                startDate,
                endDate,
                amount: parsedAmount,
                autoRenew,
                notes: notes || null,
              });
            }
            onClose();
          } catch (err) {
            setError(
              isAxiosError(err)
                ? (err.response?.data?.message ?? 'No se pudo guardar')
                : 'No se pudo guardar',
            );
          }
        }}
      >
        <h2 className="text-lg font-semibold text-slate-900">
          {isEdit ? 'Editar mensualidad' : 'Nueva mensualidad'}
        </h2>

        {!isEdit && (
          <>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setClientMode('existing')}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${
                  clientMode === 'existing' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Cliente existente
              </button>
              <button
                type="button"
                onClick={() => {
                  setClientMode('new');
                  setMemberId('');
                  setVehicleMode('plate');
                }}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${
                  clientMode === 'new' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Nuevo cliente
              </button>
            </div>

            {clientMode === 'existing' ? (
              <select
                required
                value={memberId}
                onChange={(e) => {
                  setMemberId(e.target.value);
                  setVehicleId('');
                }}
                disabled={loadingOptions}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Seleccionar cliente *</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Datos del cliente
                </p>
                <input
                  required
                  value={newClient.name}
                  onChange={(e) => setNewClient((c) => ({ ...c, name: e.target.value }))}
                  placeholder="Nombre completo *"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={newClient.documentType}
                    onChange={(e) => setNewClient((c) => ({ ...c, documentType: e.target.value }))}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="NIT">NIT</option>
                    <option value="PASSPORT">Pasaporte</option>
                    <option value="OTHER">Otro</option>
                  </select>
                  <input
                    value={newClient.documentNumber}
                    onChange={(e) =>
                      setNewClient((c) => ({ ...c, documentNumber: e.target.value }))
                    }
                    placeholder="Documento"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={newClient.phone}
                    onChange={(e) => setNewClient((c) => ({ ...c, phone: e.target.value }))}
                    placeholder="Teléfono"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient((c) => ({ ...c, email: e.target.value }))}
                    placeholder="Correo"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <input
                  value={newClient.address}
                  onChange={(e) => setNewClient((c) => ({ ...c, address: e.target.value }))}
                  placeholder="Dirección"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            )}

            {clientMode === 'existing' && vehicles.length > 0 && (
              <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setVehicleMode('existing')}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${
                    vehicleMode === 'existing'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600'
                  }`}
                >
                  Vehículo del cliente
                </button>
                <button
                  type="button"
                  onClick={() => setVehicleMode('plate')}
                  className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${
                    vehicleMode === 'plate' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Otra placa
                </button>
              </div>
            )}

            {vehicleMode === 'existing' && vehicles.length > 0 ? (
              <select
                required
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                disabled={!memberId}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Seleccionar vehículo *</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.plate}
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Vehículo
                </p>
                <input
                  required
                  value={plate}
                  onChange={(e) => setPlate(normalizePlate(e.target.value))}
                  placeholder="Placa * (ej. CBF424 o ZGT26F)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono uppercase"
                />
                {(() => {
                  const resolved = resolveCategoryFromPlate(normalizePlate(plate), categories);
                  const detected = categories.find((c) => c.id === resolved.categoryId);
                  if (!normalizePlate(plate)) {
                    return (
                      <p className="text-xs text-slate-500">
                        La categoría se asigna automáticamente según el formato de la placa.
                      </p>
                    );
                  }
                  if (resolved.message) {
                    return <p className="text-xs text-amber-700">{resolved.message}</p>;
                  }
                  if (detected) {
                    return (
                      <p className="text-xs text-emerald-700">
                        Categoría detectada: <strong>{detected.name}</strong>
                        {resolved.plateKind !== 'unknown' && (
                          <> (placa de {plateKindLabel(resolved.plateKind)})</>
                        )}
                      </p>
                    );
                  }
                  return (
                    <p className="text-xs text-amber-700">
                      No se pudo detectar la categoría. Use un formato válido de placa colombiana.
                    </p>
                  );
                })()}
                <p className="text-xs text-slate-500">
                  Si la placa ya existe, se reutiliza y se asocia al cliente.
                </p>
              </div>
            )}
          </>
        )}

        <input
          required
          value={membershipType}
          onChange={(e) => setMembershipType(e.target.value)}
          placeholder="Tipo de mensualidad *"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-slate-500">Inicio *</label>
            <input
              required
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-500">Fin *</label>
            <input
              required
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Valor (COP)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={autoRenew}
            onChange={(e) => setAutoRenew(e.target.checked)}
          />
          Renovación automática
        </label>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observaciones"
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border px-3 py-1.5 text-sm">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {pending ? 'Guardando...' : isEdit ? 'Guardar' : 'Crear mensualidad'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function RenewMembershipModal({
  membershipId,
  onClose,
}: {
  membershipId: string;
  onClose: () => void;
}) {
  const renew = useRenewMembership();
  const { data: methods } = useOrgPaymentMethods();
  const [days, setDays] = useState('30');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (methods?.length && !method) {
      setMethod(methods[0].code);
    }
  }, [methods, method]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        className="w-full max-w-md space-y-3 rounded-2xl bg-white p-5 shadow-xl"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          try {
            await renew.mutateAsync({
              id: membershipId,
              payload: {
                days: Number(days) || 30,
                amount: amount ? Number(amount) : undefined,
                method: method || undefined,
                recordPayment: Boolean(amount && method),
                notes: notes || undefined,
              },
            });
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo renovar');
          }
        }}
      >
        <h2 className="text-lg font-semibold text-slate-900">Renovar mensualidad</h2>

        <input
          required
          type="number"
          min="1"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          placeholder="Días"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Monto (opcional)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        {amount && (
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {(methods ?? []).map((m) => (
              <option key={m.code} value={m.code}>
                {m.label}
              </option>
            ))}
          </select>
        )}
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas"
          rows={2}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg border px-3 py-1.5 text-sm">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={renew.isPending}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {renew.isPending ? 'Renovando...' : 'Renovar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function MembershipDetailPanel({
  membershipId,
  onClose,
  onEdit,
  onRenew,
  onChangeStatus,
}: {
  membershipId: string;
  onClose: () => void;
  onEdit: () => void;
  onRenew: () => void;
  onChangeStatus: (status: MembershipStatus) => void;
}) {
  const { data, isLoading } = useMembershipDetail(membershipId);
  const changeStatus = useChangeMembershipStatus();

  if (isLoading || !data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-400">Cargando detalle...</p>
      </div>
    );
  }

  const { membership, payments } = data;
  const displayStatus = membership.displayStatus ?? membership.status;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Mensualidad
          </p>
          <h2 className="text-xl font-semibold text-slate-900">{membership.name}</h2>
          <p className="text-sm text-slate-500">
            {membership.memberId?.name ?? '—'} · {membership.vehicleId?.plate ?? '—'}
          </p>
          <span
            className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${DISPLAY_STATUS_COLORS[displayStatus] ?? ''}`}
          >
            {DISPLAY_STATUS_LABELS[displayStatus] ?? displayStatus}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Editar
          </button>
          <button
            type="button"
            onClick={onRenew}
            className="rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Renovar
          </button>
          <select
            value={membership.status}
            onChange={async (e) => {
              const status = e.target.value as MembershipStatus;
              await changeStatus.mutateAsync({ id: membershipId, status });
              onChangeStatus(status);
            }}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
          >
            <option value="active">Activa</option>
            <option value="suspended">Suspendida</option>
            <option value="expired">Vencida</option>
            <option value="cancelled">Cancelada</option>
          </select>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            Cerrar
          </button>
        </div>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-slate-500">Tipo</dt>
          <dd className="font-medium">{membership.membershipType ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Vigencia</dt>
          <dd className="font-medium">
            {new Date(membership.startDate).toLocaleDateString('es-CO')} –{' '}
            {new Date(membership.endDate).toLocaleDateString('es-CO')}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Valor</dt>
          <dd className="font-medium">
            {membership.amount != null ? formatMoney(membership.amount) : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Auto-renovación</dt>
          <dd className="font-medium">{membership.autoRenew ? 'Sí' : 'No'}</dd>
        </div>
        {membership.notes && (
          <div className="sm:col-span-2 lg:col-span-3">
            <dt className="text-slate-500">Observaciones</dt>
            <dd>{membership.notes}</dd>
          </div>
        )}
      </dl>

      <section>
        <h3 className="mb-2 text-sm font-semibold text-slate-900">Pagos de la mensualidad</h3>
        {payments.length === 0 ? (
          <p className="text-sm text-slate-400">Sin pagos registrados</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-3 py-2">Fecha</th>
                  <th className="px-3 py-2">Monto</th>
                  <th className="px-3 py-2">Método</th>
                  <th className="px-3 py-2">Tipo</th>
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
                    <td className="px-3 py-2 capitalize">{p.kind ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
