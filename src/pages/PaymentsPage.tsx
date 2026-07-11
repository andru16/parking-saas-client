import { useEffect, useState } from 'react';
import { listMembers } from '@/api/members';
import { listVehicles } from '@/api/vehicles';
import { useAuth } from '@/modules/auth/AuthProvider';
import { hasPermission, PERMISSIONS } from '@/modules/auth/permissions';
import {
  useCreateOrgMembershipPayment,
  useOrgMembershipPayments,
  useOrgPaymentHistory,
  useOrgPaymentMethods,
} from '@/modules/payments/hooks/useOrgPayments';

const STATUS_LABELS: Record<string, string> = {
  trial: 'Trial',
  active: 'Activa',
  grace_period: 'Período de gracia',
  suspended: 'Suspendida',
  expired: 'Vencida',
  cancelled: 'Cancelada',
};

const BILLING_CYCLE_LABELS: Record<string, string> = {
  trial: 'Trial',
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  semiannual: 'Semestral',
  annual: 'Anual',
};

const SOURCE_LABELS: Record<string, string> = {
  ticket: 'Ticket',
  membership: 'Membresía',
};

type TabId = 'memberships' | 'saas' | 'history';

function formatMoney(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PaymentsPage() {
  const [tab, setTab] = useState<TabId>('memberships');

  const tabs: { id: TabId; label: string }[] = [
    { id: 'memberships', label: 'Pagos de mensualidades' },
    { id: 'saas', label: 'Pagos SaaS' },
    { id: 'history', label: 'Historial' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pagos</h1>
        <p className="text-sm text-slate-500">
          Cobros de membresías, plan SaaS e historial unificado.
        </p>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === t.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'memberships' && <MembershipPaymentsTab />}
      {tab === 'saas' && <SaasPaymentsTab />}
      {tab === 'history' && <PaymentHistoryTab />}
    </div>
  );
}

function MembershipPaymentsTab() {
  const { user } = useAuth();
  const canCollect = hasPermission(user?.permissions, [
    PERMISSIONS.PAYMENTS_COLLECT,
    PERMISSIONS.MEMBERSHIPS_MANAGE,
  ]);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useOrgMembershipPayments({ page });

  return (
    <>
      <div className="flex justify-end">
        {canCollect && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Registrar pago
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Miembro</th>
              <th className="px-4 py-3">Vehículo</th>
              <th className="px-4 py-3">Membresía</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Tipo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  Cargando...
                </td>
              </tr>
            )}
            {!isLoading && (data?.items.length ?? 0) === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No hay pagos de membresías
                </td>
              </tr>
            )}
            {data?.items.map((p) => (
              <tr key={p._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(p.paidAt).toLocaleString('es-CO')}
                </td>
                <td className="px-4 py-3">{p.memberId?.name ?? '—'}</td>
                <td className="px-4 py-3">{p.vehicleId?.plate ?? '—'}</td>
                <td className="px-4 py-3">{p.parkingMembershipId?.name ?? '—'}</td>
                <td className="px-4 py-3">{formatMoney(p.amount)}</td>
                <td className="px-4 py-3">{p.method}</td>
                <td className="px-4 py-3 capitalize">{p.kind ?? '—'}</td>
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

      {showForm && <RegisterPaymentModal onClose={() => setShowForm(false)} />}
    </>
  );
}

function RegisterPaymentModal({ onClose }: { onClose: () => void }) {
  const create = useCreateOrgMembershipPayment();
  const { data: methods } = useOrgPaymentMethods();
  const [memberId, setMemberId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [members, setMembers] = useState<Array<{ _id: string; name: string }>>([]);
  const [vehicles, setVehicles] = useState<Array<{ _id: string; plate: string }>>([]);

  useEffect(() => {
    void listMembers({ limit: 100, status: 'active' }).then((res) => {
      setMembers(res.data.items.map((m) => ({ _id: m._id, name: m.name })));
    });
  }, []);

  useEffect(() => {
    if (methods?.length && !method) {
      setMethod(methods[0].code);
    }
  }, [methods, method]);

  useEffect(() => {
    if (!memberId) {
      setVehicles([]);
      return;
    }
    void listVehicles({ limit: 50 }).then((res) => {
      setVehicles(res.data.items.map((v) => ({ _id: v._id, plate: v.plate })));
    });
  }, [memberId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        className="max-h-[90vh] w-full max-w-lg space-y-3 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          if (!memberId || !amount || !method) {
            setError('Complete los campos requeridos');
            return;
          }
          try {
            await create.mutateAsync({
              memberId,
              vehicleId: vehicleId || null,
              amount: Number(amount),
              method,
              paidAt: new Date(paidAt).toISOString(),
              notes: notes || null,
            });
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo registrar el pago');
          }
        }}
      >
        <h2 className="text-lg font-semibold text-slate-900">Registrar pago de membresía</h2>

        <select
          required
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Seleccionar miembro *</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Vehículo (opcional)</option>
          {vehicles.map((v) => (
            <option key={v._id} value={v._id}>
              {v.plate}
            </option>
          ))}
        </select>

        <input
          required
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Monto *"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />

        <select
          required
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

        <div>
          <label className="mb-1 block text-xs text-slate-500">Fecha de pago *</label>
          <input
            required
            type="datetime-local"
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

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
            disabled={create.isPending}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          >
            {create.isPending ? 'Registrando...' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  );
}

function SaasPaymentsTab() {
  const { user } = useAuth();
  const sub = user?.organization?.subscription;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-900">
        La activación y renovación del plan SaaS es gestionada por el Super Admin hasta
        implementar Wompi. No hay pasarela de pago aquí.
      </div>

      {!sub?.hasSubscription || !sub.plan ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">No hay suscripción SaaS activa.</p>
        </div>
      ) : (
        <section
          className={`rounded-2xl border bg-white p-5 shadow-sm ${
            sub.status === 'grace_period' || sub.accessMode === 'read_only'
              ? 'border-amber-200'
              : 'border-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Plan SaaS
              </p>
              <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold text-slate-900">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: sub.plan.color || '#0f766e' }}
                />
                {sub.plan.name}
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Estado:{' '}
                <span className="font-medium">
                  {STATUS_LABELS[sub.status ?? ''] ?? sub.status}
                </span>
                {sub.billingCycle
                  ? ` · Ciclo: ${BILLING_CYCLE_LABELS[sub.billingCycle] ?? sub.billingCycle}`
                  : null}
              </p>
            </div>
            <div className="text-right text-sm text-slate-600">
              <p>
                Inicio:{' '}
                <span className="font-medium text-slate-900">
                  {sub.startDate
                    ? new Date(sub.startDate).toLocaleDateString('es-CO')
                    : '—'}
                </span>
              </p>
              <p className="mt-1">
                Vence:{' '}
                <span className="font-medium text-slate-900">
                  {sub.endDate ? new Date(sub.endDate).toLocaleDateString('es-CO') : '—'}
                </span>
              </p>
              <p className="mt-1">
                Días restantes:{' '}
                <span className="font-semibold tabular-nums text-slate-900">
                  {sub.daysRemaining}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {sub.autoRenewal && sub.nextRenewalAt
                  ? `Próxima renovación: ${new Date(sub.nextRenewalAt).toLocaleDateString('es-CO')}`
                  : 'Renovación automática desactivada'}
              </p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function PaymentHistoryTab() {
  const [page, setPage] = useState(1);
  const [source, setSource] = useState<'all' | 'tickets' | 'memberships'>('all');
  const { data, isLoading } = useOrgPaymentHistory({ page, source });

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <select
          value={source}
          onChange={(e) => {
            setSource(e.target.value as 'all' | 'tickets' | 'memberships');
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">Todas las fuentes</option>
          <option value="tickets">Tickets</option>
          <option value="memberships">Mensualidades</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Fuente</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Placa</th>
              <th className="px-4 py-3">Miembro</th>
              <th className="px-4 py-3">Recibido por</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  Cargando...
                </td>
              </tr>
            )}
            {!isLoading && (data?.items.length ?? 0) === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                  No hay pagos en el historial
                </td>
              </tr>
            )}
            {data?.items.map((p) => (
              <tr key={`${p.source}-${p.id}`} className="hover:bg-slate-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(p.paidAt).toLocaleString('es-CO')}
                </td>
                <td className="px-4 py-3">{SOURCE_LABELS[p.source] ?? p.source}</td>
                <td className="px-4 py-3">{formatMoney(p.amount)}</td>
                <td className="px-4 py-3">{p.method}</td>
                <td className="px-4 py-3">{p.plate ?? '—'}</td>
                <td className="px-4 py-3">{p.memberName ?? '—'}</td>
                <td className="px-4 py-3">{p.receivedBy ?? '—'}</td>
                <td className="px-4 py-3 capitalize">{p.status}</td>
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
    </>
  );
}
