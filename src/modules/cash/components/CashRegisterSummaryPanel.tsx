import type { CashRegisterSummary } from '@/api/cashRegisters';

const METHOD_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  other: 'Otros',
  membership: 'Membresía',
};

interface CashRegisterSummaryPanelProps {
  summary: CashRegisterSummary | undefined;
  isLoading: boolean;
}

export function CashRegisterSummaryPanel({ summary, isLoading }: CashRegisterSummaryPanelProps) {
  if (isLoading) {
    return <p className="text-sm text-gray-400">Cargando resumen...</p>;
  }

  if (!summary) return null;

  const methodEntries = Object.entries(summary.totalsByMethod ?? {});

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard label="Total recaudado" value={`$${summary.totalCollected.toLocaleString('es-CO')}`} />
      <StatCard label="Tickets abiertos" value={String(summary.openTickets)} />
      <StatCard label="Tickets cerrados" value={String(summary.closedTickets)} />
      <StatCard label="Vehículos atendidos" value={String(summary.vehiclesServed)} />

      {methodEntries.length > 0 && (
        <div className="col-span-2 lg:col-span-4 rounded-lg border border-gray-200 p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Pagos por método</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {methodEntries.map(([method, total]) => (
              <div key={method} className="text-sm">
                <span className="text-gray-600">{METHOD_LABELS[method] ?? method}: </span>
                <span className="font-semibold">${total.toLocaleString('es-CO')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.incomeByHour?.length > 0 && (
        <div className="col-span-2 lg:col-span-4 rounded-lg border border-gray-200 p-3">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Ingresos por hora</p>
          <div className="flex flex-wrap gap-2">
            {summary.incomeByHour.map((item) => (
              <span
                key={item.hour}
                className="text-xs bg-gray-100 rounded-full px-2.5 py-1 text-gray-700"
              >
                {item.hour}:00 — ${item.total.toLocaleString('es-CO')}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white border border-gray-200 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}
