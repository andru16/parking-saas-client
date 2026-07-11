import api from '@/services/api';
import type { ApiResponse } from '@/api/types';

export type NotificationType = 'info' | 'warning' | 'error' | 'success' | 'system';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface AppNotification {
  id: string;
  organizationId: string | null;
  userId: string | null;
  type: NotificationType;
  category: string;
  event: string;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: string;
  isRead: boolean;
  readAt: string | null;
  actionUrl: string | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationListParams {
  search?: string;
  type?: string;
  category?: string;
  priority?: string;
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

export async function fetchNotifications(params: NotificationListParams = {}) {
  const { data } = await api.get<
    ApiResponse<{
      items: AppNotification[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>
  >('/notifications', {
    params: {
      ...params,
      unreadOnly: params.unreadOnly ? 'true' : undefined,
    },
  });
  return data;
}

export async function fetchUnreadCount() {
  const { data } = await api.get<ApiResponse<{ unread: number }>>(
    '/notifications/unread-count',
  );
  return data;
}

export async function fetchNotificationMeta() {
  const { data } = await api.get<
    ApiResponse<{
      types: string[];
      priorities: string[];
      categories: string[];
    }>
  >('/notifications/meta');
  return data;
}

export async function markNotificationRead(id: string) {
  const { data } = await api.patch<ApiResponse<{ item: AppNotification }>>(
    `/notifications/${id}/read`,
  );
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.post<ApiResponse<{ modified: number }>>(
    '/notifications/read-all',
  );
  return data;
}

export async function deleteNotification(id: string) {
  const { data } = await api.delete<ApiResponse<{ id: string; deleted: boolean }>>(
    `/notifications/${id}`,
  );
  return data;
}
