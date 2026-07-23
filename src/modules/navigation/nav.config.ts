import { PERMISSIONS } from '@/modules/auth/permissions';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  ClipboardCheck,
  Wallet,
  Users,
  Ticket,
  CreditCard,
  BarChart3,
  FileSearch,
  Settings,
  LifeBuoy,
  Package,
  Receipt,
  Building2,
  Bell,
  Contact,
  Code2,
} from 'lucide-react';

/** Badge automático mientras `comingSoon` sea true. */
export const COMING_SOON_BADGE = 'Próximamente';

export type NavGroupId =
  | 'general'
  | 'operations'
  | 'clients'
  | 'management'
  | 'admin'
  /** Slots reservados — no visibles hasta activar `enabled`. */
  | 'future';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  /** Al menos uno de estos permisos otorga acceso. */
  permissions: string[];
  icon: LucideIcon;
  /** Muestra badge "Próximamente"; desaparece al quitar el flag. */
  comingSoon?: boolean;
  /** Feature del plan SaaS (`plan.features[key] !== false`). */
  featureFlag?: string;
  /**
   * Ítems futuros: solo se muestran si `enabled === true`.
   * Por defecto ausente = visible (módulo actual).
   */
  enabled?: boolean;
}

export interface NavGroup {
  id: NavGroupId;
  label: string;
  /** Preparado para colapsar categorías en el futuro. */
  collapsible?: boolean;
  defaultExpanded?: boolean;
  items: NavItem[];
}

/**
 * Menú principal agrupado por flujo de trabajo.
 * Orden: Dashboard → Operación → Clientes → Gestión → Administración.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'general',
    label: 'General',
    collapsible: true,
    defaultExpanded: true,
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        permissions: [PERMISSIONS.DASHBOARD_VIEW],
        icon: LayoutDashboard,
        featureFlag: 'dashboard',
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operación',
    collapsible: true,
    defaultExpanded: true,
    items: [
      {
        id: 'operations',
        label: 'Centro de Operaciones',
        path: '/operations',
        permissions: [PERMISSIONS.TICKETS_CREATE, PERMISSIONS.TICKETS_CLOSE],
        icon: ClipboardCheck,
        featureFlag: 'tickets',
      },
      {
        id: 'cash',
        label: 'Caja',
        path: '/cash',
        permissions: [PERMISSIONS.CASH_VIEW, PERMISSIONS.CASH_OPEN],
        icon: Wallet,
        featureFlag: 'cash',
      },
    ],
  },
  {
    id: 'clients',
    label: 'Clientes',
    collapsible: true,
    defaultExpanded: true,
    items: [
      {
        id: 'members',
        label: 'Clientes',
        path: '/members',
        permissions: [PERMISSIONS.MEMBERS_MANAGE],
        icon: Users,
        featureFlag: 'memberships',
      },
      {
        id: 'memberships',
        label: 'Mensualidades',
        path: '/memberships',
        permissions: [PERMISSIONS.MEMBERSHIPS_MANAGE],
        icon: Ticket,
        featureFlag: 'memberships',
      },
    ],
  },
  {
    id: 'management',
    label: 'Gestión',
    collapsible: true,
    defaultExpanded: true,
    items: [
      {
        id: 'reports',
        label: 'Centro de Reportes',
        path: '/reports',
        permissions: [PERMISSIONS.REPORTS_VIEW],
        icon: BarChart3,
        featureFlag: 'reports',
      },
      {
        id: 'audit',
        label: 'Auditoría',
        path: '/audit',
        permissions: [PERMISSIONS.AUDIT_VIEW],
        icon: FileSearch,
        featureFlag: 'audit',
      },
      {
        id: 'payments',
        label: 'Pagos',
        path: '/payments',
        permissions: [PERMISSIONS.PAYMENTS_VIEW],
        icon: CreditCard,
        featureFlag: 'payments',
      },
    ],
  },
  {
    id: 'admin',
    label: 'Administración',
    collapsible: true,
    defaultExpanded: true,
    items: [
      {
        id: 'settings',
        label: 'Configuración',
        path: '/settings',
        permissions: [
          PERMISSIONS.SETTINGS_MANAGE,
          PERMISSIONS.USERS_MANAGE,
          PERMISSIONS.ROLES_MANAGE,
        ],
        icon: Settings,
        featureFlag: 'settings',
      },
      {
        id: 'support',
        label: 'Centro de Soporte',
        path: '/support',
        permissions: [PERMISSIONS.SUPPORT_VIEW],
        icon: LifeBuoy,
      },
    ],
  },
  {
    id: 'future',
    label: 'Más módulos',
    collapsible: true,
    defaultExpanded: false,
    items: [
      {
        id: 'inventory',
        label: 'Inventario',
        path: '/inventory',
        permissions: [PERMISSIONS.SETTINGS_MANAGE],
        icon: Package,
        enabled: false,
        comingSoon: true,
      },
      {
        id: 'einvoicing',
        label: 'Facturación electrónica',
        path: '/invoicing',
        permissions: [PERMISSIONS.SETTINGS_MANAGE],
        icon: Receipt,
        enabled: false,
        comingSoon: true,
      },
      {
        id: 'multi-site',
        label: 'Multi-sede',
        path: '/sites',
        permissions: [PERMISSIONS.SETTINGS_MANAGE],
        icon: Building2,
        enabled: true,
        comingSoon: false,
        featureFlag: 'multi_site',
      },
      {
        id: 'api',
        label: 'API',
        path: '/developer/api',
        permissions: [PERMISSIONS.SETTINGS_MANAGE],
        icon: Code2,
        enabled: false,
        comingSoon: true,
        featureFlag: 'api',
      },
      {
        id: 'notifications-center',
        label: 'Notificaciones',
        path: '/notifications',
        permissions: [PERMISSIONS.DASHBOARD_VIEW],
        icon: Bell,
        enabled: false,
        comingSoon: true,
        featureFlag: 'notifications',
      },
      {
        id: 'crm',
        label: 'CRM',
        path: '/crm',
        permissions: [PERMISSIONS.MEMBERS_MANAGE],
        icon: Contact,
        enabled: false,
        comingSoon: true,
      },
    ],
  },
];

/** Lista plana (compat / tests). */
export const MAIN_NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items).filter(
  (item) => item.enabled !== false,
);

