import { Link } from 'react-router-dom';
import { useAuth } from '@/modules/auth/AuthProvider';
import { DashboardChartsPanel } from '@/modules/dashboard/components/DashboardChartsPanel';
import { DashboardHeroKpis } from '@/modules/dashboard/components/DashboardHeroKpis';
import { KpiGrid } from '@/modules/dashboard/components/KpiGrid';
import { FrequentVehicles } from '@/modules/dashboard/components/FrequentVehicles';
import { MembershipExpirations } from '@/modules/dashboard/components/MembershipExpirations';
import { OrganizationSubscriptionCard } from '@/modules/dashboard/components/OrganizationSubscriptionCard';
import { QuickActions } from '@/modules/dashboard/components/QuickActions';
import { RecentActivity } from '@/modules/dashboard/components/RecentActivity';
import { useDashboardCharts, useDashboardKpis } from '@/modules/dashboard/hooks/useDashboard';

export function DashboardPage() {
  const { user } = useAuth();
  const { data: kpis, isLoading: loadingKpis } = useDashboardKpis();
  const { data: charts, isLoading: loadingCharts } = useDashboardCharts(30);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            {user?.organization?.name ?? 'Parqueadero'} · resumen en tiempo real
          </p>
        </div>
        <Link
          to="/operations"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Ir a operaciones
        </Link>
      </div>

      <DashboardHeroKpis kpis={kpis} isLoading={loadingKpis} />

      <OrganizationSubscriptionCard />

      <QuickActions />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Indicadores operativos</h2>
          <KpiGrid kpis={kpis} isLoading={loadingKpis} />
        </div>
        <div className="space-y-4">
          <RecentActivity />
          <MembershipExpirations />
          <FrequentVehicles />
        </div>
      </div>

      <DashboardChartsPanel charts={charts} isLoading={loadingCharts} />

      {kpis?.asOf && (
        <p className="text-right text-xs text-slate-400">
          Actualizado: {new Date(kpis.asOf).toLocaleTimeString('es-CO')} ({kpis.timezone})
        </p>
      )}
    </div>
  );
}
