/**
 * Mockup CSS del dashboard — sin imágenes pesadas, lazy-friendly.
 */
export function DashboardMockup({ className = '' }: { className?: string }) {
  return (
    <div
      className={`landing-float relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/10 ${className}`}
      role="img"
      aria-label="Vista previa del dashboard de Parking SaaS con indicadores y gráficos"
    >
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/90 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" aria-hidden />
        <span className="ml-3 text-xs font-medium text-slate-400">app.parkingsaas.co / dashboard</span>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-[140px_1fr]">
        <aside className="hidden space-y-2 rounded-xl bg-slate-900 p-3 text-[11px] text-slate-300 sm:block" aria-hidden>
          <div className="mb-3 text-xs font-semibold text-white">Parking SaaS</div>
          {['Operación', 'Dashboard', 'Caja', 'Clientes', 'Reportes', 'Config'].map((item, i) => (
            <div
              key={item}
              className={`rounded-lg px-2 py-1.5 ${i === 1 ? 'bg-primary-600 text-white' : 'hover:bg-white/5'}`}
            >
              {item}
            </div>
          ))}
        </aside>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: 'Ingresos hoy', value: '$1.2M' },
              { label: 'Dentro', value: '48' },
              { label: 'Salidas', value: '126' },
              { label: 'Ocupación', value: '72%' },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{kpi.label}</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-xs font-semibold text-slate-700">Ingresos por hora</p>
              <div className="mt-3 flex h-24 items-end gap-1.5" aria-hidden>
                {[40, 55, 35, 70, 85, 60, 95, 75, 50, 68, 88, 72].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-gradient-to-t from-primary-700 to-primary-400"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-xs font-semibold text-slate-700">Tickets activos</p>
              <ul className="mt-2 space-y-2">
                {[
                  { plate: 'ABC123', time: '01:24' },
                  { plate: 'XYZ90D', time: '00:41' },
                  { plate: 'JKL45', time: '02:08' },
                ].map((t) => (
                  <li
                    key={t.plate}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-2 text-xs"
                  >
                    <span className="font-semibold text-slate-800">{t.plate}</span>
                    <span className="text-primary-700">{t.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
