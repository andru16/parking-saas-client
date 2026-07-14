import type { ReportColumn } from '@/api/reports';
import { formatReportCell } from '@/modules/reports/utils/reportValueLabels';

interface ReportTableProps {
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  isLoading: boolean;
  isFetching?: boolean;
  pagination?: { page: number; limit: number; totalRecords: number; totalPages: number };
  onPageChange: (page: number) => void;
}

export function ReportTable({
  columns,
  rows,
  isLoading,
  isFetching = false,
  pagination,
  onPageChange,
}: ReportTableProps) {
  if (isLoading && rows.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-400">Cargando reporte...</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {isFetching && <div className="h-0.5 animate-pulse bg-primary-500" />}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length || 1} className="px-4 py-8 text-center text-gray-400">
                  Sin resultados para los filtros seleccionados
                </td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-4 py-2.5 text-gray-800">
                      {formatReportCell(col.key, row[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-sm">
          <p className="text-gray-500">
            {pagination.totalRecords} registros — página {pagination.page} de {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="rounded border border-gray-300 px-3 py-1 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="rounded border border-gray-300 px-3 py-1 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
