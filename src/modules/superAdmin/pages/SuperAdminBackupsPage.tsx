import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { adminApi } from '@/modules/superAdmin/adminApi';
import type { BackupJob } from '@/api/backups';

function formatBytes(n?: number) {
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Completado',
  failed: 'Fallido',
  running: 'En curso',
  pending: 'Pendiente',
  expired: 'Expirado',
};

export function SuperAdminBackupsPage() {
  const [page, setPage] = useState(1);
  const [orgId, setOrgId] = useState('');
  const [runOrgId, setRunOrgId] = useState('');
  const qc = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['admin', 'backups', page, orgId],
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/backups', {
        params: {
          page,
          limit: 20,
          organizationId: orgId || undefined,
        },
      });
      return data.data as {
        items: BackupJob[];
        pagination: { page: number; totalPages: number; total: number };
      };
    },
  });

  const schedulerQuery = useQuery({
    queryKey: ['admin', 'backups', 'scheduler'],
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/backups/scheduler');
      return data.data;
    },
  });

  const runOrg = useMutation({
    mutationFn: async (organizationId: string) => {
      const { data } = await adminApi.post(`/admin/backups/organizations/${organizationId}/run`, {
        notes: 'Backup manual Super Admin',
      });
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'backups'] });
    },
  });

  const runScheduler = useMutation({
    mutationFn: async () => {
      const { data } = await adminApi.post('/admin/backups/scheduler/run');
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'backups'] });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Backups</h1>
        <p className="mt-1 text-sm text-slate-500">
          Historial multi-organización, estado y ejecución manual
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Ejecutar backup manual</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              value={runOrgId}
              onChange={(e) => setRunOrgId(e.target.value)}
              placeholder="ID de organización"
              className="min-w-[240px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              disabled={!runOrgId || runOrg.isPending}
              onClick={() => void runOrg.mutateAsync(runOrgId)}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {runOrg.isPending ? 'Ejecutando...' : 'Ejecutar'}
            </button>
          </div>
          {runOrg.isSuccess && (
            <p className="mt-2 text-sm text-teal-700">Backup completado</p>
          )}
          {runOrg.isError && (
            <p className="mt-2 text-sm text-red-600">No se pudo ejecutar el backup</p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Scheduler</h2>
          <p className="mt-2 text-xs text-slate-500">
            Última corrida:{' '}
            {schedulerQuery.data?.scheduler?.lastRun?.finishedAt
              ? new Date(schedulerQuery.data.scheduler.lastRun.finishedAt).toLocaleString('es-CO')
              : 'Sin datos'}
          </p>
          <button
            type="button"
            disabled={runScheduler.isPending}
            onClick={() => void runScheduler.mutateAsync()}
            className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-50"
          >
            Ejecutar due ahora
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Historial</h2>
          <input
            value={orgId}
            onChange={(e) => {
              setOrgId(e.target.value);
              setPage(1);
            }}
            placeholder="Filtrar por organizationId"
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Organización</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Tamaño</th>
                <th className="px-3 py-2">Duración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(listQuery.data?.items ?? []).map((job) => {
                const org =
                  typeof job.organizationId === 'object' && job.organizationId
                    ? job.organizationId.name ?? job.organizationId._id
                    : String(job.organizationId ?? '—');
                return (
                  <tr key={job._id}>
                    <td className="px-3 py-2 whitespace-nowrap">
                      {job.finishedAt || job.createdAt
                        ? new Date(String(job.finishedAt || job.createdAt)).toLocaleString('es-CO')
                        : '—'}
                    </td>
                    <td className="px-3 py-2">{org}</td>
                    <td className="px-3 py-2">{job.type}</td>
                    <td className="px-3 py-2">{STATUS_LABELS[job.status] ?? job.status}</td>
                    <td className="px-3 py-2">{formatBytes(job.sizeBytes)}</td>
                    <td className="px-3 py-2">
                      {job.durationMs != null ? `${Math.round(job.durationMs / 1000)}s` : '—'}
                    </td>
                  </tr>
                );
              })}
              {!listQuery.isLoading && (listQuery.data?.items?.length ?? 0) === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-400">
                    Sin backups registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {(listQuery.data?.pagination?.totalPages ?? 0) > 1 && (
          <div className="flex justify-end gap-2 border-t border-slate-100 px-4 py-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border px-3 py-1 text-xs disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= (listQuery.data?.pagination.totalPages ?? 1)}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border px-3 py-1 text-xs disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
