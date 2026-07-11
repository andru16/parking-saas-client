/** Permisos de plataforma (alineados con el backend Super Admin). */
export const PLATFORM_PERMISSIONS = {
  DASHBOARD_VIEW: 'platform:dashboard:view',
  ORGS_VIEW: 'platform:organizations:view',
  ORGS_MANAGE: 'platform:organizations:manage',
  ORGS_SUSPEND: 'platform:organizations:suspend',
  ORGS_EXTEND_TRIAL: 'platform:organizations:extend_trial',
  ORGS_CHANGE_PLAN: 'platform:organizations:change_plan',
  PLANS_VIEW: 'platform:plans:view',
  PLANS_MANAGE: 'platform:plans:manage',
  USERS_VIEW: 'platform:users:view',
  AUDIT_VIEW: 'platform:audit:view',
  NOTIFICATIONS_VIEW: 'platform:notifications:view',
  IMPERSONATE: 'platform:impersonate',
  SUPPORT_MANAGE: 'platform:support:manage',
  INCIDENTS_MANAGE: 'platform:incidents:manage',
  BACKUPS_VIEW: 'platform:backups:view',
  BACKUPS_MANAGE: 'platform:backups:manage',
  SETTINGS_MANAGE: 'platform:settings:manage',
} as const;

export function hasPlatformPermission(
  userPermissions: string[] | null | undefined,
  required: string | string[],
): boolean {
  if (!userPermissions?.length) return false;
  if (userPermissions.includes('*')) return true;
  const needed = Array.isArray(required) ? required : [required];
  return needed.some((code) => userPermissions.includes(code));
}
