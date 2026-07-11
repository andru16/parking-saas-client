import api from '@/services/api';
import type { ApiResponse } from '@/api/types';

export interface TicketVehicle {
  id: string;
  plate: string | null;
  memberId: string | null;
  status?: string;
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
    requirements?: {
      requiresPlate: boolean;
      requiresOwner: boolean;
      requiresPhoto: boolean;
      requiresNotes: boolean;
    };
  };
}

export interface TicketMembership {
  id: string;
  name: string;
  status: string;
  startDate?: string;
  endDate?: string;
}

export interface TicketItem {
  id: string;
  status: 'open' | 'closed' | 'cancelled';
  entryAt: string;
  exitAt: string | null;
  durationMinutes: number | null;
  total: number;
  coveredByMembership: boolean;
  calculationBreakdown: Record<string, unknown> | null;
  notes: string | null;
  vehicle: { id: string; plate: string | null; memberId: string | null } | null;
  category: { id: string; name: string; color: string; icon: string } | null;
  membership: { id: string; name: string; endDate: string } | null;
  member: { id: string; name: string; memberType: string } | null;
  entryUser: { id: string; firstName: string; lastName: string } | null;
  exitUser: { id: string; firstName: string; lastName: string } | null;
  cashRegister: {
    id: string;
    status: string | null;
    openedAt: string | null;
    cashPointName: string | null;
  } | null;
  rateSnapshot?: Record<string, unknown> | null;
}

export interface PlateLookupResult {
  found: boolean;
  vehicle: TicketVehicle | null;
  openTicket: TicketItem | null;
  activeMembership: TicketMembership | null;
}

export interface VehicleCategoryOption {
  id: string;
  name: string;
  color: string;
  icon: string;
  requirements: {
    requiresPlate: boolean;
    requiresOwner: boolean;
    requiresPhoto: boolean;
    requiresNotes: boolean;
  };
}

export interface ExitPreview {
  durationMinutes: number;
  total: number;
  calculationBreakdown: Record<string, unknown> | null;
  coveredByMembership: boolean;
  parkingMembershipId: string | null;
  rateSnapshot?: {
    name: string | null;
    billingMode: string | null;
    value: number | null;
  } | null;
  membership: { id: string; name: string; endDate: string } | null;
  requiresPayment: boolean;
}

export interface PaymentLineInput {
  method: string;
  amount: number;
  reference?: string;
}

export async function lookupByPlate(plate: string): Promise<ApiResponse<PlateLookupResult>> {
  const { data } = await api.get<ApiResponse<PlateLookupResult>>('/tickets/lookup', {
    params: { plate },
  });
  return data;
}

export async function listOpenTickets(): Promise<ApiResponse<{ tickets: TicketItem[] }>> {
  const { data } = await api.get<ApiResponse<{ tickets: TicketItem[] }>>('/tickets/open');
  return data;
}

export async function getTicket(id: string): Promise<ApiResponse<{ ticket: TicketItem }>> {
  const { data } = await api.get<ApiResponse<{ ticket: TicketItem }>>(`/tickets/${id}`);
  return data;
}

export async function openTicketEntry(payload: {
  plate?: string;
  vehicleId?: string;
  vehicleCategoryId?: string;
  notes?: string;
}): Promise<ApiResponse<{ ticket: TicketItem }>> {
  const { data } = await api.post<ApiResponse<{ ticket: TicketItem }>>('/tickets/entry', payload);
  return data;
}

export async function getExitPreview(id: string): Promise<ApiResponse<{ preview: ExitPreview }>> {
  const { data } = await api.get<ApiResponse<{ preview: ExitPreview }>>(
    `/tickets/${id}/exit-preview`,
  );
  return data;
}

export async function collectTicket(
  id: string,
  payments: PaymentLineInput[],
): Promise<
  ApiResponse<{
    ticket: TicketItem;
    payments: unknown[];
    preview: ExitPreview;
  }>
> {
  const { data } = await api.post(`/tickets/${id}/collect`, { payments });
  return data;
}

export async function cancelTicket(
  id: string,
  reason?: string,
): Promise<ApiResponse<{ ticket: TicketItem }>> {
  const { data } = await api.post(`/tickets/${id}/cancel`, { reason });
  return data;
}

export async function getTicketVehicleHistory(
  id: string,
  limit = 10,
): Promise<ApiResponse<{ history: TicketItem[] }>> {
  const { data } = await api.get(`/tickets/${id}/history`, { params: { limit } });
  return data;
}

export async function listVehicleCategories(): Promise<
  ApiResponse<{ categories: VehicleCategoryOption[] }>
> {
  const { data } = await api.get<ApiResponse<{ categories: VehicleCategoryOption[] }>>(
    '/tickets/meta/vehicle-categories',
  );
  return data;
}
