/** Códigos de permiso alineados con el catálogo del backend. */
export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',
  VEHICLES_VIEW: 'vehicles:view',
  VEHICLES_CREATE: 'vehicles:create',
  VEHICLES_UPDATE: 'vehicles:update',
  VEHICLES_DEACTIVATE: 'vehicles:deactivate',
  TICKETS_CREATE: 'tickets:create',
  TICKETS_CLOSE: 'tickets:close',
  TICKETS_CANCEL: 'tickets:cancel',
  CASH_OPEN: 'cash:open',
  CASH_CLOSE: 'cash:close',
  CASH_VIEW: 'cash:view',
  PAYMENTS_COLLECT: 'payments:collect',
  PAYMENTS_REVERSE: 'payments:reverse',
  PAYMENTS_VIEW: 'payments:view',
  MEMBERS_MANAGE: 'members:manage',
  MEMBERSHIPS_MANAGE: 'memberships:manage',
  REPORTS_VIEW: 'reports:view',
  AUDIT_VIEW: 'audit:view',
  SETTINGS_MANAGE: 'settings:manage',
  USERS_MANAGE: 'users:manage',
  ROLES_MANAGE: 'roles:manage',
  PRINTING_CONFIG: 'printing:config',
  PRINTING_PRINT: 'printing:print',
  PRINTING_REPRINT: 'printing:reprint',
  BACKUPS_VIEW: 'backups:view',
  BACKUPS_MANAGE: 'backups:manage',
  BACKUPS_RESTORE: 'backups:restore',
  SUPPORT_VIEW: 'support:view',
  SUPPORT_CREATE: 'support:create',
  SUPPORT_REPLY: 'support:reply',
  SUPPORT_CLOSE: 'support:close',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS] | '*';

export function hasPermission(
  userPermissions: string[] | null | undefined,
  required: string | string[],
): boolean {
  if (!userPermissions?.length) return false;
  if (userPermissions.includes('*')) return true;
  const needed = Array.isArray(required) ? required : [required];
  return needed.some((code) => userPermissions.includes(code));
}

export function hasAllPermissions(
  userPermissions: string[] | null | undefined,
  required: string[],
): boolean {
  if (!userPermissions?.length) return false;
  if (userPermissions.includes('*')) return true;
  return required.every((code) => userPermissions.includes(code));
}
