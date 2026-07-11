import { PLATFORM_PERMISSIONS } from '@/modules/superAdmin/permissions';

export interface SuperAdminNavItem {
  id: string;
  label: string;
  path: string;
  permissions: string[];
}

/** Menú exclusivo del backoffice — no reutiliza nav del cliente. */
export const SUPER_ADMIN_NAV: SuperAdminNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/admin',
    permissions: [PLATFORM_PERMISSIONS.DASHBOARD_VIEW],
  },
  {
    id: 'organizations',
    label: 'Organizaciones',
    path: '/admin/organizations',
    permissions: [PLATFORM_PERMISSIONS.ORGS_VIEW],
  },
  {
    id: 'subscriptions',
    label: 'Suscripciones',
    path: '/admin/subscriptions',
    permissions: [PLATFORM_PERMISSIONS.ORGS_VIEW, PLATFORM_PERMISSIONS.DASHBOARD_VIEW],
  },
  {
    id: 'audit',
    label: 'Auditoría',
    path: '/admin/audit',
    permissions: [PLATFORM_PERMISSIONS.AUDIT_VIEW],
  },
  {
    id: 'notifications',
    label: 'Notificaciones',
    path: '/admin/notifications',
    permissions: [PLATFORM_PERMISSIONS.NOTIFICATIONS_VIEW],
  },
  {
    id: 'support',
    label: 'Centro de Soporte',
    path: '/admin/support',
    permissions: [PLATFORM_PERMISSIONS.SUPPORT_MANAGE],
  },
  {
    id: 'plans',
    label: 'Planes',
    path: '/admin/plans',
    permissions: [PLATFORM_PERMISSIONS.PLANS_VIEW, PLATFORM_PERMISSIONS.PLANS_MANAGE],
  },
  {
    id: 'backups',
    label: 'Backups',
    path: '/admin/backups',
    permissions: [PLATFORM_PERMISSIONS.BACKUPS_VIEW, PLATFORM_PERMISSIONS.BACKUPS_MANAGE],
  },
  {
    id: 'system-settings',
    label: 'Configuración global',
    path: '/admin/system-settings',
    permissions: [PLATFORM_PERMISSIONS.SETTINGS_MANAGE],
  },
];

export function filterSuperAdminNav(permissions: string[] | null | undefined) {
  if (!permissions?.length) return [];
  if (permissions.includes('*')) return SUPER_ADMIN_NAV;
  return SUPER_ADMIN_NAV.filter((item) =>
    item.permissions.some((p) => permissions.includes(p)),
  );
}
