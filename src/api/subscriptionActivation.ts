import api from '@/services/api';
import type { ApiResponse } from '@/api/types';

export interface ActivationPlanSummary {
  id: string;
  name: string;
  code: string;
  color?: string;
  isTrialPlan?: boolean;
  priceMonthly?: number | null;
  features?: Record<string, boolean>;
  limits?: {
    maxUsers?: number | null;
    maxCashRegisters?: number | null;
    maxSites?: number | null;
  };
}

export interface ActivationWelcomeData {
  organization: {
    id: string;
    name: string;
    status: string;
    city?: string;
    phone?: string;
    email?: string;
  };
  subscription: {
    status: string | null;
    daysRemaining: number;
    endDate: string | null;
    accessMode?: string;
    isTrialPremium?: boolean;
    isAwaitingActivation?: boolean;
    isBlocked?: boolean;
    plan: ActivationPlanSummary | null;
  };
  plan: ActivationPlanSummary | null;
  trialPremiumDays: number;
  support: {
    email: string;
    whatsapp: string;
    schedule: string;
  };
  openActivationRequest?: ActivationRequest | null;
}

export interface ActivationRequestPayload {
  company: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  dailyVehicles?: number | null;
  branches?: number;
  schedule?: string | null;
  comments?: string | null;
}

export interface ActivationRequest {
  id: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  dailyVehicles?: number | null;
  branches?: number;
  schedule?: string | null;
  comments?: string | null;
  status: 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
  statusLabel: string;
  plan?: ActivationPlanSummary | null;
  organization?: { id: string; name: string; city?: string; status?: string } | null;
  adminNotes?: string | null;
  activationStartDate?: string | null;
  activationEndDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchActivationWelcome() {
  const { data } = await api.get<ApiResponse<ActivationWelcomeData>>(
    '/subscription-activation/welcome',
  );
  return data.data;
}

export async function startPremiumTrialRequest() {
  const { data } = await api.post<ApiResponse<{ summary: ActivationWelcomeData['subscription'] }>>(
    '/subscription-activation/start-premium-trial',
  );
  return data;
}

export async function createActivationRequest(payload: ActivationRequestPayload) {
  const { data } = await api.post<ApiResponse<{ request: ActivationRequest }>>(
    '/subscription-activation/requests',
    payload,
  );
  return data;
}

export async function fetchSupportContact() {
  const { data } = await api.get<
    ApiResponse<{ support: { email: string; whatsapp: string; schedule: string } }>
  >('/subscription-activation/support-contact');
  return data.data.support;
}

export async function listMyActivationRequests(params?: { page?: number; limit?: number }) {
  const { data } = await api.get<
    ApiResponse<{
      items: ActivationRequest[];
      pagination: { page: number; limit: number; total: number; pages: number };
    }>
  >('/subscription-activation/requests', { params });
  return data.data;
}
