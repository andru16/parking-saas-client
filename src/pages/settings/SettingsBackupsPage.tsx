import type { ReactNode } from 'react';
import { useState } from 'react';
import type { BackupConfig } from '@/api/backups';
import { SettingsFormActions, SettingsSectionShell } from '@/modules/settings/components/SettingsSectionShell';
import {
  useBackupList,
  useBackupStatus,
  useDeleteBackup,
  useDownloadBackup,
  useRestoreBackup,
  useRunBackup,
  useUpdateBackupConfig,
} from '@/modules/backups/hooks/useBackups';
import { hasPermission, PERMISSIONS } from '@/modules/auth/permissions';
import { useAuth } from '@/modules/auth/AuthProvider';
import { confirmAction } from '@/lib/dialogs';

function formatBytes(n?: number) {
  if (!n) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

const TYPE_LABELS: Record<string, string> = {
  manual: 'Manual',
  daily: 'Diario',
  weekly: 'Semanal',
  monthly: 'Mensual',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  running: 'En curso',
  completed: 'Completado',
  failed: 'Fallido',
  deleted: 'Eliminado',
  expired: 'Expirado',
};

export function SettingsBackupsPage() {
  const { user } = useAuth();
  const canManage = hasPermission(user?.permissions, PERMISSIONS.BACKUPS_MANAGE);
  const canRestore = hasPermission(user?.permissions, PERMISSIONS.BACKUPS_RESTORE);
  const { data: status, isLoading } = useBackupStatus();
  const [page, setPage] = useState(1);
  const { data: list, isFetching } = useBackupList(page);
  const runBackup = useRunBackup();
  const updateConfig = useUpdateBackupConfig();
  const removeBackup = useDeleteBackup();
  const download = useDownloadBackup();
  const restore = useRestoreBackup();

  const [restoreId, setRestoreId] = useState<string | null>(null);
  const [restorePhrase, setRestorePhrase] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-400">Cargando backups...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SettingsSectionShell
        title="Backups y recuperación"
        description="Copias de seguridad de los datos de su organización. La restauración siempre requiere confirmación."
      >
        {({ readOnly, formKey, finishEditing, cancelEditing }) => (
          <BackupConfigForm
            key={formKey}
            initial={status?.config}
            readOnly={readOnly || !canManage}
            isSaving={updateConfig.isPending}
            onCancel={cancelEditing}
            onSave={async (config) => {
              await updateConfig.mutateAsync(config);
              finishEditing();
              setMessage('Configuración guardada');
            }}
          />
        )}
      </SettingsSectionShell>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Estado</h3>
            <p className="text-xs text-slate-500">
              Último backup:{' '}
              {status?.latest?.finishedAt
                ? new Date(status.latest.finishedAt).toLocaleString('es-CO')
                : 'Sin backups aún'}
              {status?.latest ? ` · ${formatBytes(status.latest.sizeBytes)}` : ''}
            </p>
          </div>
          {canManage && (
            <button
              type="button"
              disabled={runBackup.isPending}
              onClick={async () => {
                setError(null);
                try {
                  await runBackup.mutateAsync('Backup manual desde configuración');
                  setMessage('Backup completado correctamente');
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'No se pudo ejecutar el backup');
                }
              }}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
            >
              {runBackup.isPending ? 'Ejecutando...' : 'Ejecutar backup ahora'}
            </button>
          )}
        </div>

        {message && <p className="mb-3 text-sm text-teal-700">{message}</p>}
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Tipo</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Tamaño</th>
                <th className="px-3 py-2">Duración</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(list?.items ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-slate-400">
                    {isFetching ? 'Cargando historial...' : 'Sin historial de backups'}
                  </td>
                </tr>
              ) : (
                list?.items.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/80">
                    <td className="px-3 py-2 whitespace-nowrap">
                      {job.finishedAt || job.createdAt
                        ? new Date(String(job.finishedAt || job.createdAt)).toLocaleString('es-CO')
                        : '—'}
                    </td>
                    <td className="px-3 py-2">{TYPE_LABELS[job.type] ?? job.type}</td>
                    <td className="px-3 py-2">{STATUS_LABELS[job.status] ?? job.status}</td>
                    <td className="px-3 py-2">{formatBytes(job.sizeBytes)}</td>
                    <td className="px-3 py-2">
                      {job.durationMs != null ? `${Math.round(job.durationMs / 1000)}s` : '—'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-2">
                        {canManage && job.status === 'completed' && (
                          <button
                            type="button"
                            className="text-xs font-medium text-teal-700 hover:underline"
                            onClick={() => void download.mutateAsync(job._id)}
                          >
                            Descargar
                          </button>
                        )}
                        {canRestore && job.status === 'completed' && (
                          <button
                            type="button"
                            className="text-xs font-medium text-amber-700 hover:underline"
                            onClick={() => {
                              setRestoreId(job._id);
                              setRestorePhrase('');
                            }}
                          >
                            Restaurar
                          </button>
                        )}
                        {canManage && (
                          <button
                            type="button"
                            className="text-xs font-medium text-red-600 hover:underline"
                            onClick={() => {
                              void (async () => {
                                const ok = await confirmAction({
                                  title: '¿Eliminar este backup?',
                                  text: 'Esta acción no se puede deshacer.',
                                  confirmText: 'Eliminar',
                                  danger: true,
                                });
                                if (ok) void removeBackup.mutateAsync(job._id);
                              })();
                            }}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {(list?.pagination?.totalPages ?? 0) > 1 && (
          <div className="mt-3 flex justify-end gap-2">
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
              disabled={page >= (list?.pagination.totalPages ?? 1)}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border px-3 py-1 text-xs disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </section>

      {restoreId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">Confirmar restauración</h3>
            <p className="mt-2 text-sm text-slate-600">
              Esta acción reemplazará datos actuales con el contenido del backup. No es automática:
              escriba <strong>RESTAURAR</strong> para continuar.
            </p>
            <input
              value={restorePhrase}
              onChange={(e) => setRestorePhrase(e.target.value)}
              className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="RESTAURAR"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg border px-3 py-1.5 text-sm"
                onClick={() => setRestoreId(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={restore.isPending || restorePhrase !== 'RESTAURAR'}
                className="rounded-lg bg-amber-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                onClick={async () => {
                  setError(null);
                  try {
                    await restore.mutateAsync({ id: restoreId, phrase: restorePhrase });
                    setRestoreId(null);
                    setMessage('Restauración completada');
                  } catch (e) {
                    setError(e instanceof Error ? e.message : 'Error al restaurar');
                  }
                }}
              >
                {restore.isPending ? 'Restaurando...' : 'Confirmar restauración'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BackupConfigForm({
  initial,
  readOnly,
  isSaving,
  onCancel,
  onSave,
}: {
  initial?: BackupConfig;
  readOnly: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (config: BackupConfig) => Promise<void>;
}) {
  const [config, setConfig] = useState<BackupConfig>(
    initial ?? {
      enabled: false,
      frequency: 'daily',
      hour: 3,
      minute: 0,
      retentionDays: 30,
      retentionCount: 14,
      storageProvider: 'local',
      includeAuditLogs: false,
      notes: '',
    },
  );

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (readOnly) return;
        await onSave(config);
      }}
    >
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={config.enabled}
          disabled={readOnly}
          onChange={(e) => setConfig((c) => ({ ...c, enabled: e.target.checked }))}
        />
        Activar backups automáticos
      </label>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Frecuencia">
          <select
            disabled={readOnly || !config.enabled}
            value={config.frequency}
            onChange={(e) =>
              setConfig((c) => ({
                ...c,
                frequency: e.target.value as BackupConfig['frequency'],
              }))
            }
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="daily">Diaria</option>
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensual</option>
          </select>
        </Field>
        <Field label="Hora (UTC)">
          <input
            type="number"
            min={0}
            max={23}
            disabled={readOnly || !config.enabled}
            value={config.hour}
            onChange={(e) => setConfig((c) => ({ ...c, hour: Number(e.target.value) }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Retención (días)">
          <input
            type="number"
            min={1}
            disabled={readOnly}
            value={config.retentionDays}
            onChange={(e) => setConfig((c) => ({ ...c, retentionDays: Number(e.target.value) }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Máx. copias">
          <input
            type="number"
            min={1}
            disabled={readOnly}
            value={config.retentionCount}
            onChange={(e) => setConfig((c) => ({ ...c, retentionCount: Number(e.target.value) }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={config.includeAuditLogs}
          disabled={readOnly}
          onChange={(e) => setConfig((c) => ({ ...c, includeAuditLogs: e.target.checked }))}
        />
        Incluir registros de auditoría en el backup
      </label>

      {!readOnly && (
        <SettingsFormActions isSaving={isSaving} onCancel={onCancel} submitLabel="Guardar" />
      )}
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}
