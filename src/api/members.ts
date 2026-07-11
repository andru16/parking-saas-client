import api from '@/services/api';
import type { ApiResponse } from '@/api/types';
import type { Pagination } from '@/api/vehicles';

export interface Member {
  _id: string;
  memberType: 'person' | 'company';
  name: string;
  documentType?: string;
  documentNumber?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive';
  notes?: string | null;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberDetail {
  member: Member;
  vehicles: Array<{
    _id: string;
    plate: string;
    status: string;
    vehicleCategoryId?: { name?: string; color?: string } | null;
  }>;
  memberships: Array<{
    _id: string;
    name: string;
    status: string;
    startDate: string;
    endDate: string;
    amount?: number;
    vehicleId?: { plate?: string } | null;
  }>;
  payments: Array<{
    _id: string;
    amount: number;
    method: string;
    paidAt: string;
    notes?: string | null;
    vehicleId?: { plate?: string } | null;
    receivedByUserId?: { firstName?: string; lastName?: string } | null;
  }>;
  entries: Array<{
    _id: string;
    status: string;
    entryAt: string;
    exitAt?: string | null;
    total?: number;
    coveredByMembership?: boolean;
    vehicleId?: { plate?: string } | null;
  }>;
}

export type MemberPayload = {
  name: string;
  memberType?: 'person' | 'company';
  documentType?: string;
  documentNumber?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  status?: 'active' | 'inactive';
  notes?: string | null;
};

export async function listMembers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<ApiResponse<{ items: Member[]; pagination: Pagination }>> {
  const { data } = await api.get('/members', { params });
  return data;
}

export async function getMember(memberId: string): Promise<ApiResponse<MemberDetail>> {
  const { data } = await api.get(`/members/${memberId}`);
  return data;
}

export async function createMember(
  payload: MemberPayload,
): Promise<ApiResponse<{ member: Member }>> {
  const { data } = await api.post('/members', payload);
  return data;
}

export async function updateMember(
  memberId: string,
  payload: Partial<MemberPayload>,
): Promise<ApiResponse<{ member: Member }>> {
  const { data } = await api.put(`/members/${memberId}`, payload);
  return data;
}

export async function linkMemberVehicle(
  memberId: string,
  vehicleId: string,
): Promise<ApiResponse<{ vehicle: { _id: string; plate: string } }>> {
  const { data } = await api.post(`/members/${memberId}/vehicles`, { vehicleId });
  return data;
}

export async function unlinkMemberVehicle(
  memberId: string,
  vehicleId: string,
): Promise<ApiResponse<{ vehicle: { _id: string } }>> {
  const { data } = await api.delete(`/members/${memberId}/vehicles/${vehicleId}`);
  return data;
}
