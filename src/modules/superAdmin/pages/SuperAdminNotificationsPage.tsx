import {
  deleteAdminNotification,
  fetchAdminNotificationMeta,
  fetchAdminNotifications,
  markAdminAllNotificationsRead,
  markAdminNotificationRead,
} from '@/modules/superAdmin/notificationsApi';
import { NotificationsCenter } from '@/modules/notifications/components/NotificationsCenter';

export function SuperAdminNotificationsPage() {
  return (
    <NotificationsCenter
      title="Notificaciones de plataforma"
      subtitle="Inbox del Super Admin — no incluye alertas de organizaciones"
      queryKeyPrefix="admin-notifications"
      fetchList={fetchAdminNotifications}
      fetchMeta={fetchAdminNotificationMeta}
      markRead={markAdminNotificationRead}
      markAllRead={markAdminAllNotificationsRead}
      remove={deleteAdminNotification}
    />
  );
}
