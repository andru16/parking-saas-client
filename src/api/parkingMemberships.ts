import api from '@/services/api';
import type { ApiResponse } from '@/api/types';
import type { Pagination } from '@/api/vehicles';

export type MembershipStatus = 'active' | 'expired' | 'suspended' | 'cancelled';
export type MembershipDisplayStatus = MembershipStatus | 'expiring';

export interface ParkingMembership {
  _id: string;
  name: string;
  membershipType?: string;
  startDate: string;
  endDate: string;
  status: MembershipStatus;
  displayStatus?: MembershipDisplayStatus;
  amount?: number;
  autoRenew?: boolean;
  notes?: string | null;
  usageCount?: number;
  lastUsedAt?: string | null;
  memberId?: {
    _id: string;
    name?: string;
    documentNumber?: string;
    phone?: string;
    email?: string;
    status?: string;
  } | null;
  vehicleId?: {
    _id: string;
    plate?: string;
    status?: string;
    vehicleCategoryId?: { name?: string; color?: string } | null;
  } | null;
}

export interface MembershipPayment {
  _id: string;
  amount: number;
  method: string;
  paidAt: string;
  notes?: string | null;
  kind?: 'new' | 'renewal' | 'other';
  memberId?: { _id: string; name?: string; documentNumber?: string } | null;
  vehicleId?: { _id: string; plate?: string } | null;
  parkingMembershipId?: { _id: string; name?: string } | null;
  receivedByUserId?: { firstName?: string; lastName?: string } | null;
}

export type MembershipPayload = {
  memberId?: string;
  vehicleId?: string;
  plate?: string;
  vehicleCategoryId?: string;
  member?: {
    name: string;
    memberType?: 'person' | 'company';
    documentType?: string;
    documentNumber?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: string | null;
    notes?: string | null;
  };
  name?: string;
  membershipType?: string;
  startDate: string;
  endDate: string;
  amount?: number;
  autoRenew?: boolean;
  notes?: string | null;
};

export async function listMemberships(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<ApiResponse<{ items: ParkingMembership[]; pagination: Pagination }>> {
  const { data } = await api.get('/parking-memberships', { params });
  return data;
}

export async function getMembership(
  id: string,
): Promise<ApiResponse<{ membership: ParkingMembership; payments: MembershipPayment[] }>> {
  const { data } = await api.get(`/parking-memberships/${id}`);
  return data;
}

export async function createMembership(
  payload: MembershipPayload,
): Promise<ApiResponse<{ membership: ParkingMembership; payments?: MembershipPayment[] }>> {
  const { data } = await api.post('/parking-memberships', payload);
  return data;
}

export async function updateMembership(
  id: string,
  payload: Partial<Omit<MembershipPayload, 'memberId' | 'vehicleId'>>,
): Promise<ApiResponse<{ membership: ParkingMembership; payments?: MembershipPayment[] }>> {
  const { data } = await api.put(`/parking-memberships/${id}`, payload);
  return data;
}

export async function changeMembershipStatus(
  id: string,
  status: MembershipStatus,
): Promise<ApiResponse<{ membership: ParkingMembership; payments?: MembershipPayment[] }>> {
  const { data } = await api.patch(`/parking-memberships/${id}/status`, { status });
  return data;
}

export async function renewMembership(
  id: string,
  payload?: {
    days?: number;
    amount?: number;
    method?: string;
    recordPayment?: boolean;
    notes?: string;
  },
): Promise<ApiResponse<{ membership: ParkingMembership; payments?: MembershipPayment[]; payment?: MembershipPayment }>> {
  const { data } = await api.post(`/parking-memberships/${id}/renew`, payload ?? {});
  return data;
}

export async function listMembershipPayments(params?: {
  page?: number;
  limit?: number;
  memberId?: string;
}): Promise<ApiResponse<{ items: MembershipPayment[]; pagination: Pagination }>> {
  const { data } = await api.get('/parking-memberships/payments', { params });
  return data;
}

export async function createMembershipPayment(payload: {
  memberId: string;
  vehicleId?: string | null;
  parkingMembershipId?: string | null;
  amount: number;
  method: string;
  paidAt?: string;
  notes?: string | null;
  kind?: 'new' | 'renewal' | 'other';
}): Promise<ApiResponse<{ payment: MembershipPayment }>> {
  const { data } = await api.post('/parking-memberships/payments', payload);
  return data;
}
