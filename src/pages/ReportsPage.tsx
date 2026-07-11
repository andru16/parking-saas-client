import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { ReportFilters, ReportType } from '@/api/reports';
import { DashboardChartsPanel } from '@/modules/dashboard/components/DashboardChartsPanel';
import { KpiGrid } from '@/modules/dashboard/components/KpiGrid';
import { useDashboardCharts, useDashboardKpis } from '@/modules/dashboard/hooks/useDashboard';
import { ReportFiltersForm } from '@/modules/reports/components/ReportFiltersForm';
import { ReportTable } from '@/modules/reports/components/ReportTable';
import {
  useAllowedReports,
  useExportReport,
  useReport,
} from '@/modules/reports/hooks/useReports';

const CATEGORY_LABELS: Record<string, string> = {
  operation: 'Operación',
  financial: 'Financiero',
  cash: 'Caja',
  memberships: 'Membresías',
  users: 'Usuarios',
};

export function ReportsPage() {
  const { data: allowedData } = useAllowedReports();
  const allowed = allowedData?.reports ?? [];
  const byCategory = allowedData?.byCategory ?? [];
  const catalog = allowedData?.catalog ?? [];

  const [reportType, setReportType] = useState<ReportType>('tickets');
  const [filters, setFilters] = useState<ReportFilters>({ page: 1, limit: 20 });
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>({ page: 1, limit: 20 });

  const { data: kpis, isLoading: loadingKpis } = useDashboardKpis();
  const { data: charts, isLoading: loadingCharts } = useDashboardCharts(30);

  const canQuery = allowed.includes(reportType);
  const { data: report, isLoading, isFetching } = useReport(
    reportType,
    appliedFilters,
    canQuery,
  );
  const exportMutation = useExportReport();

  const selectedMeta = useMemo(
    () => catalog.find((c) => c.type === reportType),
    [catalog, reportType],
  );

  function handleSearch(next: ReportFilters) {
    setAppliedFilters({ ...next, page: 1, limit: 20 });
    setFilters({ ...next, page: 1, limit: 20 });
  }

  async function handleExport(format: 'csv' | 'xlsx' | 'pdf') {
    const blob = await exportMutation.mutateAsync({
      type: reportType,
      format,
      filters: appliedFilters,
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${reportType}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Centro de Reportes y Analítica</h1>
          <p className="text-sm text-slate-500">
            Indicadores, gráficos, filtros y exportaciones por organización
          </p>
        </div>
        <Link to="/dashboard" className="text-sm text-teal-700 hover:underline">
          ← Dashboard operativo
        </Link>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Indicadores</h2>
        <KpiGrid kpis={kpis} isLoading={loadingKpis} />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900">Visualizaciones</h2>
        <DashboardChartsPanel charts={charts} isLoading={loadingCharts} />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Reportes detallados</h2>
          <p className="text-xs text-slate-500">
            {selectedMeta?.description ?? 'Seleccione un reporte y aplique filtros'}
          </p>
        </div>

        <div className="space-y-4">
          {byCategory.map((group) => (
            <div key={group.category}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {CATEGORY_LABELS[group.category] ?? group.category}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.reports.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setReportType(item.type as ReportType)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      reportType === item.type
                        ? 'bg-teal-700 text-white'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {!byCategory.length && allowed.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allowed.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setReportType(type as ReportType)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    reportType === type
                      ? 'bg-teal-700 text-white'
                      : 'border border-slate-200 bg-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        <ReportFiltersForm
          filters={filters}
          onChange={setFilters}
          onSubmit={handleSearch}
          reportType={reportType}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {(['xlsx', 'pdf', 'csv'] as const).map((format) => (
              <button
                key={format}
                type="button"
                disabled={exportMutation.isPending || !report?.rows?.length}
                onClick={() => void handleExport(format)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Exportar {format.toUpperCase()}
              </button>
            ))}
          </div>
          {report?.pagination && (
            <p className="text-xs text-slate-500">
              {report.pagination.totalRecords} resultado
              {report.pagination.totalRecords === 1 ? '' : 's'}
            </p>
          )}
        </div>

        <ReportTable
          columns={report?.columns ?? []}
          rows={report?.rows ?? []}
          isLoading={isLoading}
          isFetching={isFetching}
          pagination={report?.pagination}
          onPageChange={(page) => setAppliedFilters((f) => ({ ...f, page }))}
        />
      </section>
    </div>
  );
}