export interface QuickActionDef {
  id: string;
  label: string;
  to: string;
  permissions: string[];
  tone?: 'primary' | 'neutral' | 'warning';
}

/** Accesos rápidos del Dashboard — configurables desde un solo lugar. */
export const QUICK_ACTIONS: QuickActionDef[] = [
  {
    id: 'entry',
    label: 'Nuevo ingreso',
    to: '/operations',
    permissions: [PERMISSIONS.TICKETS_CREATE],
    tone: 'primary',
  },
  {
    id: 'search',
    label: 'Buscar vehículo',
    to: '/operations',
    permissions: [PERMISSIONS.TICKETS_CREATE, PERMISSIONS.TICKETS_CLOSE],
  },
  {
    id: 'collect',
    label: 'Cobrar ticket',
    to: '/operations',
    permissions: [PERMISSIONS.TICKETS_CLOSE, PERMISSIONS.PAYMENTS_COLLECT],
  },
  {
    id: 'open-cash',
    label: 'Abrir caja',
    to: '/cash',
    permissions: [PERMISSIONS.CASH_OPEN],
    tone: 'warning',
  },
  {
    id: 'close-cash',
    label: 'Cerrar caja',
    to: '/cash',
    permissions: [PERMISSIONS.CASH_CLOSE],
  },
  {
    id: 'member',
    label: 'Nuevo cliente',
    to: '/members',
    permissions: [PERMISSIONS.MEMBERS_MANAGE],
  },
];

function itemAllowed(
  item: NavItem,
  permissions: string[],
  planFeatures?: Record<string, boolean> | null,
): boolean {
  if (item.enabled === false) return false;

  const hasPerm =
    permissions.includes('*') || item.permissions.some((p) => permissions.includes(p));
  if (!hasPerm) return false;

  if (item.featureFlag && planFeatures) {
    if (planFeatures[item.featureFlag] === false) return false;
  }

  return true;
}

/**
 * Filtra grupos e ítems por permisos + plan features.
 * Omite grupos vacíos (incl. "future" hasta activar slots).
 */
export function filterNavGroups(
  permissions: string[] | null | undefined,
  planFeatures?: Record<string, boolean> | null,
): NavGroup[] {
  if (!permissions?.length) return [];

  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => itemAllowed(item, permissions, planFeatures)),
  })).filter((group) => group.items.length > 0);
}

/** @deprecated Preferir filterNavGroups; se mantiene para tests y callers planos. */
export function filterNavByPermissions(
  permissions: string[] | null | undefined,
  planFeatures?: Record<string, boolean> | null,
): NavItem[] {
  return filterNavGroups(permissions, planFeatures).flatMap((g) => g.items);
}

/** @deprecated Preferir filterNavByPermissions */
export function filterNavByRole(_roleName: string | null | undefined): NavItem[] {
  return [];
}

export function canAccessPath(
  permissions: string[] | null | undefined,
  path: string,
): boolean {
  const item = MAIN_NAV.find((n) => path === n.path || path.startsWith(`${n.path}/`));
  if (!item) return true;
  if (!permissions?.length) return false;
  if (permissions.includes('*')) return true;
  return item.permissions.some((p) => permissions.includes(p));
}

export function findNavItemByPath(path: string): NavItem | undefined {
  return MAIN_NAV.find((n) => path === n.path || path.startsWith(`${n.path}/`));
}

export function findNavGroupByPath(path: string): NavGroup | undefined {
  return NAV_GROUPS.find((g) =>
    g.items.some((n) => n.enabled !== false && (path === n.path || path.startsWith(`${n.path}/`))),
  );
}

export const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/operations': 'Centro de Operaciones',
  '/members': 'Clientes',
  '/memberships': 'Mensualidades',
  '/cash': 'Caja',
  '/payments': 'Pagos',
  '/reports': 'Centro de Reportes',
  '/audit': 'Auditoría',
  '/support': 'Centro de Soporte',
  '/notifications': 'Notificaciones',
  '/settings': 'Configuración',
  '/sites': 'Sedes',
  '/settings/general': 'Información general',
  '/settings/operational': 'Operación',
  '/settings/categories': 'Categorías',
  '/settings/rates': 'Tarifas',
  '/settings/payment-methods': 'Métodos de pago',
  '/settings/cash': 'Caja',
  '/settings/printing': 'Impresión',
  '/settings/users': 'Usuarios',
  '/settings/roles': 'Roles',
  '/setup': 'Configuración inicial',
  '/bienvenida': 'Bienvenida',
  '/acceso-denegado': 'Acceso denegado',
};
