import { useEffect, useState, type ReactNode } from 'react';
import type { TicketItem } from '@/api/tickets';
import { CollectTicketModal } from '@/modules/cash/components/CollectTicketModal';
import { useExitPreview } from '@/modules/cash/hooks/usePayments';
import { ElapsedTime } from '@/modules/operations/components/ElapsedTime';
import {
  operationsKeys,
  useCancelTicket,
  useTicketHistory,
} from '@/modules/operations/hooks/useOperations';
import { useAuth } from '@/modules/auth/AuthProvider';
import { hasPermission, PERMISSIONS } from '@/modules/auth/permissions';
import { posRealtime } from '@/modules/operations/posRealtime';
import { useQueryClient } from '@tanstack/react-query';
import { usePrintConfig, usePrintTicket, useReprintTicket, printingKeys, shouldAutoPrintExit } from '@/modules/printing/hooks/usePrinting';
import type { OrgPrintConfigResponse } from '@/api/printing';

interface TicketDetailPanelProps {
  ticket: TicketItem | null;
  onExitComplete: () => void;
  cashOpen: boolean;
  collectOpenRequest?: number;
}

export function TicketDetailPanel({
  ticket,
  onExitComplete,
  cashOpen,
  collectOpenRequest = 0,
}: TicketDetailPanelProps) {
  const { user } = useAuth();
  const canCancel = hasPermission(user?.permissions, PERMISSIONS.TICKETS_CANCEL);
  const [showCollect, setShowCollect] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [showReprint, setShowReprint] = useState(false);
  const [reprintReason, setReprintReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const cancelMutation = useCancelTicket();
  const printMutation = usePrintTicket();
  const reprintMutation = useReprintTicket();
  const { data: printConfig } = usePrintConfig();
  const qc = useQueryClient();

  const { data: preview, isLoading: loadingPreview } = useExitPreview(
    ticket?.id ?? null,
    Boolean(ticket && ticket.status === 'open'),
  );

  const { data: history = [], isLoading: loadingHistory } = useTicketHistory(
    ticket?.id ?? null,
    showHistory,
  );

  useEffect(() => {
    if (collectOpenRequest > 0 && ticket?.status === 'open' && cashOpen) {
      setShowCollect(true);
    }
  }, [collectOpenRequest, ticket?.status, cashOpen]);

  if (!ticket) {
    return (
      <section className="flex h-full flex-col rounded-xl border border-dashed border-gray-300 bg-gray-50">
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-6 text-center">
          <p className="text-base font-medium text-gray-600">Ticket seleccionado</p>
          <p className="max-w-xs text-sm text-gray-400">
            Seleccione un vehículo de la lista para cobrar, cancelar o ver historial.
          </p>
        </div>
      </section>
    );
  }

  const isOpen = ticket.status === 'open';
  const ticketId = ticket.id;

  async function handleCancel() {
    setError(null);
    try {
      await cancelMutation.mutateAsync({ id: ticketId, reason: cancelReason || undefined });
      setShowCancel(false);
      setCancelReason('');
      onExitComplete();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo cancelar el ticket';
      setError(message);
    }
  }

  async function handlePrint() {
    setError(null);
    try {
      await printMutation.mutateAsync({
        ticketId,
        type: isOpen ? 'entry' : 'exit',
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        'No se pudo imprimir el ticket';
      setError(message);
    }
  }

  async function handleReprint() {
    setError(null);
    try {
      await reprintMutation.mutateAsync({
        ticketId,
        reason: reprintReason,
        type: isOpen ? 'entry' : 'auto',
      });
      setShowReprint(false);
      setReprintReason('');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err as Error)?.message ??
        'No se pudo reimprimir el ticket';
      setError(message);
    }
  }

  return (
    <>
      <section className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
        <header className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
            Panel del ticket
          </h2>
        </header>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
          <div className="rounded-xl bg-gray-900 px-4 py-4 text-center text-white">
            <p className="font-mono text-3xl font-bold tracking-wider">
              {ticket.vehicle?.plate ?? 'Sin placa'}
            </p>
            {ticket.category && (
              <p className="mt-1 text-sm text-gray-300">{ticket.category.name}</p>
            )}
            {isOpen && (
              <p className="mt-2 text-2xl font-semibold text-sky-300">
                <ElapsedTime from={ticket.entryAt} />
              </p>
            )}
          </div>

          <dl className="space-y-1.5 text-sm">
            <Row
              label="Estado"
              value={
                ticket.status === 'open'
                  ? 'Abierto'
                  : ticket.status === 'cancelled'
                    ? 'Cancelado'
                    : 'Cerrado'
              }
            />
            <Row
              label="Ingreso"
              value={new Date(ticket.entryAt).toLocaleString('es-CO', {
                dateStyle: 'short',
                timeStyle: 'short',
              })}
            />
            {ticket.entryUser && (
              <Row
                label="Registró"
                value={`${ticket.entryUser.firstName} ${ticket.entryUser.lastName}`}
              />
            )}
            {ticket.cashRegister?.cashPointName && (
              <Row label="Caja" value={ticket.cashRegister.cashPointName} />
            )}
            {ticket.member && <Row label="Miembro" value={ticket.member.name} />}
            {ticket.membership && <Row label="Membresía" value={ticket.membership.name} />}
          </dl>

          {isOpen && (
            <div className="rounded-xl border border-primary-100 bg-primary-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-primary-700">
                Tarifa estimada
              </p>
              {loadingPreview ? (
                <p className="mt-1 text-sm text-primary-600">Calculando...</p>
              ) : preview?.coveredByMembership ? (
                <p className="mt-1 text-xl font-bold text-emerald-700">Cubierto por membresía</p>
              ) : (
                <p className="mt-1 text-3xl font-bold text-primary-900">
                  ${(preview?.total ?? 0).toLocaleString('es-CO')}
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-auto space-y-2">
            {isOpen && (
              <>
                {!cashOpen && (
                  <p className="text-xs text-amber-700">Abra la caja para cobrar la salida.</p>
                )}
                <button
                  type="button"
                  disabled={!cashOpen}
                  onClick={() => setShowCollect(true)}
                  className="w-full rounded-xl bg-primary-600 px-4 py-3.5 text-base font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  Cobrar / Registrar salida
                </button>
              </>
            )}

            <button
              type="button"
              disabled={printMutation.isPending}
              onClick={() => void handlePrint()}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {printMutation.isPending
                ? 'Preparando impresión...'
                : isOpen
                  ? 'Imprimir ticket de ingreso'
                  : 'Imprimir ticket de salida'}
            </button>

            <button
              type="button"
              onClick={() => setShowReprint(true)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reimprimir (con motivo)
            </button>

            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {showHistory ? 'Ocultar historial' : 'Ver historial'}
            </button>

            {canCancel && isOpen && (
              <button
                type="button"
                onClick={() => setShowCancel(true)}
                className="w-full rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Cancelar ticket
              </button>
            )}
          </div>

          {showHistory && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500">
                Historial del vehículo
              </p>
              {loadingHistory && <p className="text-xs text-gray-400">Cargando...</p>}
              <ul className="max-h-40 space-y-1 overflow-y-auto text-xs">
                {history.map((h) => (
                  <li key={h.id} className="flex justify-between gap-2 rounded bg-white px-2 py-1.5">
                    <span>
                      {new Date(h.entryAt).toLocaleString('es-CO', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </span>
                    <span className="font-medium">{h.status}</span>
                    <span>${(h.total ?? 0).toLocaleString('es-CO')}</span>
                  </li>
                ))}
                {!loadingHistory && history.length === 0 && (
                  <li className="text-gray-400">Sin historial</li>
                )}
              </ul>
            </div>
          )}
        </div>
      </section>

      <CollectTicketModal
        ticket={ticket}
        open={showCollect}
        onClose={() => setShowCollect(false)}
        onSuccess={() => {
          qc.invalidateQueries({ queryKey: operationsKeys.openTickets() });
          posRealtime.emit({ type: 'ticket:closed', ticketId: ticket.id });
          posRealtime.emit({ type: 'tickets:changed' });
          if (
            shouldAutoPrintExit(
              qc.getQueryData<OrgPrintConfigResponse>(printingKeys.config()) ?? printConfig,
            )
          ) {
            void printMutation.mutateAsync({ ticketId: ticket.id, type: 'exit' });
          }
          onExitComplete();
        }}
      />

      {showReprint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="font-semibold text-gray-900">Reimprimir ticket</h3>
            <p className="mt-1 text-sm text-gray-600">
              Indique el motivo. Quedará registrado en auditoría.
            </p>
            <textarea
              value={reprintReason}
              onChange={(e) => setReprintReason(e.target.value)}
              placeholder="Motivo de reimpresión *"
              rows={3}
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReprint(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={reprintMutation.isPending || !reprintReason.trim()}
                onClick={() => void handleReprint()}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {reprintMutation.isPending ? 'Reimprimiendo...' : 'Reimprimir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl">
            <h3 className="font-semibold text-gray-900">Cancelar ticket</h3>
            <p className="mt-1 text-sm text-gray-600">
              Esta acción no genera cobro. Solo admin/supervisor.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Motivo (opcional)"
              rows={3}
              className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCancel(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm"
              >
                Volver
              </button>
              <button
                type="button"
                disabled={cancelMutation.isPending}
                onClick={() => void handleCancel()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Confirmar cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-medium text-gray-900">{value}</dd>
    </div>
  );
}
