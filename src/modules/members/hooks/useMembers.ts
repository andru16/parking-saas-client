import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createMember,
  getMember,
  linkMemberVehicle,
  listMembers,
  unlinkMemberVehicle,
  updateMember,
  type MemberPayload,
} from '@/api/members';
import { vehicleKeys } from '@/modules/vehicles/hooks/useVehicles';

export const memberKeys = {
  all: ['members'] as const,
  list: (params: object) => [...memberKeys.all, 'list', params] as const,
  detail: (id: string) => [...memberKeys.all, 'detail', id] as const,
};

export function useMembersList(params: { page?: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: memberKeys.list(params),
    queryFn: async () => (await listMembers({ ...params, limit: 15 })).data,
  });
}

export function useMemberDetail(id: string | undefined) {
  return useQuery({
    queryKey: memberKeys.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => (await getMember(id!)).data,
  });
}

export function useCreateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: MemberPayload) => createMember(payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: memberKeys.all }),
  });
}

export function useUpdateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<MemberPayload> }) =>
      updateMember(id, payload),
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: memberKeys.detail(vars.id) });
      void qc.invalidateQueries({ queryKey: memberKeys.all });
    },
  });
}

export function useLinkMemberVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, vehicleId }: { memberId: string; vehicleId: string }) =>
      linkMemberVehicle(memberId, vehicleId),
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: memberKeys.detail(vars.memberId) });
      void qc.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}

export function useUnlinkMemberVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, vehicleId }: { memberId: string; vehicleId: string }) =>
      unlinkMemberVehicle(memberId, vehicleId),
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: memberKeys.detail(vars.memberId) });
      void qc.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}
