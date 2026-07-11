import api from '@/services/api';
import type { ApiResponse } from '@/api/types';

export interface AuditListItem {
  id: string;
  createdAt: string;
  module: string;
  action: string;
  description: string;
  result: 'success' | 'error';
  userType: string | null;
  entityType: string | null;
  entityId: string | null;
  ip: string | null;
  user: { id: string; name: string; email: string | null } | null;
  organization: {
    id: string;
    name: string;
    email: string | null;
    status: string | null;
  } | null;
}

export interface AuditDetail extends AuditListItem {
  userAgent: string | null;
  previousValues: unknown;
  newValues: unknown;
  metadata: unknown;
  sink: string;
  resourceId: string | null;
}

export interface AuditMeta {
  modules: string[];
  actions: string[];
  results: string[];
  userTypes: string[];
  retention: {
    months: number;
    label: string;
    autoDeleteEnabled: boolean;
    note: string;
    cutoffPreview: string;
  };
  sinks: string[];
}

export interface AuditListParams {
  search?: string;
  module?: string;
  action?: string;
  result?: string;
  userType?: string;
  userId?: string;
  organizationId?: string;
  entityType?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export async function fetchAuditLogs(params: AuditListParams) {
  const { data } = await api.get<
    ApiResponse<{
      items: AuditListItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>
  >('/audit', { params });
  return data;
}

export async function fetchAuditDetail(id: string) {
  const { data } = await api.get<ApiResponse<{ item: AuditDetail }>>(`/audit/${id}`);
  return data;
}

export async function fetchAuditMeta() {
  const { data } = await api.get<ApiResponse<AuditMeta>>('/audit/meta');
  return data;
}

export async function exportAuditLogs(params: AuditListParams & { format: 'csv' | 'xlsx' | 'pdf' }) {
  const response = await api.get('/audit/export', {
    params,
    responseType: 'blob',
  });
  return response;
}
