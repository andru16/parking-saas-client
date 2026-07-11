import api from '@/services/api';
import type { ApiResponse } from '@/api/types';

export type SupportCategory =
  | 'system_error'
  | 'technical'
  | 'question'
  | 'feature_request'
  | 'billing'
  | 'configuration'
  | 'other';

export type SupportPriority = 'low' | 'medium' | 'high' | 'critical';
export type SupportStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_customer'
  | 'resolved'
  | 'closed';

export interface SupportTicket {
  _id: string;
  number: number;
  numberLabel: string;
  subject: string;
  description: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  organizationId?: string | { _id: string; name?: string };
  createdByUserId?: { firstName?: string; lastName?: string; email?: string };
  assignedToUserId?: { firstName?: string; lastName?: string; email?: string } | null;
  createdAt?: string;
  updatedAt?: string;
  closedAt?: string | null;
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
  messageCount?: number;
}

export interface SupportMessage {
  _id: string;
  body: string;
  authorType: string;
  authorUserId?: { firstName?: string; lastName?: string; email?: string } | null;
  createdAt: string;
  isInternal?: boolean;
}

export interface SupportMeta {
  categories: { id: string; label: string }[];
  priorities: { id: string; label: string }[];
  statuses: { id: string; label: string }[];
}

export async function getSupportMeta(): Promise<ApiResponse<{ meta: SupportMeta }>> {
  const { data } = await api.get('/support/meta');
  return data;
}

export async function listSupportTickets(params?: {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}): Promise<
  ApiResponse<{
    items: SupportTicket[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>
> {
  const { data } = await api.get('/support', { params });
  return data;
}

export async function createSupportTicket(payload: {
  subject: string;
  description: string;
  category: SupportCategory;
  priority?: SupportPriority;
}): Promise<ApiResponse<{ ticket: SupportTicket }>> {
  const { data } = await api.post('/support', payload);
  return data;
}

export async function getSupportTicket(
  id: string,
): Promise<ApiResponse<{ ticket: SupportTicket; messages: SupportMessage[] }>> {
  const { data } = await api.get(`/support/${id}`);
  return data;
}

export async function replySupportTicket(
  id: string,
  body: string,
): Promise<ApiResponse<{ ticket: SupportTicket; message: SupportMessage }>> {
  const { data } = await api.post(`/support/${id}/replies`, { body });
  return data;
}

export async function updateSupportTicketStatus(
  id: string,
  status: SupportStatus,
): Promise<ApiResponse<{ ticket: SupportTicket }>> {
  const { data } = await api.patch(`/support/${id}/status`, { status });
  return data;
}
