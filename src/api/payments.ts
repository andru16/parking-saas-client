import api from '@/services/api';
import type { ApiResponse } from '@/api/types';

export interface PaymentMethod {
  code: string;
  label: string;
  enabled: boolean;
  displayOrder: number;
  isSystem: boolean;
}

export interface PaymentItem {
  id: string;
  ticketId: string;
  cashRegisterId: string;
  userId: string;
  amount: number;
  method: string;
  kind: 'charge' | 'reversal';
  status: 'completed' | 'refunded' | 'cancelled';
  reference: string | null;
  reversalOfId: string | null;
  reversalReason: string | null;
  paidAt: string;
}

export interface PaymentHistoryItem {
  id: string;
  source: 'ticket' | 'membership';
  paidAt: string;
  amount: number;
  method: string;
  status: string;
  plate: string | null;
  memberName: string | null;
  receivedBy: string | null;
  reference: string | null;
  notes: string | null;
  kind?: string;
}

export async function listPaymentMethods(): Promise<ApiResponse<{ methods: PaymentMethod[] }>> {
  const { data } = await api.get('/payments/methods');
  return data;
}

export async function listPaymentsByTicket(
  ticketId: string,
): Promise<ApiResponse<{ payments: PaymentItem[] }>> {
  const { data } = await api.get(`/payments/ticket/${ticketId}`);
  return data;
}

export async function listPaymentHistory(params?: {
  page?: number;
  limit?: number;
  source?: 'all' | 'tickets' | 'memberships';
}): Promise<
  ApiResponse<{
    items: PaymentHistoryItem[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>
> {
  const { data } = await api.get('/payments/history', { params });
  return data;
}

export async function reversePayment(
  paymentId: string,
  reason: string,
): Promise<ApiResponse<{ reversal: PaymentItem; original: PaymentItem }>> {
  const { data } = await api.post(`/payments/${paymentId}/reverse`, { reason });
  return data;
}
