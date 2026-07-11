import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/modules/auth/AuthProvider';
import { CashRegisterHistoryList } from '@/modules/cash/components/CashRegisterHistoryList';
import { CashRegisterSummaryPanel } from '@/modules/cash/components/CashRegisterSummaryPanel';
import { CloseCashRegisterModal } from '@/modules/cash/components/CloseCashRegisterModal';
import { OpenCashRegisterForm } from '@/modules/cash/components/OpenCashRegisterForm';
import {
  useCashRegisterHistory,
  useCashRegisterSummary,
  useCurrentCashRegister,
} from '@/modules/cash/hooks/useCashRegister';
import { usePrintCash } from '@/modules/printing/hooks/usePrinting';

type Tab = 'active' | 'open' | 'history';

export function CashRegisterPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('active');
  const [showClose, setShowClose] = useState(false);
  const { data: session, refetch: refetchSession } = useCurrentCashRegister();
  const hasSession = session?.status === 'open';
  const { data: summary, isLoading: loadingSummary } = useCashRegisterSummary(hasSession);
  const { data: history, isLoading: loadingHistory } = useCashRegisterHistory(1);

  const activeTab: Tab = !hasSession ? 'open' : tab;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Caja</h1>
          <p className="text-sm text-gray-500">
            {user?.organization?.name} — {user?.firstName} {user?.lastName}
          </p>
        </div>
        <Link to="/operations" className="text-sm text-primary-600 hover:underline">
          ← Centro de Operaciones
        </Link>
      </div>

      {hasSession && (
        <div className="flex gap-2 border-b border-gray-200">
          <TabButton active={activeTab === 'active'} onClick={() => setTab('active')}>
            Caja activa
          </TabButton>
          <TabButton active={activeTab === 'history'} onClick={() => setTab('history')}>
            Historial
          </TabButton>
        </div>
      )}

      {!hasSession && (
        <section className="max-w-md bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Abrir caja</h2>
          <p className="text-sm text-gray-500 mb-4">
            Inicie su turno indicando el fondo inicial y el punto de caja.
          </p>
          <OpenCashRegisterForm onOpened={() => void refetchSession()} />
        </section>
      )}

      {hasSession && activeTab === 'active' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-emerald-900">
                {session.cashPoint?.name ?? 'Caja activa'}
              </p>
              <p className="text-sm text-emerald-700">
                Abierta {new Date(session.openedAt).toLocaleString('es-CO')} — Fondo: $
                {session.openingAmount.toLocaleString('es-CO')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowClose(true)}
              className="rounded-lg bg-gray-900 text-white font-medium px-4 py-2 hover:bg-gray-800"
            >
              Cerrar caja
            </button>
          </div>

          <CashRegisterSummaryPanel summary={summary} isLoading={loadingSummary} />

          {session?.id && (
            <div className="flex flex-wrap gap-2">
              <AuditPrintButton cashRegisterId={session.id} />
            </div>
          )}
        </div>
      )}

      {hasSession && activeTab === 'history' && (
        <CashRegisterHistoryList sessions={history?.sessions ?? []} isLoading={loadingHistory} />
      )}

      {!hasSession && activeTab === 'history' && (
        <CashRegisterHistoryList sessions={history?.sessions ?? []} isLoading={loadingHistory} />
      )}

      {!hasSession && (
        <section>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
            Historial reciente
          </h2>
          <CashRegisterHistoryList sessions={history?.sessions ?? []} isLoading={loadingHistory} />
        </section>
      )}

      <CloseCashRegisterModal
        open={showClose}
        summary={summary}
        openingAmount={session?.openingAmount ?? 0}
        onClose={() => setShowClose(false)}
        onClosed={() => void refetchSession()}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
        active
          ? 'border-primary-600 text-primary-700'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );
}

function AuditPrintButton({ cashRegisterId }: { cashRegisterId: string }) {
  const printCash = usePrintCash();
  return (
    <button
      type="button"
      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
      disabled={printCash.isPending}
      onClick={() =>
        void printCash.mutateAsync({ cashRegisterId, type: 'cash_audit' })
      }
    >
      Imprimir arqueo
    </button>
  );
}
