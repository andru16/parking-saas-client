import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { listPaymentMethods } from '@/api/payments';
import { collectTicket, getExitPreview } from '@/api/tickets';
import { cashKeys } from '@/modules/cash/hooks/useCashRegister';
import { operationsKeys } from '@/modules/operations/hooks/useOperations';

export const paymentKeys = {
  methods: () => ['payment-methods'] as const,
  exitPreview: (ticketId: string) => ['exit-preview', ticketId] as const,
};

export function usePaymentMethods() {
  return useQuery({
    queryKey: paymentKeys.methods(),
    queryFn: async () => {
      const res = await listPaymentMethods();
      return res.data.methods;
    },
  });
}

export function useExitPreview(ticketId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: paymentKeys.exitPreview(ticketId ?? ''),
    queryFn: async () => {
      const res = await getExitPreview(ticketId!);
      return res.data.preview;
    },
    enabled: enabled && Boolean(ticketId),
  });
}

export function useCollectTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, payments }: { ticketId: string; payments: { method: string; amount: number; reference?: string }[] }) =>
      collectTicket(ticketId, payments),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: operationsKeys.openTickets() });
      qc.invalidateQueries({ queryKey: operationsKeys.all });
      qc.invalidateQueries({ queryKey: cashKeys.summary() });
    },
  });
}
