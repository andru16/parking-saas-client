import { adminApi } from '@/modules/superAdmin/adminApi';
import type { ApiResponse } from '@/api/types';
import type { AppNotification, NotificationListParams } from '@/api/notifications';

export async function fetchAdminNotifications(params: NotificationListParams = {}) {
  const { data } = await adminApi.get<
    ApiResponse<{
      items: AppNotification[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>
  >('/admin/notifications', {
    params: {
      ...params,
      unreadOnly: params.unreadOnly ? 'true' : undefined,
    },
  });
  return data;
}

export async function fetchAdminUnreadCount() {
  const { data } = await adminApi.get<ApiResponse<{ unread: number }>>(
    '/admin/notifications/unread-count',
  );
  return data;
}

export async function fetchAdminNotificationMeta() {
  const { data } = await adminApi.get<
    ApiResponse<{ types: string[]; priorities: string[]; categories: string[] }>
  >('/admin/notifications/meta');
  return data;
}

export async function markAdminNotificationRead(id: string) {
  const { data } = await adminApi.patch<ApiResponse<{ item: AppNotification }>>(
    `/admin/notifications/${id}/read`,
  );
  return data;
}

export async function markAdminAllNotificationsRead() {
  const { data } = await adminApi.post<ApiResponse<{ modified: number }>>(
    '/admin/notifications/read-all',
  );
  return data;
}

export async function deleteAdminNotification(id: string) {
  const { data } = await adminApi.delete<ApiResponse<{ id: string; deleted: boolean }>>(
    `/admin/notifications/${id}`,
  );
  return data;
}

export async function createAdminNotification(payload: {
  title: string;
  message: string;
  type?: string;
  category?: string;
  priority?: string;
  actionUrl?: string;
}) {
  const { data } = await adminApi.post('/admin/notifications', payload);
  return data;
}
