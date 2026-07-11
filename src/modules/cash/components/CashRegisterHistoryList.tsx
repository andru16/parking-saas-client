import { useState } from 'react';
import type { CashRegisterSession } from '@/api/cashRegisters';
import { usePrintCash, useReprintDocument } from '@/modules/printing/hooks/usePrinting';

interface CashRegisterHistoryListProps {
  sessions: CashRegisterSession[];
  isLoading: boolean;
}

export function CashRegisterHistoryList({ sessions, isLoading }: CashRegisterHistoryListProps) {
  const printCash = usePrintCash();
  const reprint = useReprintDocument();
  const [reprintId, setReprintId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  if (isLoading) {
    return <p className="text-sm text-gray-400">Cargando historial...</p>;
  }

  if (sessions.length === 0) {
    return <p className="text-sm text-gray-400">No hay cierres de caja registrados</p>;
  }

  return (
    <ul className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200 bg-white">
      {sessions.map((session) => (
        <li key={session.id} className="px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium text-gray-900">
                {session.cashPoint?.name ?? 'Caja'} — {session.user?.firstName}{' '}
                {session.user?.lastName}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">
                {session.closedAt
                  ? new Date(session.closedAt).toLocaleString('es-CO', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })
                  : '—'}
              </p>
            </div>
            <div className="text-right text-sm">
              <p className="font-semibold text-gray-900">
                $
                {(
                  session.closingSummary?.totalCollected ?? session.calculatedAmount
                ).toLocaleString('es-CO')}
              </p>
              {session.difference != null && session.difference !== 0 && (
                <p
                  className={`text-xs ${
                    session.difference < 0 ? 'text-red-600' : 'text-amber-600'
                  }`}
                >
                  Dif. ${session.difference.toLocaleString('es-CO')}
                </p>
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              onClick={() =>
                void printCash.mutateAsync({
                  cashRegisterId: session.id,
                  type: 'cash_close',
                })
              }
              disabled={printCash.isPending}
            >
              Imprimir cierre
            </button>
            <button
              type="button"
              className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              onClick={() =>
                void printCash.mutateAsync({
                  cashRegisterId: session.id,
                  type: 'cash_audit',
                })
              }
              disabled={printCash.isPending}
            >
              Arqueo
            </button>
            <button
              type="button"
              className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
              onClick={() => setReprintId(session.id)}
            >
              Reimprimir
            </button>
          </div>

          {reprintId === session.id && (
            <div className="mt-2 flex flex-wrap items-end gap-2 rounded-lg bg-slate-50 p-2">
              <div className="min-w-[200px] flex-1">
                <label className="mb-1 block text-xs text-gray-500">Motivo de reimpresión</label>
                <input
                  className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Obligatorio"
                />
              </div>
              <button
                type="button"
                className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
                disabled={!reason.trim() || reprint.isPending}
                onClick={() => {
                  void reprint
                    .mutateAsync({
                      cashRegisterId: session.id,
                      type: 'cash_close',
                      reason: reason.trim(),
                    })
                    .then(() => {
                      setReprintId(null);
                      setReason('');
                    });
                }}
              >
                Confirmar
              </button>
              <button
                type="button"
                className="rounded-md px-2 py-1.5 text-xs text-gray-600"
                onClick={() => {
                  setReprintId(null);
                  setReason('');
                }}
              >
                Cancelar
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
