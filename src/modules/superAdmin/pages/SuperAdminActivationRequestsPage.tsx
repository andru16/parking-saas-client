import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminApi } from '@/modules/superAdmin/adminApi';
import type { ActivationRequest } from '@/api/subscriptionActivation';

interface ActivationRequestDetail extends ActivationRequest {
  organization?: {
    id: string;
    name: string;
    city?: string;
    status?: string;
    phone?: string;
    email?: string;
  } | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  } | null;
  reviewedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  reviewedAt?: string | null;
}

function toIsoDate(dateStr: string) {
  if (!dateStr) return '';
  return new Date(`${dateStr}T12:00:00.000Z`).toISOString();
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('es-CO');
}

export function SuperAdminActivationRequestsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const metaQuery = useQuery({
    queryKey: ['admin', 'activations', 'meta'],
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/activations/meta');
      return data.data.meta as { statuses: { id: string; label: string }[] };
    },
  });

  const listQuery = useQuery({
    queryKey: ['admin', 'activations', 'list', page, status, search, sort, order],
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/activations', {
        params: {
          page,
          limit: 20,
          status: status || undefined,
          search: search || undefined,
          sort,
          order,
        },
      });
      return data.data as {
        items: ActivationRequestDetail[];
        pagination: { page: number; pages: number; total: number };
      };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Solicitudes de activación</h1>
        <p className="mt-1 text-sm text-slate-500">
          Revisión y aprobación de suscripciones solicitadas por organizaciones
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar empresa, contacto, correo..."
          className="min-w-[220px] flex-1 rounded-lg border px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          {(metaQuery.data?.statuses ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="createdAt">Fecha creación</option>
          <option value="updatedAt">Última actualización</option>
          <option value="company">Empresa</option>
          <option value="status">Estado</option>
        </select>
        <select
          value={order}
          onChange={(e) => {
            setOrder(e.target.value as 'asc' | 'desc');
            setPage(1);
          }}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="desc">Descendente</option>
          <option value="asc">Ascendente</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Empresa</th>
              <th className="px-3 py-2">Plan</th>
              <th className="px-3 py-2">Contacto</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Creada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listQuery.isLoading && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                  Cargando…
                </td>
              </tr>
            )}
            {!listQuery.isLoading && (listQuery.data?.items.length ?? 0) === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                  No hay solicitudes
                </td>
              </tr>
            )}
            {listQuery.data?.items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-3 py-2">
                  <Link
                    to={`/admin/activations/${item.id}`}
                    className="font-medium text-teal-800 hover:underline"
                  >
                    {item.company}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {item.organization?.name ?? item.city}
                  </p>
                </td>
                <td className="px-3 py-2">{item.plan?.name ?? '—'}</td>
                <td className="px-3 py-2">
                  <p>{item.contactName}</p>
                  <p className="text-xs text-slate-500">{item.email}</p>
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={item.status} label={item.statusLabel} />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{formatDate(item.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(listQuery.data?.pagination.pages ?? 0) > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>
            {listQuery.data?.pagination.total ?? 0} solicitud(es) · Página {page} de{' '}
            {listQuery.data?.pagination.pages ?? 1}
          </span>
          <div className="flex gap-2">
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
              disabled={page >= (listQuery.data?.pagination.pages ?? 1)}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border px-3 py-1 text-xs disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SuperAdminActivationRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');

  const detailQuery = useQuery({
    queryKey: ['admin', 'activations', 'detail', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await adminApi.get(`/admin/activations/${id}`);
      return data.data.request as ActivationRequestDetail;
    },
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['admin', 'activations'] });
    void qc.invalidateQueries({ queryKey: ['admin', 'activations', 'detail', id] });
  };

  const markInReview = useMutation({
    mutationFn: async () => {
      await adminApi.patch(`/admin/activations/${id}/status`, {
        status: 'IN_REVIEW',
        adminNotes: adminNotes || undefined,
      });
    },
    onSuccess: invalidate,
  });

  const approve = useMutation({
    mutationFn: async () => {
      await adminApi.post(`/admin/activations/${id}/approve`, {
        startDate: toIsoDate(startDate),
        endDate: toIsoDate(endDate),
        adminNotes: adminNotes || undefined,
      });
    },
    onSuccess: () => {
      setApproveOpen(false);
      invalidate();
    },
  });

  const reject = useMutation({
    mutationFn: async () => {
      await adminApi.post(`/admin/activations/${id}/reject`, {
        adminNotes: rejectNotes || undefined,
      });
    },
    onSuccess: () => {
      setRejectOpen(false);
      invalidate();
    },
  });

  if (detailQuery.isLoading || !detailQuery.data) {
    return <p className="text-sm text-slate-400">Cargando solicitud…</p>;
  }

  const request = detailQuery.data;
  const isClosed = request.status === 'APPROVED' || request.status === 'REJECTED';
  const canReview = !isClosed;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/admin/activations" className="text-sm text-teal-700 hover:underline">
        ← Solicitudes de activación
      </Link>

      <header className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">Solicitud #{request.id.slice(-6)}</p>
            <h1 className="text-xl font-semibold text-slate-900">{request.company}</h1>
            <p className="mt-1 text-sm text-slate-600">
              Plan: <span className="font-medium">{request.plan?.name ?? '—'}</span>
            </p>
          </div>
          <StatusBadge status={request.status} label={request.statusLabel} large />
        </div>

        {canReview && (
          <div className="mt-4 flex flex-wrap gap-2">
            {request.status === 'PENDING' && (
              <button
                type="button"
                disabled={markInReview.isPending}
                onClick={() => void markInReview.mutateAsync()}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                Marcar en revisión
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setApproveOpen(true);
                setStartDate(new Date().toISOString().slice(0, 10));
                const end = new Date();
                end.setMonth(end.getMonth() + 1);
                setEndDate(end.toISOString().slice(0, 10));
              }}
              className="rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-teal-800"
            >
              Aprobar
            </button>
            <button
              type="button"
              onClick={() => setRejectOpen(true)}
              className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50"
            >
              Rechazar
            </button>
          </div>
        )}
      </header>

      <section className="grid gap-4 rounded-2xl border bg-white p-5 shadow-sm sm:grid-cols-2">
        <DetailField label="Contacto" value={request.contactName} />
        <DetailField label="Correo" value={request.email} />
        <DetailField label="Teléfono" value={request.phone} />
        <DetailField label="Ciudad" value={request.city} />
        <DetailField
          label="Organización"
          value={request.organization?.name ?? '—'}
        />
        <DetailField
          label="Usuario solicitante"
          value={
            request.user
              ? `${request.user.firstName} ${request.user.lastName} (${request.user.email})`
              : '—'
          }
        />
        <DetailField
          label="Vehículos / día"
          value={request.dailyVehicles != null ? String(request.dailyVehicles) : '—'}
        />
        <DetailField
          label="Sedes"
          value={request.branches != null ? String(request.branches) : '—'}
        />
        <DetailField label="Horario operación" value={request.schedule ?? '—'} />
        <DetailField label="Creada" value={formatDate(request.createdAt)} />
        <DetailField label="Actualizada" value={formatDate(request.updatedAt)} />
        {request.reviewedAt && (
          <DetailField label="Revisada" value={formatDate(request.reviewedAt)} />
        )}
        {request.reviewedBy && (
          <DetailField
            label="Revisada por"
            value={`${request.reviewedBy.firstName} ${request.reviewedBy.lastName}`}
          />
        )}
        {request.activationStartDate && (
          <DetailField label="Inicio activación" value={formatDate(request.activationStartDate)} />
        )}
        {request.activationEndDate && (
          <DetailField label="Fin activación" value={formatDate(request.activationEndDate)} />
        )}
      </section>

      {request.comments && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Comentarios del cliente</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{request.comments}</p>
        </section>
      )}

      {(request.adminNotes || canReview) && (
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Notas internas</h2>
          {canReview ? (
            <textarea
              value={adminNotes || request.adminNotes || ''}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Notas visibles en la solicitud..."
            />
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
              {request.adminNotes ?? '—'}
            </p>
          )}
        </section>
      )}

      {approveOpen && (
        <Modal title="Aprobar solicitud" onClose={() => setApproveOpen(false)}>
          <div className="space-y-3">
            <Field label="Fecha de inicio">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Fecha de vencimiento">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Notas (opcional)">
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className={inputClass}
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApproveOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!startDate || !endDate || approve.isPending}
                onClick={() => void approve.mutateAsync()}
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {approve.isPending ? 'Aprobando…' : 'Confirmar aprobación'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {rejectOpen && (
        <Modal title="Rechazar solicitud" onClose={() => setRejectOpen(false)}>
          <div className="space-y-3">
            <Field label="Motivo / notas (opcional)">
              <textarea
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                rows={4}
                className={inputClass}
                placeholder="Indique el motivo del rechazo..."
              />
            </Field>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectOpen(false)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={reject.isPending}
                onClick={() => void reject.mutateAsync()}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {reject.isPending ? 'Rechazando…' : 'Confirmar rechazo'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatusBadge({
  status,
  label,
  large,
}: {
  status: string;
  label: string;
  large?: boolean;
}) {
  const colors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    IN_REVIEW: 'bg-sky-100 text-sky-800',
    APPROVED: 'bg-emerald-100 text-emerald-800',
    REJECTED: 'bg-rose-100 text-rose-800',
  };
  return (
    <span
      className={`inline-flex rounded-full font-medium ${colors[status] ?? 'bg-slate-100 text-slate-700'} ${
        large ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'
      }`}
    >
      {label}
    </span>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm text-slate-900">{value}</p>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}
