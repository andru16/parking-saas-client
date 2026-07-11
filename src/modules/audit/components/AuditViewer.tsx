import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  exportAuditLogs,
  fetchAuditDetail,
  fetchAuditLogs,
  fetchAuditMeta,
  type AuditListItem,
} from '@/api/audit';

function resultBadge(result: string) {
  return result === 'error'
    ? 'bg-rose-50 text-rose-800'
    : 'bg-teal-50 text-teal-800';
}

function userTypeLabel(t: string | null) {
  if (t === 'platform_user') return 'Plataforma';
  if (t === 'organization_user') return 'Organización';
  if (t === 'system') return 'Sistema';
  return t ?? '—';
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface AuditViewerProps {
  /** Si true, muestra filtro de organización (Super Admin). */
  showOrganizationFilter?: boolean;
  /** Fetchers inyectables para SA vs tenant */
  fetchLogs?: typeof fetchAuditLogs;
  fetchDetail?: typeof fetchAuditDetail;
  fetchMeta?: typeof fetchAuditMeta;
  exportLogs?: typeof exportAuditLogs;
  title?: string;
  subtitle?: string;
}

export function AuditViewer({
  showOrganizationFilter = false,
  fetchLogs = fetchAuditLogs,
  fetchDetail = fetchAuditDetail,
  fetchMeta = fetchAuditMeta,
  exportLogs = exportAuditLogs,
  title = 'Auditoría',
  subtitle = 'Registro de acciones del sistema',
}: AuditViewerProps) {
  const [search, setSearch] = useState('');
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [result, setResult] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [exporting, setExporting] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      search: search || undefined,
      module: module || undefined,
      action: action || undefined,
      result: result || undefined,
      from: from || undefined,
      to: to || undefined,
      organizationId: showOrganizationFilter && organizationId ? organizationId : undefined,
      page,
      limit: 25,
    }),
    [search, module, action, result, from, to, organizationId, page, showOrganizationFilter],
  );

  const { data: meta } = useQuery({
    queryKey: ['audit', 'meta', showOrganizationFilter],
    queryFn: async () => (await fetchMeta()).data,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ['audit', 'list', params],
    queryFn: async () => (await fetchLogs(params)).data,
  });

  const { data: detailData, isLoading: loadingDetail } = useQuery({
    queryKey: ['audit', 'detail', selectedId],
    queryFn: async () => (await fetchDetail(selectedId!)).data.item,
    enabled: Boolean(selectedId),
  });

  async function handleExport(format: 'csv' | 'xlsx' | 'pdf') {
    setExporting(format);
    try {
      const res = await exportLogs({ ...params, format });
      const blob = res.data as Blob;
      downloadBlob(blob, `auditoria.${format === 'xlsx' ? 'xlsx' : format}`);
    } finally {
      setExporting(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          {meta?.retention && (
            <p className="mt-1 text-xs text-slate-400">
              Retención: {meta.retention.label} · purga automática desactivada
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {(['csv', 'xlsx', 'pdf'] as const).map((fmt) => (
            <button
              key={fmt}
              type="button"
              disabled={Boolean(exporting)}
              onClick={() => handleExport(fmt)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {exporting === fmt ? '…' : fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Buscar descripción, módulo…"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm md:col-span-2"
        />
        <select
          value={module}
          onChange={(e) => {
            setModule(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todos los módulos</option>
          {(meta?.modules ?? []).map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={action}
          onChange={(e) => {
            setAction(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todas las acciones</option>
          {(meta?.actions ?? []).map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select
          value={result}
          onChange={(e) => {
            setResult(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Cualquier resultado</option>
          <option value="success">Éxito</option>
          <option value="error">Error</option>
        </select>
        <input
          type="date"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        {showOrganizationFilter && (
          <input
            type="text"
            value={organizationId}
            onChange={(e) => {
              setOrganizationId(e.target.value.trim());
              setPage(1);
            }}
            placeholder="ID organización (opcional)"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-xs"
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-3">
          {isLoading && <p className="p-4 text-sm text-slate-400">Cargando…</p>}
          {isError && <p className="p-4 text-sm text-red-600">No se pudo cargar la auditoría.</p>}
          {!isLoading && data && (
            <>
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold">Fecha</th>
                    <th className="px-3 py-2.5 font-semibold">Módulo</th>
                    <th className="px-3 py-2.5 font-semibold">Acción</th>
                    <th className="px-3 py-2.5 font-semibold">Usuario</th>
                    <th className="px-3 py-2.5 font-semibold">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-8 text-center text-slate-400">
                        Sin registros
                      </td>
                    </tr>
                  )}
                  {data.items.map((row: AuditListItem) => (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedId(row.id)}
                      className={`cursor-pointer hover:bg-slate-50 ${
                        selectedId === row.id ? 'bg-teal-50/60' : ''
                      }`}
                    >
                      <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-600">
                        {new Date(row.createdAt).toLocaleString('es-CO')}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-800">{row.module}</td>
                      <td className="px-3 py-2.5 text-slate-700">{row.action}</td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {row.user?.name || row.user?.email || 'Sistema'}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${resultBadge(row.result)}`}
                        >
                          {row.result === 'error' ? 'Error' : 'Éxito'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-sm text-slate-600">
                <span>
                  {data.pagination.total} registro
                  {data.pagination.total === 1 ? '' : 's'}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40"
                  >
                    Anterior
                  </button>
                  <span className="tabular-nums">
                    {data.pagination.page} / {data.pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= data.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-lg border border-slate-200 px-2 py-1 disabled:opacity-40"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Detalle del evento</h2>
          {!selectedId && (
            <p className="mt-4 text-sm text-slate-400">Selecciona un registro de la lista.</p>
          )}
          {selectedId && loadingDetail && (
            <p className="mt-4 text-sm text-slate-400">Cargando detalle…</p>
          )}
          {detailData && (
            <dl className="mt-4 space-y-3 text-sm">
              <DetailRow label="Descripción" value={detailData.description} />
              <DetailRow label="Módulo" value={detailData.module} />
              <DetailRow label="Acción" value={detailData.action} />
              <DetailRow label="Resultado" value={detailData.result} />
              <DetailRow label="Tipo usuario" value={userTypeLabel(detailData.userType)} />
              <DetailRow
                label="Usuario"
                value={
                  detailData.user
                    ? `${detailData.user.name} (${detailData.user.email ?? '—'})`
                    : 'Sistema'
                }
              />
              {detailData.organization && (
                <DetailRow label="Organización" value={detailData.organization.name} />
              )}
              <DetailRow
                label="Entidad"
                value={
                  detailData.entityType
                    ? `${detailData.entityType} · ${detailData.entityId ?? '—'}`
                    : '—'
                }
              />
              <DetailRow label="IP" value={detailData.ip ?? '—'} />
              <DetailRow label="User-Agent" value={detailData.userAgent ?? '—'} />
              <DetailRow
                label="Fecha"
                value={new Date(detailData.createdAt).toLocaleString('es-CO')}
              />
              {detailData.previousValues != null && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Valores anteriores
                  </dt>
                  <dd className="mt-1 max-h-40 overflow-auto rounded-lg bg-slate-50 p-2 font-mono text-xs text-slate-700">
                    {JSON.stringify(detailData.previousValues, null, 2)}
                  </dd>
                </div>
              )}
              {detailData.newValues != null && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Valores nuevos
                  </dt>
                  <dd className="mt-1 max-h-40 overflow-auto rounded-lg bg-slate-50 p-2 font-mono text-xs text-slate-700">
                    {JSON.stringify(detailData.newValues, null, 2)}
                  </dd>
                </div>
              )}
              {detailData.metadata != null && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Metadata
                  </dt>
                  <dd className="mt-1 max-h-40 overflow-auto rounded-lg bg-slate-50 p-2 font-mono text-xs text-slate-700">
                    {JSON.stringify(detailData.metadata, null, 2)}
                  </dd>
                </div>
              )}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 break-words text-slate-800">{value}</dd>
    </div>
  );
}
