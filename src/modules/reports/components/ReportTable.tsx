import type { ReportColumn } from '@/api/reports';

interface ReportTableProps {
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  isLoading: boolean;
  isFetching: boolean;
  pagination?: { page: number; limit: number; totalRecords: number; totalPages: number };
  onPageChange: (page: number) => void;
}

export function ReportTable({
  columns,
  rows,
  isLoading,
  isFetching,
  pagination,
  onPageChange,
}: ReportTableProps) {
  if (isLoading) {
    return <p className="text-sm text-gray-400 py-8 text-center">Cargando reporte...</p>;
  }

  return (
    <div className="rounded-xl bg-white border border-gray-200 overflow-hidden shadow-sm">
      {isFetching && (
        <div className="h-0.5 bg-primary-500 animate-pulse" />
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide"
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
                    <td key={col.key} className="px-4 py-2.5 text-gray-800 whitespace-nowrap">
                      {formatCell(row[col.key])}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
          <p className="text-gray-500">
            {pagination.totalRecords} registros — página {pagination.page} de {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCell(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value))) {
    return new Date(String(value)).toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }
  if (typeof value === 'number') return value.toLocaleString('es-CO');
  return String(value);
}
