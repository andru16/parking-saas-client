import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deleteBackup,
  downloadBackup,
  getBackupStatus,
  listBackups,
  previewRestore,
  restoreBackup,
  runManualBackup,
  updateBackupConfig,
  type BackupConfig,
} from '@/api/backups';

export const backupKeys = {
  all: ['backups'] as const,
  status: () => [...backupKeys.all, 'status'] as const,
  list: (page: number) => [...backupKeys.all, 'list', page] as const,
};

export function useBackupStatus() {
  return useQuery({
    queryKey: backupKeys.status(),
    queryFn: async () => {
      const res = await getBackupStatus();
      return res.data.status;
    },
    refetchInterval: 30_000,
  });
}

export function useBackupList(page = 1) {
  return useQuery({
    queryKey: backupKeys.list(page),
    queryFn: async () => {
      const res = await listBackups({ page, limit: 15 });
      return res.data;
    },
  });
}

export function useRunBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notes?: string) => runManualBackup(notes),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: backupKeys.all });
    },
  });
}

export function useUpdateBackupConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: Partial<BackupConfig>) => updateBackupConfig(config),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: backupKeys.status() });
    },
  });
}

export function useDeleteBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteBackup(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: backupKeys.all });
    },
  });
}

export function useDownloadBackup() {
  return useMutation({
    mutationFn: async (id: string) => {
      const blob = await downloadBackup(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${id}.json.gz`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

export function useRestoreBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, phrase }: { id: string; phrase: string }) => {
      await previewRestore(id);
      return restoreBackup(id, phrase);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: backupKeys.all });
    },
  });
}
