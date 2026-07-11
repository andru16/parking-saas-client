import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useReplySupport,
  useSupportDetail,
  useSupportMeta,
  useUpdateSupportStatus,
} from '@/modules/support/hooks/useSupport';
import { hasPermission, PERMISSIONS } from '@/modules/auth/permissions';
import { useAuth } from '@/modules/auth/AuthProvider';

export function SupportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const canReply = hasPermission(user?.permissions, PERMISSIONS.SUPPORT_REPLY);
  const canClose = hasPermission(user?.permissions, PERMISSIONS.SUPPORT_CLOSE);
  const { data: meta } = useSupportMeta();
  const { data, isLoading } = useSupportDetail(id);
  const reply = useReplySupport();
  const updateStatus = useUpdateSupportStatus();
  const [body, setBody] = useState('');

  if (isLoading || !data) {
    return <p className="text-sm text-slate-400">Cargando ticket...</p>;
  }

  const { ticket, messages } = data;
  const closed = ticket.status === 'closed';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/support" className="text-sm text-teal-700 hover:underline">
        ← Volver a soporte
      </Link>

      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {ticket.numberLabel}
        </p>
        <h1 className="mt-1 text-xl font-semibold text-slate-900">{ticket.subject}</h1>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-slate-100 px-2 py-1">
            {meta?.categories.find((c) => c.id === ticket.category)?.label ?? ticket.category}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-1 capitalize">{ticket.priority}</span>
          <span className="rounded-full bg-teal-50 px-2 py-1 text-teal-800">
            {meta?.statuses.find((s) => s.id === ticket.status)?.label ?? ticket.status}
          </span>
        </div>
        {canClose && !closed && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border px-3 py-1.5 text-xs"
              onClick={() => void updateStatus.mutateAsync({ id: ticket._id, status: 'resolved' })}
            >
              Marcar resuelto
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs text-white"
              onClick={() => void updateStatus.mutateAsync({ id: ticket._id, status: 'closed' })}
            >
              Cerrar ticket
            </button>
          </div>
        )}
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Conversación</h2>
        {messages.map((m) => {
          const name = m.authorUserId
            ? `${m.authorUserId.firstName ?? ''} ${m.authorUserId.lastName ?? ''}`.trim()
            : 'Sistema';
          const isPlatform = m.authorType === 'platform_user';
          return (
            <div
              key={m._id}
              className={`rounded-xl border p-4 ${
                isPlatform ? 'border-teal-100 bg-teal-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium text-slate-700">
                  {name || 'Usuario'} {isPlatform ? '· Soporte' : ''}
                </span>
                <span>{new Date(m.createdAt).toLocaleString('es-CO')}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-800">{m.body}</p>
            </div>
          );
        })}
      </section>

      {canReply && !closed && (
        <form
          className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!body.trim()) return;
            await reply.mutateAsync({ id: ticket._id, body });
            setBody('');
          }}
        >
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Escriba su respuesta..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={reply.isPending || !body.trim()}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {reply.isPending ? 'Enviando...' : 'Responder'}
          </button>
        </form>
      )}
    </div>
  );
}
