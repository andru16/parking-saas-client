import type { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardCharts } from '@/api/reports';
import { METHOD_LABELS } from '@/modules/dashboard/components/KpiGrid';

const COLORS = ['#0d9488', '#0f766e', '#f59e0b', '#dc2626', '#64748b', '#14b8a6'];

interface DashboardChartsPanelProps {
  charts: DashboardCharts | undefined;
  isLoading: boolean;
}

export function DashboardChartsPanel({ charts, isLoading }: DashboardChartsPanelProps) {
  if (isLoading) {
    return <p className="text-sm text-slate-400">Cargando gráficas...</p>;
  }

  if (!charts) return null;

  const paymentData = charts.paymentMethods.map((p) => ({
    name: METHOD_LABELS[p.method] ?? p.method,
    value: p.total,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="Ingresos por día">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={charts.incomeByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip formatter={(v) => `$${Number(v ?? 0).toLocaleString('es-CO')}`} />
            <Bar dataKey="total" fill="#0d9488" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Ingresos por mes">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={charts.incomeByMonth ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip formatter={(v) => `$${Number(v ?? 0).toLocaleString('es-CO')}`} />
            <Bar dataKey="total" fill="#0f766e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Vehículos por tipo">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={charts.vehiclesByCategory} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <Tooltip />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {charts.vehiclesByCategory.map((entry, index) => (
                <Cell key={entry.categoryId} fill={entry.color ?? COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Tickets por hora (hoy)">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={charts.ticketsByHour ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip />
            <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Ocupación (entradas / día)">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={charts.occupancy?.history ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="entries"
              name="Entradas"
              stroke="#0d9488"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        {charts.occupancy?.percent != null && (
          <p className="mt-2 text-xs text-slate-500">
            Actual: {charts.occupancy.current}
            {charts.occupancy.max != null ? ` / ${charts.occupancy.max}` : ''} (
            {charts.occupancy.percent}%)
          </p>
        )}
      </ChartCard>

      <ChartCard title="Membresías activas">
        <div className="flex h-[240px] flex-col items-center justify-center">
          <p className="text-5xl font-semibold tabular-nums text-teal-700">
            {charts.membershipsActive?.count ?? 0}
          </p>
          <p className="mt-2 text-sm text-slate-500">Planes activos en la organización</p>
        </div>
      </ChartCard>

      <ChartCard title="Métodos de pago (mes)">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={paymentData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            >
              {paymentData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `$${Number(v ?? 0).toLocaleString('es-CO')}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Evolución de ingresos">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={charts.revenueEvolution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip formatter={(v) => `$${Number(v ?? 0).toLocaleString('es-CO')}`} />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              name="Diario"
              stroke="#0d9488"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="cumulative"
              name="Acumulado"
              stroke="#0f766e"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function ChartCard({
  title,
  children,
  className = '',
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>
      {children}
    </div>
  );
}
