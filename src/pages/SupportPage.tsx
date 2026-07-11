import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { SupportCategory, SupportPriority } from '@/api/support';
import {
  useCreateSupportTicket,
  useSupportList,
  useSupportMeta,
} from '@/modules/support/hooks/useSupport';
import { hasPermission, PERMISSIONS } from '@/modules/auth/permissions';
import { useAuth } from '@/modules/auth/AuthProvider';

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-sky-50 text-sky-800',
  in_progress: 'bg-amber-50 text-amber-800',
  waiting_customer: 'bg-violet-50 text-violet-800',
  resolved: 'bg-teal-50 text-teal-800',
  closed: 'bg-slate-100 text-slate-600',
};

export function SupportPage() {
  const { user } = useAuth();
  const canCreate = hasPermission(user?.permissions, PERMISSIONS.SUPPORT_CREATE);
  const { data: meta } = useSupportMeta();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading } = useSupportList({
    page,
    status: status || undefined,
    search: search || undefined,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Centro de Soporte</h1>
          <p className="text-sm text-slate-500">
            Reporte problemas, dudas o sugerencias. Solo verá los tickets de su organización.
          </p>
        </div>
        {canCreate && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Nuevo ticket
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
          placeholder="Buscar..."
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
          {meta?.statuses.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Número</th>
              <th className="px-4 py-3">Asunto</th>
              <th className="px-4 py-3">Prioridad</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Actualizado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  Cargando...
                </td>
              </tr>
            )}
            {!isLoading && (data?.items.length ?? 0) === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No hay tickets
                </td>
              </tr>
            )}
            {data?.items.map((t) => (
              <tr key={t._id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-teal-800">
                  <Link to={`/support/${t._id}`}>{t.numberLabel}</Link>
                </td>
                <td className="px-4 py-3">
                  <Link to={`/support/${t._id}`} className="hover:underline">
                    {t.subject}
                  </Link>
                </td>
                <td className="px-4 py-3 capitalize">{t.priority}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[t.status] ?? ''}`}
                  >
                    {meta?.statuses.find((s) => s.id === t.status)?.label ?? t.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                  {t.updatedAt ? new Date(t.updatedAt).toLocaleString('es-CO') : '—'}
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

      {showForm && meta && (
        <CreateTicketModal
          meta={meta}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

function CreateTicketModal({
  meta,
  onClose,
}: {
  meta: NonNullable<ReturnType<typeof useSupportMeta>['data']>;
  onClose: () => void;
}) {
  const create = useCreateSupportTicket();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<SupportCategory>('question');
  const [priority, setPriority] = useState<SupportPriority>('medium');
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        className="w-full max-w-lg space-y-3 rounded-2xl bg-white p-5 shadow-xl"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          try {
            await create.mutateAsync({ subject, description, category, priority });
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo crear el ticket');
          }
        }}
      >
        <h2 className="text-lg font-semibold text-slate-900">Nuevo ticket</h2>
        <input
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Asunto"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describa el problema o solicitud"
          rows={5}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as SupportCategory)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {meta.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as SupportPriority)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {meta.priorities.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
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
            {create.isPending ? 'Creando...' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}
