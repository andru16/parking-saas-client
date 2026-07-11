import { adminApi } from '@/modules/superAdmin/adminApi';
import type { ApiResponse } from '@/api/types';

export interface SuperAdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  lastLoginAt?: string | null;
  role: { name: string; displayName: string; isPlatformRole: boolean };
  permissions: string[];
  realm: string;
}

export interface PlatformMetrics {
  organizations: {
    active: number;
    trial: number;
    suspended: number;
    pendingVerification: number;
    total: number;
  };
  subscriptions: {
    active: number;
    trialsActive: number;
    trialsExpiringSoon: number;
    gracePeriod: number;
    suspended: number;
    expired: number;
    expiringSoon: number;
  };
  newRegistrationsThisMonth: number;
  estimatedMrr: number;
  totalUsers: number;
  totalTicketsProcessed: number;
  generatedAt: string;
  currency: string;
  region: string;
}

export interface OrgListItem {
  id: string;
  name: string;
  email: string | null;
  city: string | null;
  country: string | null;
  status: string;
  isSetupComplete: boolean;
  createdAt: string;
  subscription: {
    endDate: string;
    status?: string;
    planName: string | null;
    planCode: string | null;
  } | null;
}

export interface OrgDetail {
  organization: {
    id: string;
    name: string;
    legalName: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    stateOrDepartment: string | null;
    country: string | null;
    taxId: string | null;
    address: string | null;
    status: string;
    isSetupComplete: boolean;
    createdAt: string;
    updatedAt: string;
  };
  subscription: {
    id: string;
    status: string;
    billingCycle?: string;
    billingCycleLabel?: string;
    startDate: string;
    endDate: string;
    nextRenewalAt?: string;
    amountPaid: number;
    autoRenewal?: boolean;
    plan: {
      id: string;
      name: string;
      code: string;
      price: number;
      durationDays: number;
      pricing?: PlatformPlan['pricing'];
      color?: string;
      isTrialPlan?: boolean;
      isRecommended?: boolean;
    } | null;
  } | null;
  subscriptionHistory?: Array<{
    id: string;
    action: string;
    changeMode?: string | null;
    billingCycle?: string | null;
    notes?: string;
    fromPlan: { id: string; name: string; code: string } | null;
    toPlan: { id: string; name: string; code: string } | null;
    createdAt: string;
  }>;
  stats: {
    usersCount: number;
    vehiclesCount: number;
    ticketsCount: number;
    lastAccessAt: string | null;
    lastAccessUser: { name: string; email: string } | null;
  };
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    status: string;
    lastLoginAt: string | null;
    role: { key: string; name: string } | null;
  }>;
  paymentHistory: { items: unknown[]; prepared: boolean; note: string };
  support: {
    region: string | null;
    locale: string;
    currency: string;
    openIncidents: number;
  };
}

