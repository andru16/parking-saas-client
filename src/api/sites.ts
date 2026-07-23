import api from '@/services/api';
import type { ApiResponse } from '@/api/types';

export interface SiteItem {
  id: string;
  name: string;
  code: string | null;
  address: string | null;
  city: string | null;
  isPrimary: boolean;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface SitesListData {
  sites: SiteItem[];
  limits: { maxSites: number | null };
  canCreateMore: boolean;
}

export async function listSites(): Promise<ApiResponse<SitesListData>> {
  const { data } = await api.get<ApiResponse<SitesListData>>('/sites');
  return data;
}

export async function createSite(payload: {
  name: string;
  code?: string | null;
  address?: string | null;
  city?: string | null;
  status?: 'active' | 'inactive';
}): Promise<ApiResponse<{ site: SiteItem }>> {
  const { data } = await api.post<ApiResponse<{ site: SiteItem }>>('/sites', payload);
  return data;
}

export async function updateSite(
  siteId: string,
  payload: Partial<{
    name: string;
    code: string | null;
    address: string | null;
    city: string | null;
    status: 'active' | 'inactive';
  }>,
): Promise<ApiResponse<{ site: SiteItem }>> {
  const { data } = await api.put<ApiResponse<{ site: SiteItem }>>(`/sites/${siteId}`, payload);
  return data;
}
