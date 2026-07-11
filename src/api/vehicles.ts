import api from '@/services/api';
import type { ApiResponse } from '@/api/types';

export interface VehicleListItem {
  _id: string;
  plate: string;
  status: 'active' | 'inactive';
  presence: 'inside' | 'outside';
  currentEntryAt?: string | null;
  notes?: string | null;
  vehicleCategoryId?: { _id: string; name?: string; color?: string; icon?: string } | null;
  memberId?: { _id: string; name?: string; documentNumber?: string; phone?: string } | null;
  updatedAt?: string;
}

export interface VehicleStats {
  totalEntries: number;
  totalCollected: number;
  averageStayMinutes: number | null;
  lastEntryAt: string | null;
  lastExitAt: string | null;
  hasActiveMembership: boolean;
}

export interface VehicleDetail {
  vehicle: VehicleListItem & {
    photoUrl?: string | null;
  };
  stats: VehicleStats;
  activeMembership: Record<string, unknown> | null;
  owner: {
    _id: string;
    name: string;
    documentNumber?: string;
    phone?: string;
    email?: string;
    address?: string;
  } | null;
  history: Array<{
    _id: string;
    status: string;
    entryAt: string;
    exitAt?: string | null;
    total?: number;
    durationMinutes?: number | null;
    coveredByMembership?: boolean;
  }>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export async function listVehicles(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  presence?: string;
}): Promise<ApiResponse<{ items: VehicleListItem[]; pagination: Pagination }>> {
  const { data } = await api.get('/vehicles', { params });
  return data;
}

export async function getVehicle(id: string): Promise<ApiResponse<VehicleDetail>> {
  const { data } = await api.get(`/vehicles/${id}`);
  return data;
}

export async function updateVehicle(
  id: string,
  payload: {
    notes?: string | null;
    status?: 'active' | 'inactive';
    memberId?: string | null;
    vehicleCategoryId?: string;
  },
): Promise<ApiResponse<VehicleDetail>> {
  const { data } = await api.patch(`/vehicles/${id}`, payload);
  return data;
}

export async function listFrequentVehicles(params?: {
  days?: number;
  limit?: number;
}): Promise<
  ApiResponse<{
    items: Array<{ vehicleId: string; plate: string; entries: number; lastEntryAt: string }>;
  }>
> {
  const { data } = await api.get('/vehicles/frequent', { params });
  return data;
}
