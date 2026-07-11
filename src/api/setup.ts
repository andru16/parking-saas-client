import api from '@/services/api';
import type { ApiResponse } from '@/api/types';

export type SetupStepKey =
  'general_info' | 'operational' | 'vehicle_categories' | 'rates' | 'cash_point' | 'summary';

export interface SetupProgress {
  isSetupComplete: boolean;
  currentStep: SetupStepKey;
  completedSteps: string[];
  lastSavedAt: string | null;
  steps: Array<{ key: SetupStepKey; order: number; label: string; completed: boolean }>;
}

export interface GeneralInfoData {
  commercialName: string;
  legalName: string;
  taxId: string;
  address: string;
  city: string;
  stateOrDepartment: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logo: { url: string | null; path: string | null; uploadedAt: string | null };
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h' | '';
}

export interface OperationalData {
  openTime: string;
  closeTime: string;
  operate24Hours: boolean;
  allowOvercapacity: boolean;
  graceMinutes: number | null;
  maxCapacity: number | null;
}

export interface RateItem {
  id?: string;
  name: string;
  vehicleCategoryId: string;
  contextType: string;
  billingMode: string;
  value: number;
  baseTimeMinutes?: number;
  graceMinutes?: number;
  minFractionMinutes?: number;
  fractionPrice?: number;
  maxDailyCharge?: number;
  windowStart?: string;
  windowEnd?: string;
  status: 'active' | 'inactive';
}

export interface VehicleCategoryItem {
  id?: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  displayOrder: number;
  isActive: boolean;
  inUse?: boolean;
  requirements: {
    requiresPlate: boolean;
    requiresOwner: boolean;
    requiresPhoto: boolean;
    requiresNotes: boolean;
  };
}

export interface CashPointItem {
  id?: string;
  name: string;
  status: 'active' | 'inactive';
  displayOrder: number;
}

export async function getSetupProgress(): Promise<ApiResponse<{ progress: SetupProgress }>> {
  const { data } = await api.get<ApiResponse<{ progress: SetupProgress }>>('/setup/progress');
  return data;
}

export async function getSetupStep<T>(stepKey: SetupStepKey): Promise<
  ApiResponse<{
    step: SetupStepKey;
    data: T;
    progress: SetupProgress;
  }>
> {
  const { data } = await api.get(`/setup/steps/${stepKey}`);
  return data;
}

export async function saveSetupStep<T>(
  stepKey: SetupStepKey,
  payload: unknown,
): Promise<
  ApiResponse<{
    step: SetupStepKey;
    data: T;
    progress: SetupProgress;
  }>
> {
  const { data } = await api.put(`/setup/steps/${stepKey}`, payload);
  return data;
}

export async function getSetupSummary(): Promise<
  ApiResponse<{ sections: Record<string, unknown>; progress: SetupProgress }>
> {
  const { data } = await api.get('/setup/summary');
  return data;
}

export async function completeSetup(): Promise<
  ApiResponse<{ isSetupComplete: boolean; redirectTo: string }>
> {
  const { data } = await api.post('/setup/complete');
  return data;
}
