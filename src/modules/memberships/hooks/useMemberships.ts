import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changeMembershipStatus,
  createMembership,
  createMembershipPayment,
  getMembership,
  listMembershipPayments,
  listMemberships,
  renewMembership,
  updateMembership,
  type MembershipPayload,
  type MembershipStatus,
} from '@/api/parkingMemberships';
import { memberKeys } from '@/modules/members/hooks/useMembers';

export const membershipKeys = {
  all: ['memberships'] as const,
  list: (params: object) => [...membershipKeys.all, 'list', params] as const,
  detail: (id: string) => [...membershipKeys.all, 'detail', id] as const,
  payments: (params: object) => [...membershipKeys.all, 'payments', params] as const,
};

export function useMembershipsList(params: { page?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: membershipKeys.list(params),
    queryFn: async () => (await listMemberships({ ...params, limit: 15 })).data,
  });
}

export function useMembershipDetail(id: string | undefined) {
  return useQuery({
    queryKey: membershipKeys.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => (await getMembership(id!)).data,
  });
}

export function useMembershipPaymentsList(params: { page?: number; memberId?: string }) {
  return useQuery({
    queryKey: membershipKeys.payments(params),
    queryFn: async () => (await listMembershipPayments({ ...params, limit: 15 })).data,
  });
}

export function useCreateMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MembershipPayload) => createMembership(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: membershipKeys.all });
      void qc.invalidateQueries({ queryKey: memberKeys.all });
    },
  });
}

export function useUpdateMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<Omit<MembershipPayload, 'memberId' | 'vehicleId'>>;
    }) => updateMembership(id, payload),
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: membershipKeys.detail(vars.id) });
      void qc.invalidateQueries({ queryKey: membershipKeys.all });
    },
  });
}

export function useChangeMembershipStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: MembershipStatus }) =>
      changeMembershipStatus(id, status),
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: membershipKeys.detail(vars.id) });
      void qc.invalidateQueries({ queryKey: membershipKeys.all });
    },
  });
}

export function useRenewMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload?: {
        days?: number;
        amount?: number;
        method?: string;
        recordPayment?: boolean;
        notes?: string;
      };
    }) => renewMembership(id, payload),
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: membershipKeys.detail(vars.id) });
      void qc.invalidateQueries({ queryKey: membershipKeys.all });
      void qc.invalidateQueries({ queryKey: membershipKeys.payments({}) });
    },
  });
}

export function useCreateMembershipPayment() {
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
      void qc.invalidateQueries({ queryKey: membershipKeys.payments({}) });
      void qc.invalidateQueries({ queryKey: membershipKeys.all });
      void qc.invalidateQueries({ queryKey: memberKeys.all });
    },
  });
}
