import {
  deleteNotification,
  fetchNotificationMeta,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/api/notifications';
import { NotificationsCenter } from '@/modules/notifications/components/NotificationsCenter';

export function NotificationsPage() {
  return (
    <NotificationsCenter
      title="Centro de Notificaciones"
      subtitle="Alertas internas de tu organización"
      queryKeyPrefix="notifications"
      fetchList={fetchNotifications}
      fetchMeta={fetchNotificationMeta}
      markRead={markNotificationRead}
      markAllRead={markAllNotificationsRead}
      remove={deleteNotification}
    />
  );
}
