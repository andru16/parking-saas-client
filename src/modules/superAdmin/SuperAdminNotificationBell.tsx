import {
  fetchAdminNotifications,
  fetchAdminUnreadCount,
  markAdminAllNotificationsRead,
  markAdminNotificationRead,
} from '@/modules/superAdmin/notificationsApi';
import { NotificationBell } from '@/modules/notifications/components/NotificationBell';

export function SuperAdminNotificationBell() {
  return (
    <NotificationBell
      centerPath="/admin/notifications"
      queryKeyPrefix="admin-notifications"
      fetchList={fetchAdminNotifications}
      fetchCount={fetchAdminUnreadCount}
      markRead={markAdminNotificationRead}
      markAllRead={markAdminAllNotificationsRead}
    />
  );
}
