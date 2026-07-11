import { adminApi } from '@/modules/superAdmin/adminApi';
import type { ApiResponse } from '@/api/types';
import type {
  AuditDetail,
  AuditListItem,
  AuditListParams,
  AuditMeta,
} from '@/api/audit';

export async function fetchAdminAuditLogs(params: AuditListParams) {
  const { data } = await adminApi.get<
    ApiResponse<{
      items: AuditListItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>
  >('/admin/audit', { params });
  return data;
}

export async function fetchAdminAuditDetail(id: string) {
  const { data } = await adminApi.get<ApiResponse<{ item: AuditDetail }>>(
    `/admin/audit/${id}`,
  );
  return data;
}

export async function fetchAdminAuditMeta() {
  const { data } = await adminApi.get<ApiResponse<AuditMeta>>('/admin/audit/meta');
  return data;
}

export async function exportAdminAuditLogs(
  params: AuditListParams & { format: 'csv' | 'xlsx' | 'pdf' },
) {
  return adminApi.get('/admin/audit/export', {
    params,
    responseType: 'blob',
  });
}
