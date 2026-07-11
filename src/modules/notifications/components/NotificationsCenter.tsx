import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AppNotification, NotificationListParams } from '@/api/notifications';

type FetchList = (
  params: NotificationListParams,
) => Promise<{
  data: {
    items: AppNotification[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}>;
type FetchMeta = () => Promise<{
  data: { types: string[]; priorities: string[]; categories: string[] };
}>;
type MarkRead = (id: string) => Promise<unknown>;
type MarkAll = () => Promise<unknown>;
type Remove = (id: string) => Promise<unknown>;

interface NotificationsCenterProps {
  title?: string;
  subtitle?: string;
  queryKeyPrefix: string;
  fetchList: FetchList;
  fetchMeta: FetchMeta;
  markRead: MarkRead;
  markAllRead: MarkAll;
  remove: Remove;
}

const TYPE_LABELS: Record<string, string> = {
  info: 'Información',
  warning: 'Advertencia',
  error: 'Error',
  success: 'Éxito',
  system: 'Sistema',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
};

function typeBadge(type: string) {
  const map: Record<string, string> = {
    info: 'bg-sky-50 text-sky-800',
    warning: 'bg-amber-50 text-amber-800',
    error: 'bg-rose-50 text-rose-800',
    success: 'bg-teal-50 text-teal-800',
    system: 'bg-slate-100 text-slate-700',
  };
  return map[type] ?? 'bg-slate-100 text-slate-700';
}

export function NotificationsCenter({
  title = 'Notificaciones',
  subtitle = 'Centro de alertas internas',
  queryKeyPrefix,
  fetchList,
  fetchMeta,
  markRead,
  markAllRead,
  remove,
}: NotificationsCenterProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);

  const params = useMemo(
    () => ({
      search: search || undefined,
      type: type || undefined,
      category: category || undefined,
      priority: priority || undefined,
      unreadOnly: unreadOnly || undefined,
      page,
      limit: 20,
    }),
    [search, type, category, priority, unreadOnly, page],
  );

  const { data: meta } = useQuery({
    queryKey: [queryKeyPrefix, 'meta'],
    queryFn: async () => (await fetchMeta()).data,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: [queryKeyPrefix, 'list', params],
    queryFn: async () => (await fetchList(params)).data,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [queryKeyPrefix] });
  };

  const readMutation = useMutation({ mutationFn: markRead, onSuccess: invalidate });
  const readAllMutation = useMutation({ mutationFn: markAllRead, onSuccess: invalidate });
  const deleteMutation = useMutation({ mutationFn: remove, onSuccess: invalidate });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <button
          type="button"
          disabled={readAllMutation.isPending}
          onClick={() => readAllMutation.mutate()}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          Marcar todas como leídas
        </button>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar…"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
        />
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todos los tipos</option>
          {(meta?.types ?? []).map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t] ?? t}
            </option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          {(meta?.categories ?? []).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => {
            setPriority(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Cualquier prioridad</option>
          {(meta?.priorities ?? []).map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p] ?? p}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-slate-700 xl:col-span-2">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => {
              setUnreadOnly(e.target.checked);
              setPage(1);
            }}
            className="rounded border-slate-300"
          />
          Solo no leídas
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {isLoading && <p className="p-4 text-sm text-slate-400">Cargando…</p>}
        {isError && (
          <p className="p-4 text-sm text-red-600">No se pudieron cargar las notificaciones.</p>
        )}
        {!isLoading && data && (
          <>
            <ul className="divide-y divide-slate-50">
              {data.items.length === 0 && (
                <li className="px-4 py-10 text-center text-sm text-slate-400">
                  No hay notificaciones con estos filtros
                </li>
              )}
              {data.items.map((n) => (
                <li
                  key={n.id}
                  className={`flex flex-wrap items-start gap-3 px-4 py-4 ${
                    !n.isRead ? 'bg-teal-50/30' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${typeBadge(n.type)}`}
                      >
                        {TYPE_LABELS[n.type] ?? n.type}
                      </span>
                      <span className="text-xs text-slate-400">
                        {PRIORITY_LABELS[n.priority] ?? n.priority}
                      </span>
                      <span className="text-xs text-slate-400">· {n.category}</span>
                    </div>
                    <h2 className="mt-1 text-sm font-semibold text-slate-900">{n.title}</h2>
                    <p className="mt-0.5 text-sm text-slate-600">{n.message}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(n.createdAt).toLocaleString('es-CO')}
                      {n.actionUrl && (
                        <>
                          {' · '}
                          <Link to={n.actionUrl} className="text-teal-700 hover:underline">
                            Abrir
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => readMutation.mutate(n.id)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Leída
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(n.id)}
                      className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 text-sm text-slate-600">
              <span>{data.pagination.total} en total</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="tabular-nums">
                  {data.pagination.page} / {data.pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
