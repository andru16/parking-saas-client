import api from '@/services/api';
import type { ApiResponse } from '@/api/types';

export interface CashPoint {
  id: string;
  name: string;
  status: string;
  displayOrder: number;
}

export interface CashRegisterSession {
  id: string;
  status: 'open' | 'closed';
  openedAt: string;
  closedAt: string | null;
  openingAmount: number;
  openingNotes: string | null;
  closingAmount: number | null;
  calculatedAmount: number;
  difference: number | null;
  notes: string | null;
  cashPoint: { id: string; name: string; status: string } | null;
  user: { id: string; firstName: string; lastName: string; email: string } | null;
  closingSummary: {
    totalCollected: number;
    totalsByMethod: Record<string, number>;
    ticketsPaid: number;
    ticketsMembership: number;
    ticketsFree: number;
    ticketsClosed: number;
    incomeByHour: { hour: string; total: number }[];
  } | null;
}

export interface CashRegisterSummary {
  sessionId: string;
  openingAmount: number;
  openedAt: string;
  totalCollected: number;
  totalsByMethod: Record<string, number>;
  ticketsPaid: number;
  ticketsMembership: number;
  ticketsFree: number;
  ticketsClosed: number;
  openTickets: number;
  closedTickets: number;
  vehiclesServed: number;
  paymentsCount: number;
  incomeByHour: { hour: string; total: number }[];
}

export async function listCashPoints(): Promise<ApiResponse<{ cashPoints: CashPoint[] }>> {
  const { data } = await api.get('/cash-registers/meta/cash-points');
  return data;
}

export async function getCurrentCashRegister(): Promise<
  ApiResponse<{ session: CashRegisterSession | null }>
> {
  const { data } = await api.get('/cash-registers/current');
  return data;
}

export async function getCashRegisterSummary(): Promise<
  ApiResponse<{ summary: CashRegisterSummary }>
> {
  const { data } = await api.get('/cash-registers/current/summary');
  return data;
}

export async function openCashRegister(payload: {
  cashPointId?: string;
  openingAmount?: number;
  openingNotes?: string;
}): Promise<ApiResponse<{ session: CashRegisterSession }>> {
  const { data } = await api.post('/cash-registers/open', payload);
  return data;
}

export async function closeCashRegister(payload: {
  closingAmount: number;
  notes?: string;
  confirmed: boolean;
}): Promise<ApiResponse<{ session: CashRegisterSession }>> {
  const { data } = await api.post('/cash-registers/close', payload);
  return data;
}

export async function listCashRegisterHistory(page = 1): Promise<
  ApiResponse<{
    sessions: CashRegisterSession[];
    pagination: { page: number; limit: number; totalRecords: number; totalPages: number };
  }>
> {
  const { data } = await api.get('/cash-registers/history', { params: { page } });
  return data;
}

export async function getCashRegisterById(id: string): Promise<
  ApiResponse<{ session: CashRegisterSession }>
> {
  const { data } = await api.get(`/cash-registers/${id}`);
  return data;
}
