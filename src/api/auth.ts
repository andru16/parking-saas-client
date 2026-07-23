import api from '@/services/api';
import type { ApiResponse } from '@/api/types';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: string;
  emailVerified: boolean;
  lastLoginAt?: string | null;
  passwordResetRequired?: boolean;
  role: {
    key?: string | null;
    name: string;
    displayName: string;
    isPlatformRole: boolean;
    id?: string | null;
  } | null;
  permissions: string[];
  organization: {
    id: string;
    name: string;
    status: string;
    city: string;
    country: string;
    isSetupComplete: boolean;
    setupProgress?: {
      currentStep: string;
      completedSteps: string[];
      lastSavedAt: string | null;
    };
    subscription?: {
      hasSubscription: boolean;
      plan: {
        id: string;
        name: string;
        code: string;
        color?: string;
        isTrialPlan?: boolean;
        features?: Record<string, boolean>;
        limits?: {
          maxUsers?: number | null;
          maxCashRegisters?: number | null;
          maxSites?: number | null;
          maxActiveVehicles?: number | null;
          maxDailyTickets?: number | null;
        };
      } | null;
      status: string | null;
      billingCycle: string | null;
      startDate: string | null;
      endDate: string | null;
      daysRemaining: number;
      nextRenewalAt: string | null;
      autoRenewal: boolean;
      gracePeriodEndsAt?: string | null;
      accessMode?: 'full' | 'read_only' | 'none' | 'activation_pending' | 'blocked';
      isTrialPremium?: boolean;
      isAwaitingActivation?: boolean;
      isBlocked?: boolean;
    } | null;
  } | null;
}

export interface LoginPayload {
  email: string;
  password: string;
  /** Honeypot anti-bot — debe ir vacío. */
  website?: string;
  formStartedAt: number;
}

export interface LoginResult {
  accessToken: string;
  expiresIn: string;
  user: AuthUser;
}

export async function loginRequest(payload: LoginPayload): Promise<ApiResponse<LoginResult>> {
  const { data } = await api.post<ApiResponse<LoginResult>>('/auth/login', payload);
  return data;
}

export async function logoutRequest(): Promise<ApiResponse<null>> {
  const { data } = await api.post<ApiResponse<null>>('/auth/logout');
  return data;
}

export async function refreshRequest(): Promise<ApiResponse<LoginResult>> {
  const { data } = await api.post<ApiResponse<LoginResult>>('/auth/refresh', null, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _skipAuthRefresh: true,
  } as any);
  return data;
}

export async function meRequest(): Promise<ApiResponse<{ user: AuthUser }>> {
  const { data } = await api.get<ApiResponse<{ user: AuthUser }>>('/auth/me');
  return data;
}
