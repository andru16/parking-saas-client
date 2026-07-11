import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listPaymentHistory, listPaymentMethods } from '@/api/payments';
import {
  createMembershipPayment,
  listMembershipPayments,
} from '@/api/parkingMemberships';
import { membershipKeys } from '@/modules/memberships/hooks/useMemberships';
import { memberKeys } from '@/modules/members/hooks/useMembers';

export const orgPaymentKeys = {
  all: ['org-payments'] as const,
  methods: () => [...orgPaymentKeys.all, 'methods'] as const,
  membershipPayments: (params: object) =>
    [...orgPaymentKeys.all, 'membership-payments', params] as const,
  history: (params: object) => [...orgPaymentKeys.all, 'history', params] as const,
};

export function useOrgPaymentMethods() {
  return useQuery({
    queryKey: orgPaymentKeys.methods(),
    queryFn: async () => (await listPaymentMethods()).data.methods.filter((m) => m.enabled),
  });
}

export function useOrgMembershipPayments(params: { page?: number; memberId?: string }) {
  return useQuery({
    queryKey: orgPaymentKeys.membershipPayments(params),
    queryFn: async () => (await listMembershipPayments({ ...params, limit: 15 })).data,
  });
}

export function useOrgPaymentHistory(params: {
  page?: number;
  source?: 'all' | 'tickets' | 'memberships';
}) {
  return useQuery({
    queryKey: orgPaymentKeys.history(params),
    queryFn: async () => (await listPaymentHistory({ ...params, limit: 20 })).data,
  });
}

export function useCreateOrgMembershipPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      memberId: string;
      vehicleId?: string | null;
      parkingMembershipId?: string | null;
      amount: number;
      method: string;
      paidAt?: string;
      notes?: string | null;
      kind?: 'new' | 'renewal' | 'other';
    }) => createMembershipPayment(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orgPaymentKeys.all });
      void qc.invalidateQueries({ queryKey: membershipKeys.all });
      void qc.invalidateQueries({ queryKey: memberKeys.all });
    },
  });
}
