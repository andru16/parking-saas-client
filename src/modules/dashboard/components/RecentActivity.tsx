import { useQuery } from '@tanstack/react-query';
import { fetchReport } from '@/api/reports';
import { useAuth } from '@/modules/auth/AuthProvider';
import { hasPermission, PERMISSIONS } from '@/modules/auth/permissions';

const ACTIVITY_LABELS: Record<string, string> = {
  ticket_opened: 'Ingreso / ticket creado',
  ticket_closed: 'Salida',
  ticket_collected: 'Cobro de ticket',
  cash_register_opened: 'Apertura de caja',
  cash_register_closed: 'Cierre de caja',
  payment_created: 'Pago',
  login_success: 'Inicio de sesión',
  setup_completed: 'Configuración completada',
};

function labelFor(action: string, module?: string) {
  if (ACTIVITY_LABELS[action]) return ACTIVITY_LABELS[action];
  if (module === 'ticket' && action.includes('open')) return 'Ingreso';
  if (module === 'ticket' && action.includes('close')) return 'Salida';
  if (module === 'payment') return 'Pago';
  if (module === 'cashRegister' || module === 'cash_register') return 'Caja';
  return action.replace(/_/g, ' ');
}

export function RecentActivity() {
  const { user } = useAuth();
  const canAudit = hasPermission(user?.permissions, [
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.SETTINGS_MANAGE,
  ]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'recent-activity', canAudit ? 'audit' : 'tickets'],
    queryFn: async () => {
      if (canAudit) {
        const res = await fetchReport('audit', { page: 1, limit: 12 });
        return res.data.rows;
      }
      const res = await fetchReport('tickets', { page: 1, limit: 12 });
      return res.data.rows;
    },
    refetchInterval: 60_000,
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-900">Actividad reciente</h2>
        <p className="text-xs text-slate-500">
          {canAudit ? 'Últimos eventos de auditoría' : 'Últimos tickets'}
        </p>
      </header>

      <div className="max-h-80 overflow-y-auto">
        {isLoading && <p className="p-4 text-sm text-slate-400">Cargando...</p>}
        {isError && (
          <p className="p-4 text-sm text-amber-700">
            No se pudo cargar la actividad. Verifique permisos de reportes.
          </p>
        )}
        {!isLoading && !isError && (data?.length ?? 0) === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">Sin movimientos recientes</p>
        )}

        <ul className="divide-y divide-slate-50">
          {(data ?? []).map((row, index) => {
            if (canAudit) {
              const action = String(row.action ?? '');
              const module = String(row.module ?? '');
              const when = row.createdAt ? new Date(String(row.createdAt)) : null;
              return (
                <li key={`${action}-${index}`} className="px-4 py-3">
                  <p className="text-sm font-medium text-slate-900">
                    {labelFor(action, module)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {String(row.description ?? module)}
                    {when ? ` · ${when.toLocaleString('es-CO')}` : ''}
                  </p>
                </li>
              );
            }

            const plate = String(row.plate ?? row.vehiclePlate ?? '—');
            const status = String(row.status ?? '');
            const entryAt = row.entryAt ? new Date(String(row.entryAt)) : null;
            return (
              <li key={`${plate}-${index}`} className="px-4 py-3">
                <p className="font-mono text-sm font-semibold text-slate-900">{plate}</p>
                <p className="text-xs text-slate-500">
                  {status}
                  {entryAt ? ` · ${entryAt.toLocaleString('es-CO')}` : ''}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
