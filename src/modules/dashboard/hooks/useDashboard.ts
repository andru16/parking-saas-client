import { useQuery } from '@tanstack/react-query';
import { getDashboardCharts, getDashboardKpis } from '@/api/reports';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  kpis: () => [...dashboardKeys.all, 'kpis'] as const,
  charts: (days: number) => [...dashboardKeys.all, 'charts', days] as const,
};

export function useDashboardKpis() {
  return useQuery({
    queryKey: dashboardKeys.kpis(),
    queryFn: async () => {
      const res = await getDashboardKpis();
      return res.data.kpis;
    },
    refetchInterval: 30_000,
  });
}

export function useDashboardCharts(days = 30) {
  return useQuery({
    queryKey: dashboardKeys.charts(days),
    queryFn: async () => {
      const res = await getDashboardCharts(days);
      return res.data.charts;
    },
    refetchInterval: 60_000,
  });
}
