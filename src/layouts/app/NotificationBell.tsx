import { fetchNotifications, fetchUnreadCount, markAllNotificationsRead, markNotificationRead } from '@/api/notifications';
import { NotificationBell as Bell } from '@/modules/notifications/components/NotificationBell';

/** Campana del header tenant — conectada al Centro de Notificaciones. */
export function NotificationBell() {
  return (
    <Bell
      centerPath="/notifications"
      queryKeyPrefix="notifications"
      fetchList={fetchNotifications}
      fetchCount={fetchUnreadCount}
      markRead={markNotificationRead}
      markAllRead={markAllNotificationsRead}
    />
  );
}
