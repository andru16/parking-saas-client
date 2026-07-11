import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import type { AppNotification } from '@/api/notifications';

type FetchList = (params: {
  limit?: number;
  unreadOnly?: boolean;
}) => Promise<{ data: { items: AppNotification[] } }>;

type FetchCount = () => Promise<{ data: { unread: number } }>;
type MarkRead = (id: string) => Promise<unknown>;
type MarkAll = () => Promise<unknown>;

interface NotificationBellProps {
  centerPath: string;
  fetchList: FetchList;
  fetchCount: FetchCount;
  markRead: MarkRead;
  markAllRead: MarkAll;
  queryKeyPrefix: string;
}

function typeDot(type: string) {
  const map: Record<string, string> = {
    info: 'bg-sky-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    success: 'bg-teal-500',
    system: 'bg-slate-500',
  };
  return map[type] ?? 'bg-slate-400';
}

export function NotificationBell({
  centerPath,
  fetchList,
  fetchCount,
  markRead,
  markAllRead,
  queryKeyPrefix,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: countData } = useQuery({
    queryKey: [queryKeyPrefix, 'unread-count'],
    queryFn: async () => (await fetchCount()).data,
    refetchInterval: 60_000,
  });

  const { data: listData, isLoading } = useQuery({
    queryKey: [queryKeyPrefix, 'bell-list'],
    queryFn: async () => (await fetchList({ limit: 8 })).data,
    enabled: open,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: [queryKeyPrefix] });
  };

  const readMutation = useMutation({
    mutationFn: markRead,
    onSuccess: invalidate,
  });

  const readAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: invalidate,
  });

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = countData?.unread ?? 0;

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        aria-label="Notificaciones"
        title="Notificaciones"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-teal-600 px-1 text-[10px] font-semibold text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notificaciones</p>
            <button
              type="button"
              disabled={unread === 0 || readAllMutation.isPending}
              onClick={() => readAllMutation.mutate()}
              className="text-xs font-medium text-teal-700 hover:underline disabled:opacity-40"
            >
              Marcar todas
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading && <p className="p-4 text-sm text-slate-400">Cargando…</p>}
            {!isLoading && (listData?.items.length ?? 0) === 0 && (
              <p className="p-6 text-center text-sm text-slate-400">Sin notificaciones</p>
            )}
            <ul className="divide-y divide-slate-50">
              {(listData?.items ?? []).map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-slate-50 ${
                      !n.isRead ? 'bg-teal-50/40' : ''
                    }`}
                    onClick={() => {
                      if (!n.isRead) readMutation.mutate(n.id);
                      if (n.actionUrl) {
                        setOpen(false);
                        window.location.assign(n.actionUrl);
                      }
                    }}
                  >
                    <span
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${typeDot(n.type)}`}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-900">
                        {n.title}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-slate-500">
                        {n.message}
                      </span>
                      <span className="mt-1 block text-[11px] text-slate-400">
                        {new Date(n.createdAt).toLocaleString('es-CO')}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-slate-100 px-4 py-2.5">
            <Link
              to={centerPath}
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-medium text-teal-700 hover:underline"
            >
              Ver todas
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
