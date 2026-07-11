import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSupportTicket,
  getSupportMeta,
  getSupportTicket,
  listSupportTickets,
  replySupportTicket,
  updateSupportTicketStatus,
  type SupportCategory,
  type SupportPriority,
  type SupportStatus,
} from '@/api/support';

export const supportKeys = {
  all: ['support'] as const,
  meta: () => [...supportKeys.all, 'meta'] as const,
  list: (params: object) => [...supportKeys.all, 'list', params] as const,
  detail: (id: string) => [...supportKeys.all, 'detail', id] as const,
};

export function useSupportMeta() {
  return useQuery({
    queryKey: supportKeys.meta(),
    queryFn: async () => (await getSupportMeta()).data.meta,
  });
}

export function useSupportList(params: {
  page?: number;
  status?: string;
  priority?: string;
  search?: string;
}) {
  return useQuery({
    queryKey: supportKeys.list(params),
    queryFn: async () => (await listSupportTickets({ ...params, limit: 15 })).data,
  });
}

export function useSupportDetail(id: string | undefined) {
  return useQuery({
    queryKey: supportKeys.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => (await getSupportTicket(id!)).data,
  });
}

export function useCreateSupportTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      subject: string;
      description: string;
      category: SupportCategory;
      priority?: SupportPriority;
    }) => createSupportTicket(payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: supportKeys.all }),
  });
}

export function useReplySupport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => replySupportTicket(id, body),
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: supportKeys.detail(vars.id) });
      void qc.invalidateQueries({ queryKey: supportKeys.all });
    },
  });
}

export function useUpdateSupportStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SupportStatus }) =>
      updateSupportTicketStatus(id, status),
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: supportKeys.detail(vars.id) });
      void qc.invalidateQueries({ queryKey: supportKeys.all });
    },
  });
}
