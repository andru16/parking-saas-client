import api from '@/services/api';
import type { ApiResponse } from '@/api/types';

export interface BackupConfig {
  enabled: boolean;
  frequency: 'disabled' | 'daily' | 'weekly' | 'monthly';
  hour: number;
  minute: number;
  retentionDays: number;
  retentionCount: number;
  storageProvider: 'local' | 's3' | 'azure' | 'gcs';
  includeAuditLogs: boolean;
  notes: string;
}

export interface BackupJob {
  _id: string;
  organizationId?: string | { _id: string; name?: string; email?: string; status?: string };
  type: string;
  status: string;
  sizeBytes?: number;
  filename?: string | null;
  startedAt?: string | null;
  finishedAt?: string | null;
  durationMs?: number | null;
  resultMessage?: string | null;
  errorMessage?: string | null;
  notes?: string;
  triggeredBy?: string;
  triggeredByUserId?: { firstName?: string; lastName?: string; email?: string } | null;
  collections?: { name: string; documentCount: number }[];
  restore?: {
    status?: string;
    message?: string | null;
    finishedAt?: string | null;
  };
  createdAt?: string;
}

export interface BackupStatus {
  config: BackupConfig;
  latest: {
    id: string;
    type: string;
    status: string;
    sizeBytes: number;
    finishedAt: string;
    durationMs: number;
  } | null;
  counts: Record<string, number>;
  features: Record<string, boolean>;
}

export async function getBackupStatus(): Promise<ApiResponse<{ status: BackupStatus }>> {
  const { data } = await api.get('/backups/status');
  return data;
}

export async function getBackupConfig(): Promise<ApiResponse<{ config: BackupConfig }>> {
  const { data } = await api.get('/backups/config');
  return data;
}

export async function updateBackupConfig(
  config: Partial<BackupConfig>,
): Promise<ApiResponse<{ config: BackupConfig }>> {
  const { data } = await api.put('/backups/config', config);
  return data;
}

export async function listBackups(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<
  ApiResponse<{
    items: BackupJob[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>
> {
  const { data } = await api.get('/backups', { params });
  return data;
}

export async function runManualBackup(notes?: string): Promise<ApiResponse<{ backup: BackupJob }>> {
  const { data } = await api.post('/backups/run', { notes });
  return data;
}

export async function deleteBackup(id: string): Promise<ApiResponse<unknown>> {
  const { data } = await api.delete(`/backups/${id}`);
  return data;
}

export async function downloadBackup(id: string): Promise<Blob> {
  const response = await api.get(`/backups/${id}/download`, { responseType: 'blob' });
  return response.data;
}

export async function previewRestore(
  id: string,
): Promise<
  ApiResponse<{
    preview: {
      backupId: string;
      warning: string;
      confirmationPhrase: string;
      collections: { name: string; documentCount: number }[];
      sizeBytes: number;
    };
  }>
> {
  const { data } = await api.get(`/backups/${id}/restore/preview`);
  return data;
}

export async function restoreBackup(
  id: string,
  confirmationPhrase: string,
): Promise<ApiResponse<{ ok: boolean; summary: { totalDocuments: number; collections: number } }>> {
  const { data } = await api.post(`/backups/${id}/restore`, {
    confirm: true,
    confirmationPhrase,
  });
  return data;
}
