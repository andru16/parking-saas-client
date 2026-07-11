import type { SettingsSectionKey } from '@/api/settings';
import { PERMISSIONS } from '@/modules/auth/permissions';

export interface SettingsSectionDef {
  id: string;
  apiKey: SettingsSectionKey;
  label: string;
  path: string;
  description: string;
  permissions: string[];
  /** Pestaña visual del Centro de Configuración */
  tab: SettingsTabId;
  /** Feature del plan requerida (opcional) */
  featureFlag?: string;
}

export type SettingsTabId =
  | 'general'
  | 'operation'
  | 'vehicles'
  | 'rates'
  | 'cash'
  | 'printing'
  | 'security'
  | 'more';

export const SETTINGS_TABS: { id: SettingsTabId; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'operation', label: 'Operación' },
  { id: 'vehicles', label: 'Vehículos' },
  { id: 'rates', label: 'Tarifas' },
  { id: 'cash', label: 'Caja' },
  { id: 'printing', label: 'Impresión' },
  { id: 'security', label: 'Seguridad' },
  { id: 'more', label: 'Más' },
];

export const SETTINGS_SECTIONS: SettingsSectionDef[] = [
  {
    id: 'general',
    apiKey: 'general',
    label: 'Información del negocio',
    path: '/settings/general',
    description: 'Nombre comercial, NIT, contacto, zona horaria y moneda.',
    permissions: [PERMISSIONS.SETTINGS_MANAGE],
    tab: 'general',
    featureFlag: 'settings',
  },
  {
    id: 'operational',
    apiKey: 'operational',
    label: 'Operación',
    path: '/settings/operational',
    description: 'Horarios, capacidad, sobrecupo y tiempo de gracia.',
    permissions: [PERMISSIONS.SETTINGS_MANAGE],
    tab: 'operation',
    featureFlag: 'settings',
  },
  {
    id: 'categories',
    apiKey: 'vehicle_categories',
    label: 'Tipos de vehículos',
    path: '/settings/categories',
    description: 'Crear, editar, activar o desactivar tipos (moto, carro, etc.).',
    permissions: [PERMISSIONS.SETTINGS_MANAGE],
    tab: 'vehicles',
    featureFlag: 'vehicles',
  },
  {
    id: 'rates',
    apiKey: 'rates',
    label: 'Tarifas',
    path: '/settings/rates',
    description: 'Tarifas por tipo, fracciones, nocturnas y especiales.',
    permissions: [PERMISSIONS.SETTINGS_MANAGE],
    tab: 'rates',
    featureFlag: 'settings',
  },
  {
    id: 'cash',
    apiKey: 'cash',
    label: 'Caja',
    path: '/settings/cash',
    description: 'Puntos de caja, terminales y políticas.',
    permissions: [PERMISSIONS.SETTINGS_MANAGE],
    tab: 'cash',
    featureFlag: 'cash',
  },
  {
    id: 'payment-methods',
    apiKey: 'payment_methods',
    label: 'Formas de pago',
    path: '/settings/payment-methods',
    description: 'Métodos habilitados, moneda e impuestos asociados.',
    permissions: [PERMISSIONS.SETTINGS_MANAGE],
    tab: 'cash',
    featureFlag: 'payments',
  },
  {
    id: 'printing',
    apiKey: 'printing',
    label: 'Impresión',
    path: '/settings/printing',
    description: 'Nombre en ticket, mensajes, logo y QR (preparado).',
    permissions: [PERMISSIONS.SETTINGS_MANAGE],
    tab: 'printing',
    featureFlag: 'printing',
  },
  {
    id: 'users',
    apiKey: 'users',
    label: 'Usuarios',
    path: '/settings/users',
    description: 'Usuarios del parqueadero.',
    permissions: [PERMISSIONS.USERS_MANAGE],
    tab: 'security',
  },
  {
    id: 'roles',
    apiKey: 'users',
    label: 'Roles y permisos',
    path: '/settings/roles',
    description: 'Roles RBAC y permisos por módulo.',
    permissions: [PERMISSIONS.ROLES_MANAGE],
    tab: 'security',
  },
  {
    id: 'memberships',
    apiKey: 'memberships',
    label: 'Membresías',
    path: '/settings/memberships',
    description: 'Planes, duraciones y recordatorios.',
    permissions: [PERMISSIONS.SETTINGS_MANAGE],
    tab: 'more',
    featureFlag: 'memberships',
  },
  {
    id: 'integrations',
    apiKey: 'integrations',
    label: 'Integraciones',
    path: '/settings/integrations',
    description: 'WhatsApp, correo, QR, lectores y API.',
    permissions: [PERMISSIONS.SETTINGS_MANAGE],
    tab: 'more',
    featureFlag: 'integrations',
  },
  {
    id: 'backups',
    apiKey: 'backups',
    label: 'Backups',
    path: '/settings/backups',
    description: 'Copias de seguridad y recuperación.',
    permissions: [PERMISSIONS.BACKUPS_VIEW, PERMISSIONS.BACKUPS_MANAGE],
    tab: 'more',
    featureFlag: 'settings',
  },
];

export function filterSettingsSections(
  userPermissions: string[] | null | undefined,
  planFeatures?: Record<string, boolean> | null,
) {
  if (!userPermissions?.length) return [];
  const byPerm =
    userPermissions.includes('*')
      ? SETTINGS_SECTIONS
      : SETTINGS_SECTIONS.filter((section) =>
          section.permissions.some((p) => userPermissions.includes(p)),
        );

  if (!planFeatures) return byPerm;

  return byPerm.filter((section) => {
    if (!section.featureFlag) return true;
    return planFeatures[section.featureFlag] !== false;
  });
}

export function sectionsForTab(
  tab: SettingsTabId,
  sections: SettingsSectionDef[],
): SettingsSectionDef[] {
  return sections.filter((s) => s.tab === tab);
}
