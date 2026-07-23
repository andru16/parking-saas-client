import api from '@/services/api';
import type { ApiResponse } from '@/api/types';
import type {
  GeneralInfoData,
  OperationalData,
  RateItem,
  VehicleCategoryItem,
} from '@/api/setup';

export type SettingsSectionKey =
  | 'general'
  | 'operational'
  | 'vehicle_categories'
  | 'rates'
  | 'payment_methods'
  | 'cash'
  | 'printing'
  | 'memberships'
  | 'users'
  | 'integrations'
  | 'backups';

export interface SettingsSectionMeta {
  key: SettingsSectionKey;
  label: string;
  description: string;
}

export interface PaymentMethodConfig {
  code: string;
  label: string;
  enabled: boolean;
  displayOrder: number;
  isSystem: boolean;
}

export interface CashPointConfig {
  id?: string;
  name: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  siteId?: string | null;
}

export interface CashPolicies {
  suggestedOpeningFloat: number;
  requireOpeningFloat: boolean;
  requireClosingCount: boolean;
  allowMultipleOpenSessions: boolean;
}

export interface CashTerminal {
  name: string;
  code: string;
  status: 'active' | 'inactive';
}

export interface PrintingConfig {
  showLogo: boolean;
  showParkingName: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showTaxId: boolean;
  logoUrl: string | null;
  businessName?: string;
  businessTaxId?: string;
  businessAddress?: string;
  businessCity?: string;
  businessPhone?: string;
  header: string;
  footer: string;
  welcomeMessage: string;
  farewellMessage: string;
  lostTicketPolicy: string;
  paperSize: '58mm' | '80mm' | 'A4';
  copies: number;
  enableQr: boolean;
  enableBarcode: boolean;
  /** Imprimir ticket al registrar ingreso. */
  generateEntryTicket?: boolean;
  /** Imprimir ticket de salida al cobrar (desactivar si solo usan el de ingreso). */
  generateExitTicket?: boolean;
  preferredAdapter?: 'browser' | 'escpos' | 'pdf' | 'text' | 'bluetooth' | 'lan' | 'usb';
  customMessages: {
    entry: string;
    exit: string;
    receipt: string;
    cash?: string;
    membership?: string;
  };
}

export interface MembershipPlanConfig {
  id?: string;
  name: string;
  durationDays: number;
  price: number;
  benefits: string[];
  reminderDaysBefore: number;
  isActive: boolean;
}

export interface OrgUserConfig {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  role: { id: string; name: string; displayName: string } | null;
  createdAt?: string;
}

export interface OrgRoleConfig {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
}

export interface IntegrationsConfig {
  whatsapp: { enabled: boolean; phoneNumber: string | null; notes: string };
  email: { enabled: boolean; fromAddress: string | null };
  qr: { enabled: boolean };
  plateReaders: { enabled: boolean; provider: string | null };
  barriers: { enabled: boolean; provider: string | null };
  api: { enabled: boolean; webhookUrl: string | null };
}

export type SettingsSectionDataMap = {
  general: GeneralInfoData;
  operational: OperationalData;
  vehicle_categories: { categories: (VehicleCategoryItem & { inUse?: boolean })[] };
  rates: { rates: RateItem[]; categories: { _id: string; name: string; color?: string }[] };
  payment_methods: { methods: PaymentMethodConfig[] };
  cash: {
    cashPoints: CashPointConfig[];
    policies: CashPolicies;
    terminals: CashTerminal[];
  };
  printing: PrintingConfig;
  memberships: { plans: MembershipPlanConfig[] };
  users: { users: OrgUserConfig[]; roles: OrgRoleConfig[] };
  integrations: { integrations: IntegrationsConfig };
  backups: Record<string, unknown>;
};

export async function listSettingsSections(): Promise<
  ApiResponse<{ sections: SettingsSectionMeta[] }>
> {
  const { data } = await api.get('/settings');
  return data;
}

export async function getSettingsSection<K extends SettingsSectionKey>(
  sectionKey: K,
): Promise<
  ApiResponse<{
    section: SettingsSectionMeta;
    data: SettingsSectionDataMap[K];
  }>
> {
  const { data } = await api.get(`/settings/sections/${sectionKey}`);
  return data;
}

export async function saveSettingsSection<K extends SettingsSectionKey>(
  sectionKey: K,
  payload: unknown,
): Promise<
  ApiResponse<{
    section: SettingsSectionMeta;
    data: SettingsSectionDataMap[K];
  }>
> {
  const { data } = await api.put(`/settings/sections/${sectionKey}`, payload);
  return data;
}
