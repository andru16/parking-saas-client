import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { adminApi } from '@/modules/superAdmin/adminApi';
import type { SupportMessage, SupportTicket } from '@/api/support';

function formatMs(ms: number | null | undefined) {
  if (ms == null) return '—';
  const h = ms / 3600000;
  if (h < 1) return `${Math.round(ms / 60000)} min`;
  if (h < 48) return `${h.toFixed(1)} h`;
  return `${(h / 24).toFixed(1)} días`;
}

export function SuperAdminSupportPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [orgId, setOrgId] = useState('');
  const [search, setSearch] = useState('');

  const metricsQuery = useQuery({
    queryKey: ['admin', 'support', 'metrics'],
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/support/metrics');
      return data.data.metrics as {
        open: number;
        closed: number;
        avgFirstResponseMs: number | null;
        avgResolutionMs: number | null;
        byCategory: Record<string, number>;
        byOrganization: { organizationId: string; name?: string; count: number }[];
      };
    },
  });

  const metaQuery = useQuery({
    queryKey: ['admin', 'support', 'meta'],
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/support/meta');
      return data.data.meta;
    },
  });

  const listQuery = useQuery({
    queryKey: ['admin', 'support', 'list', page, status, priority, orgId, search],
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/support', {
        params: {
          page,
          limit: 20,
          status: status || undefined,
          priority: priority || undefined,
          organizationId: orgId || undefined,
          search: search || undefined,
        },
      });
      return data.data as {
        items: SupportTicket[];
        pagination: { page: number; totalPages: number; total: number };
      };
    },
  });

  const metrics = metricsQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Centro de Soporte</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gestión de tickets de todas las organizaciones
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Abiertos" value={metrics?.open ?? '—'} />
        <Kpi label="Cerrados / resueltos" value={metrics?.closed ?? '—'} />
        <Kpi label="Tiempo resp. promedio" value={formatMs(metrics?.avgFirstResponseMs)} />
        <Kpi label="Tiempo resolución" value={formatMs(metrics?.avgResolutionMs)} />
      </div>

      {(metrics?.byOrganization?.length ?? 0) > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold">Top organizaciones</h2>
          <ul className="space-y-1 text-sm">
            {metrics?.byOrganization.map((row) => (
              <li key={String(row.organizationId)} className="flex justify-between">
                <span>{row.name ?? row.organizationId}</span>
                <span className="tabular-nums text-slate-500">{row.count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {metrics?.byCategory && Object.keys(metrics.byCategory).length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold">Por categoría</h2>
          <ul className="space-y-1 text-sm">
            {Object.entries(metrics.byCategory).map(([cat, count]) => (
              <li key={cat} className="flex justify-between">
                <span>
                  {metaQuery.data?.categories?.find((c: { id: string }) => c.id === cat)?.label ??
                    cat}
                </span>
                <span className="tabular-nums text-slate-500">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar..."
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <input
          value={orgId}
          onChange={(e) => {
            setOrgId(e.target.value);
            setPage(1);
          }}
          placeholder="organizationId"
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Estado</option>
          {(metaQuery.data?.statuses ?? []).map((s: { id: string; label: string }) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Prioridad</option>
          {(metaQuery.data?.priorities ?? []).map((p: { id: string; label: string }) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Ticket</th>
              <th className="px-3 py-2">Organización</th>
              <th className="px-3 py-2">Prioridad</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Actualizado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {listQuery.data?.items.map((t) => {
              const org =
                typeof t.organizationId === 'object' && t.organizationId
                  ? t.organizationId.name ?? t.organizationId._id
                  : String(t.organizationId ?? '—');
              return (
                <tr key={t._id} className="hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <Link to={`/admin/support/${t._id}`} className="font-medium text-teal-800">
                      {t.numberLabel}
                    </Link>
                    <p className="text-xs text-slate-500">{t.subject}</p>
                  </td>
                  <td className="px-3 py-2">{org}</td>
                  <td className="px-3 py-2 capitalize">{t.priority}</td>
                  <td className="px-3 py-2">{t.status}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {t.updatedAt ? new Date(t.updatedAt).toLocaleString('es-CO') : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(listQuery.data?.pagination.totalPages ?? 0) > 1 && (
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
            disabled={page >= (listQuery.data?.pagination.totalPages ?? 1)}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border px-3 py-1 text-xs disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

export function SuperAdminSupportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('');

  const detail = useQuery({
    queryKey: ['admin', 'support', 'detail', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await adminApi.get(`/admin/support/${id}`);
      return data.data as { ticket: SupportTicket; messages: SupportMessage[] };
    },
  });

  const reply = useMutation({
    mutationFn: async () => {
      await adminApi.post(`/admin/support/${id}/replies`, { body });
    },
    onSuccess: () => {
      setBody('');
      void qc.invalidateQueries({ queryKey: ['admin', 'support', 'detail', id] });
    },
  });

  const changeStatus = useMutation({
    mutationFn: async (next: string) => {
      await adminApi.patch(`/admin/support/${id}/status`, { status: next });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'support'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'support', 'detail', id] });
    },
  });

  if (detail.isLoading || !detail.data) {
    return <p className="text-sm text-slate-400">Cargando...</p>;
  }

  const { ticket, messages } = detail.data;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/admin/support" className="text-sm text-teal-700 hover:underline">
        ← Soporte
      </Link>
      <header className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-xs text-slate-500">{ticket.numberLabel}</p>
        <h1 className="text-xl font-semibold">{ticket.subject}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            value={status || ticket.status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border px-2 py-1 text-sm"
          >
            {['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="rounded-lg bg-slate-900 px-3 py-1 text-xs text-white"
            onClick={() => void changeStatus.mutateAsync(status || ticket.status)}
          >
            Actualizar estado
          </button>
        </div>
      </header>

      <div className="space-y-3">
        {messages.map((m) => (
          <div key={m._id} className="rounded-xl border bg-white p-4 text-sm">
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>
                {m.authorUserId
                  ? `${m.authorUserId.firstName} ${m.authorUserId.lastName}`
                  : m.authorType}
                {m.isInternal ? ' · interno' : ''}
              </span>
              <span>{new Date(m.createdAt).toLocaleString('es-CO')}</span>
            </div>
            <p className="whitespace-pre-wrap">{m.body}</p>
          </div>
        ))}
      </div>

      {ticket.status !== 'closed' && (
        <form
          className="space-y-2 rounded-2xl border bg-white p-4"
          onSubmit={(e) => {
            e.preventDefault();
            void reply.mutateAsync();
          }}
        >
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Respuesta al cliente..."
          />
          <button
            type="submit"
            disabled={!body.trim() || reply.isPending}
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Responder
          </button>
        </form>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}
