import type { DashboardKpis } from '@/api/reports';

interface Props {
  kpis: DashboardKpis | undefined;
  isLoading: boolean;
}

export function DashboardHeroKpis({ kpis, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200/70" />
        ))}
      </div>
    );
  }

  if (!kpis) return null;

  const cards = [
    {
      label: 'Ingresados hoy',
      value: kpis.entriesToday ?? 0,
      hint: `${kpis.vehiclesInside} dentro ahora`,
    },
    {
      label: 'Salidos hoy',
      value: kpis.exitsToday ?? kpis.closedTicketsToday,
      hint: 'Salidas del día',
    },
    {
      label: 'Recaudo del día',
      value: `$${kpis.revenueToday.toLocaleString('es-CO')}`,
      hint: `Mes: $${kpis.revenueMonth.toLocaleString('es-CO')}`,
    },
    {
      label: 'Caja abierta',
      value: kpis.cashOpen ?? kpis.cashRegistersOpen,
      hint:
        (kpis.cashOpen ?? kpis.cashRegistersOpen) > 0
          ? `${kpis.activeCashiers} cajero(s) activo(s)`
          : 'Sin turno abierto',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {card.label}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{card.value}</p>
          <p className="mt-1 text-xs text-slate-500">{card.hint}</p>
        </div>
      ))}
    </div>
  );
}
