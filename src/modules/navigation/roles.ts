/** Roles / keys de rol (compat + plataforma). */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ORGANIZATION_ADMIN: 'organization_admin',
  /** Key RBAC del rol Administrador de org */
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  CASHIER: 'cashier',
} as const;

export type AppRole = (typeof ROLES)[keyof typeof ROLES] | string;

export const ALL_ORG_ROLES: AppRole[] = [
  ROLES.ORGANIZATION_ADMIN,
  ROLES.ADMIN,
  ROLES.SUPERVISOR,
  ROLES.CASHIER,
];

export const ADMIN_ROLES: AppRole[] = [ROLES.SUPER_ADMIN, ROLES.ORGANIZATION_ADMIN, ROLES.ADMIN];

export const OPS_ROLES: AppRole[] = [
  ROLES.ORGANIZATION_ADMIN,
  ROLES.ADMIN,
  ROLES.SUPERVISOR,
  ROLES.CASHIER,
];

export const REPORT_ROLES: AppRole[] = [
  ROLES.SUPER_ADMIN,
  ROLES.ORGANIZATION_ADMIN,
  ROLES.ADMIN,
  ROLES.SUPERVISOR,
  ROLES.CASHIER,
];

const ROLE_ALIASES: Record<string, string[]> = {
  admin: ['admin', 'organization_admin'],
  organization_admin: ['admin', 'organization_admin'],
  supervisor: ['supervisor'],
  cashier: ['cashier'],
  super_admin: ['super_admin'],
};

export function hasRole(userRole: string | null | undefined, allowed: AppRole[]): boolean {
  if (!userRole) return false;
  if (userRole === ROLES.SUPER_ADMIN) return allowed.includes(ROLES.SUPER_ADMIN);
  const aliases = ROLE_ALIASES[userRole] ?? [userRole];
  return allowed.some((a) => aliases.includes(a) || a === userRole);
}
