import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  cancelTicket,
  getTicketVehicleHistory,
  listOpenTickets,
  listVehicleCategories,
  lookupByPlate,
  openTicketEntry,
} from '@/api/tickets';
import { posRealtime } from '@/modules/operations/posRealtime';

export const operationsKeys = {
  all: ['operations'] as const,
  openTickets: () => [...operationsKeys.all, 'open-tickets'] as const,
  lookup: (plate: string) => [...operationsKeys.all, 'lookup', plate] as const,
  categories: () => [...operationsKeys.all, 'categories'] as const,
  history: (ticketId: string) => [...operationsKeys.all, 'history', ticketId] as const,
};

export function useOpenTickets() {
  return useQuery({
    queryKey: operationsKeys.openTickets(),
    queryFn: async () => {
      const res = await listOpenTickets();
      return res.data.tickets;
    },
    refetchInterval: posRealtime.pollIntervalMs,
  });
}

export function usePlateLookup(plate: string, enabled: boolean) {
  return useQuery({
    queryKey: operationsKeys.lookup(plate),
    queryFn: async () => {
      const res = await lookupByPlate(plate);
      return res.data;
    },
    enabled: enabled && plate.trim().length >= 2,
    staleTime: 0,
  });
}

export function useVehicleCategories() {
  return useQuery({
    queryKey: operationsKeys.categories(),
    queryFn: async () => {
      const res = await listVehicleCategories();
      return res.data.categories;
    },
  });
}

export function useTicketHistory(ticketId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: operationsKeys.history(ticketId ?? ''),
    queryFn: async () => {
      const res = await getTicketVehicleHistory(ticketId!, 10);
      return res.data.history;
    },
    enabled: enabled && Boolean(ticketId),
  });
}

export function useOpenTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: openTicketEntry,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: operationsKeys.openTickets() });
      posRealtime.emit({ type: 'ticket:opened', ticketId: res.data.ticket.id });
      posRealtime.emit({ type: 'tickets:changed' });
    },
  });
}

export function useCancelTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => cancelTicket(id, reason),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: operationsKeys.openTickets() });
      posRealtime.emit({ type: 'ticket:cancelled', ticketId: res.data.ticket.id });
      posRealtime.emit({ type: 'tickets:changed' });
    },
  });
}
