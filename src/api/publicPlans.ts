import api from '@/services/api';
import type { ApiResponse } from '@/api/types';

export interface PublicPlan {
  id: string;
  name: string;
  code: string;
  description: string;
  isTrialPlan: boolean;
  isRecommended: boolean;
  currency: string;
  sortOrder: number;
  color: string;
  pricing: {
    monthly: number;
    quarterly: number;
    semiannual: number;
    annual: number;
  };
  billingCycles: Array<{
    cycle: string;
    label: string;
    price: number;
    durationDays: number | null;
    isActive: boolean;
  }>;
  features: string[];
  cta: string;
}

export async function fetchPublicPlans() {
  const { data } = await api.get<
    ApiResponse<{ plans: PublicPlan[]; startingFrom: number; currency: string }>
  >('/public/plans', { _skipAuthRefresh: true });
  return data;
}
