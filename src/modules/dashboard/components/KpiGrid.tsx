import type { DashboardKpis } from '@/api/reports';

const METHOD_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  other: 'Otros',
  membership: 'Membresía',
};

export { METHOD_LABELS };

interface KpiGridProps {
  kpis: DashboardKpis | undefined;
  isLoading: boolean;
}

export function KpiGrid({ kpis, isLoading }: KpiGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200/70" />
        ))}
      </div>
    );
  }

  if (!kpis) return null;

  const items = [
    { label: 'Ingresados hoy', value: kpis.entriesToday ?? 0 },
    { label: 'Salidos hoy', value: kpis.exitsToday ?? kpis.closedTicketsToday },
    { label: 'Dentro ahora', value: kpis.vehiclesInside },
    { label: 'Ingresos del día', value: `$${(kpis.revenueToday ?? 0).toLocaleString('es-CO')}` },
    { label: 'Ingresos del mes', value: `$${(kpis.revenueMonth ?? 0).toLocaleString('es-CO')}` },
    { label: 'Membresías activas', value: kpis.membershipsActive ?? kpis.vehiclesWithMembership },
    { label: 'Por vencer', value: kpis.membershipsExpiring ?? 0 },
    { label: 'Vencidas', value: kpis.membershipsExpired ?? 0 },
    {
      label: 'Recaudo membresías (30d)',
      value: `$${(kpis.membershipRevenue ?? 0).toLocaleString('es-CO')}`,
    },
    { label: 'Caja abierta', value: kpis.cashOpen ?? kpis.cashRegistersOpen },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {item.label}
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{item.value}</p>
        </div>
      ))}

      {kpis.occupancy && (
        <div className="col-span-2 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-white p-4 lg:col-span-5">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-medium text-teal-900">Ocupación del parqueadero</p>
            <p className="text-sm font-bold text-teal-700">{kpis.occupancy.percent}%</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-teal-100">
            <div
              className="h-full rounded-full bg-teal-600 transition-all"
              style={{ width: `${Math.min(100, kpis.occupancy.percent)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {kpis.occupancy.current} / {kpis.occupancy.max} vehículos
          </p>
        </div>
      )}
    </div>
  );
}
