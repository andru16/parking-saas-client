import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ReportFilters, ReportType } from '@/api/reports';
import { useAuth } from '@/modules/auth/AuthProvider';
import { usePlanEntitlements } from '@/modules/billing/usePlanEntitlements';
import { ReportFiltersForm } from '@/modules/reports/components/ReportFiltersForm';
import { ReportTable } from '@/modules/reports/components/ReportTable';
import {
  useAllowedReports,
  useExportReport,
  useReport,
} from '@/modules/reports/hooks/useReports';

const REPORT_LABELS: Record<ReportType, string> = {
  tickets: 'Tickets',
  payments: 'Pagos',
  vehicles: 'Vehículos',
  'cash-registers': 'Cajas',
  audit: 'Auditoría',
  members: 'Clientes',
  memberships: 'Membresías',
  'membership-payments': 'Pagos de membresías',
  users: 'Usuarios',
  'frequent-vehicles': 'Vehículos frecuentes',
  'frequent-members': 'Miembros frecuentes',
};

function emptyFilters(): ReportFilters {
  return { page: 1, limit: 20 };
}

export function ReportsPage() {
  const { logout } = useAuth();
  const { hasFeature } = usePlanEntitlements();
  const navigate = useNavigate();
  const { data: allowedData, isLoading: loadingAllowed, isError } = useAllowedReports();
  const allowed = Array.isArray(allowedData) ? allowedData : [];
  const canExportExcel = hasFeature('export_excel');
  const canExportPdf = hasFeature('export_pdf');
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [draftFilters, setDraftFilters] = useState<ReportFilters>(emptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>(emptyFilters);
  const [hasGenerated, setHasGenerated] = useState(false);
  const exportMutation = useExportReport();

  const activeType = selectedType ?? allowed[0] ?? null;

  const reportQuery = useReport(activeType as ReportType, appliedFilters, Boolean(activeType) && hasGenerated);

  function handleTypeChange(type: ReportType) {
    setSelectedType(type);
    const cleared = emptyFilters();
    setDraftFilters(cleared);
    setAppliedFilters(cleared);
    setHasGenerated(false);
  }

  function applyFilters(next: ReportFilters) {
    setAppliedFilters({ ...next, page: 1 });
    setHasGenerated(true);
  }

  function handlePageChange(page: number) {
    setAppliedFilters((prev) => ({ ...prev, page }));
  }

  async function handleExport(format: 'csv' | 'xlsx' | 'pdf') {
    if (!activeType || !hasGenerated) return;
    try {
      await exportMutation.mutateAsync({
        type: activeType,
        format,
        filters: appliedFilters,
      });
    } catch {
      // ignore
    }
  }

  if (loadingAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Cargando reportes…
      </div>
    );
  }

  if (isError || allowed.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
        <p className="text-lg font-semibold text-slate-800">Sin acceso a reportes</p>
        <p className="max-w-md text-sm text-slate-500">
          Tu rol no tiene permisos de reportes habilitados. Contacta al administrador.
        </p>
        <div className="flex gap-2">
          <Link
            to="/dashboard"
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Ir al dashboard
          </Link>
          <button
            type="button"
            onClick={() => {
              void logout().then(() => navigate('/login', { replace: true }));
            }}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Centro de Reportes</h1>
            <p className="mt-1 text-sm text-slate-500">
              Seleccione el tipo de reporte, aplique filtros y genere o exporte el resultado
            </p>
          </div>
          <Link
            to="/dashboard"
            className="text-sm font-medium text-teal-700 hover:text-teal-800 hover:underline"
          >
            ← Dashboard operativo
          </Link>
        </header>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {allowed.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    activeType === type
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {REPORT_LABELS[type]}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {canExportExcel && (
                <button
                  type="button"
                  disabled={!hasGenerated || exportMutation.isPending}
                  onClick={() => handleExport('xlsx')}
                  className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Excel
                </button>
              )}
              {canExportPdf && (
                <button
                  type="button"
                  disabled={!hasGenerated || exportMutation.isPending}
                  onClick={() => handleExport('pdf')}
                  className="rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  PDF
                </button>
              )}
              <button
                type="button"
                disabled={!hasGenerated || exportMutation.isPending}
                onClick={() => handleExport('csv')}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                CSV
              </button>
            </div>
          </div>

          {activeType && (
            <ReportFiltersForm
              filters={draftFilters}
              onChange={setDraftFilters}
              onSubmit={applyFilters}
              reportType={activeType}
            />
          )}

          {!hasGenerated ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <p className="text-base font-semibold text-slate-800">Genere un reporte</p>
              <p className="mt-2 text-sm text-slate-500">
                Configure los filtros y pulse <span className="font-medium text-slate-700">Generar reporte</span> para
                ver los resultados. Los indicadores del día están en el dashboard operativo.
              </p>
            </div>
          ) : (
            <ReportTable
              columns={reportQuery.data?.columns ?? []}
              rows={reportQuery.data?.rows ?? []}
              pagination={reportQuery.data?.pagination}
              isLoading={reportQuery.isLoading}
              isFetching={reportQuery.isFetching}
              onPageChange={handlePageChange}
            />
          )}
        </section>
      </div>
    </div>
  );
}