export interface PlatformPlan {
  id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  isTrialPlan: boolean;
  isRecommended?: boolean;
  pricing: {
    monthly: number;
    quarterly: number;
    semiannual: number;
    annual: number;
  };
  billingCycles?: Array<{
    cycle: string;
    label: string;
    price: number;
    durationDays: number | null;
    isActive: boolean;
  }>;
  currency: string;
  sortOrder: number;
  color: string;
  icon: { name: string | null; url: string | null };
  limits: {
    maxUsers: number | null;
    maxCashRegisters: number | null;
    maxSites: number | null;
    maxActiveVehicles: number | null;
    maxDailyTickets: number | null;
  };
  features: Record<string, boolean>;
  defaultDurationDays: number;
  organizationsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanFeatureDef {
  id: string;
  key: string;
  label: string;
  category: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

export type PlanUpsertPayload = {
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
  isTrialPlan?: boolean;
  isRecommended?: boolean;
  currency?: string;
  sortOrder?: number;
  color?: string;
  defaultDurationDays?: number;
  pricing?: PlatformPlan['pricing'];
  billingCycles?: PlatformPlan['billingCycles'];
  limits?: PlatformPlan['limits'];
  features?: Record<string, boolean>;
  icon?: PlatformPlan['icon'];
};

export async function adminLogin(email: string, password: string) {
  const { data } = await adminApi.post<
    ApiResponse<{ accessToken: string; expiresIn: string; user: SuperAdminUser }>
  >('/admin/auth/login', { email, password });
  return data;
}

export async function adminLogout() {
  const { data } = await adminApi.post<ApiResponse<null>>('/admin/auth/logout');
  return data;
}

export async function adminMe() {
  const { data } = await adminApi.get<ApiResponse<{ user: SuperAdminUser }>>('/admin/auth/me');
  return data;
}

export async function fetchAdminDashboard() {
  const { data } = await adminApi.get<ApiResponse<{ metrics: PlatformMetrics }>>(
    '/admin/dashboard',
  );
  return data;
}

export async function fetchAdminOrganizations(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await adminApi.get<
    ApiResponse<{
      organizations: OrgListItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>
  >('/admin/organizations', { params });
  return data;
}

export async function fetchAdminOrganization(id: string) {
  const { data } = await adminApi.get<ApiResponse<OrgDetail>>(`/admin/organizations/${id}`);
  return data;
}

export async function changeAdminOrgStatus(id: string, action: string) {
  const { data } = await adminApi.patch<ApiResponse<{ organization: OrgDetail['organization'] }>>(
    `/admin/organizations/${id}/status`,
    { action },
  );
  return data;
}

export async function extendAdminOrgTrial(id: string, days = 15) {
  const { data } = await adminApi.post(`/admin/organizations/${id}/extend-trial`, { days });
  return data;
}

export async function fetchAdminPlans() {
  const { data } = await adminApi.get<ApiResponse<{ plans: PlatformPlan[] }>>('/admin/plans');
  return data;
}

export async function fetchAdminPlanFeatures() {
  const { data } = await adminApi.get<ApiResponse<{ features: PlanFeatureDef[] }>>(
    '/admin/plans/features',
  );
  return data;
}

export async function fetchAdminPlan(planId: string) {
  const { data } = await adminApi.get<
    ApiResponse<{
      plan: PlatformPlan;
      organizations: Array<{
        id: string;
        name: string;
        email: string | null;
        status: string;
        subscriptionStatus: string;
        billingCycle: string;
        endDate: string;
      }>;
    }>
  >(`/admin/plans/${planId}`);
  return data;
}

export async function createAdminPlan(payload: PlanUpsertPayload) {
  const { data } = await adminApi.post<ApiResponse<{ plan: PlatformPlan }>>(
    '/admin/plans',
    payload,
  );
  return data;
}

export async function updateAdminPlan(planId: string, payload: PlanUpsertPayload) {
  const { data } = await adminApi.put<ApiResponse<{ plan: PlatformPlan }>>(
    `/admin/plans/${planId}`,
    payload,
  );
  return data;
}

export async function setAdminPlanActive(planId: string, isActive: boolean) {
  const { data } = await adminApi.patch<ApiResponse<{ plan: PlatformPlan }>>(
    `/admin/plans/${planId}/status`,
    { isActive },
  );
  return data;
}

export async function duplicateAdminPlan(planId: string) {
  const { data } = await adminApi.post<ApiResponse<{ plan: PlatformPlan }>>(
    `/admin/plans/${planId}/duplicate`,
  );
  return data;
}

export async function changeAdminOrgPlan(
  id: string,
  payload: {
    planId: string;
    billingCycle?: string;
    changeMode?: 'immediate' | 'scheduled';
    scheduledAt?: string;
    notes?: string;
  },
) {
  const { data } = await adminApi.post(`/admin/organizations/${id}/change-plan`, payload);
  return data;
}

export async function requestImpersonation(id: string, reason?: string) {
  const { data } = await adminApi.post(`/admin/organizations/${id}/impersonate`, { reason });
  return data;
}

export type SubscriptionAlertFilter =
  | 'trials_expiring'
  | 'subscriptions_expiring'
  | 'subscriptions_expired'
  | 'suspended'
  | 'grace_period';

export interface SubscriptionAlertItem {
  id: string;
  status: string;
  billingCycle: string;
  startDate: string;
  endDate: string;
  gracePeriodEndsAt: string | null;
  daysRemaining: number;
  graceDaysRemaining: number | null;
  plan: {
    id: string;
    name: string;
    code: string;
    color?: string;
    isTrialPlan?: boolean;
  } | null;
  organization: {
    id: string;
    name: string;
    email: string | null;
    city: string | null;
    status: string;
  } | null;
}

export async function fetchSubscriptionAlerts(params: {
  filter?: SubscriptionAlertFilter;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { data } = await adminApi.get<
    ApiResponse<{
      filter: string;
      counts: {
        trialsExpiring: number;
        subscriptionsExpiring: number;
        expired: number;
        suspended: number;
        gracePeriod: number;
      };
      items: SubscriptionAlertItem[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>
  >('/admin/subscriptions/alerts', { params });
  return data;
}

export async function fetchSchedulerStatus() {
  const { data } = await adminApi.get<
    ApiResponse<{
      scheduler: {
        enabled: boolean;
        cron: string;
        gracePeriodDays: number;
        scheduled: boolean;
        running: boolean;
        lastRun: {
          startedAt: string;
          finishedAt: string;
          summary: Record<string, unknown>;
          source: string;
        } | null;
      };
    }>
  >('/admin/subscriptions/scheduler');
  return data;
}

export async function runSubscriptionScheduler() {
  const { data } = await adminApi.post('/admin/subscriptions/scheduler/run');
  return data;
}
