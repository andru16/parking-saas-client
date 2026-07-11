import api from '@/services/api';
import type { ApiResponse } from '@/api/types';

export interface OrgRole {
  id: string;
  key: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  isSystem: boolean;
  usersCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrgUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  lastLoginAt: string | null;
  passwordResetRequired?: boolean;
  role: { id: string; key: string; name: string; isActive?: boolean } | null;
  createdAt?: string;
}

export interface PermissionModule {
  key: string;
  label: string;
  permissions: { code: string; label: string }[];
}

export async function listOrgUsers(): Promise<ApiResponse<{ users: OrgUser[] }>> {
  const { data } = await api.get('/users');
  return data;
}

export async function createOrgUser(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  organizationRoleId: string;
  password?: string;
  status?: string;
}): Promise<ApiResponse<{ user: OrgUser; temporaryPassword?: string }>> {
  const { data } = await api.post('/users', payload);
  return data;
}

export async function updateOrgUser(
  userId: string,
  payload: Partial<{
    firstName: string;
    lastName: string;
    phone: string | null;
    organizationRoleId: string;
    status: string;
  }>,
): Promise<ApiResponse<{ user: OrgUser }>> {
  const { data } = await api.put(`/users/${userId}`, payload);
  return data;
}

export async function resetOrgUserPassword(
  userId: string,
): Promise<ApiResponse<{ temporaryPassword: string; userId: string }>> {
  const { data } = await api.post(`/users/${userId}/reset-password`);
  return data;
}

export async function listOrgRoles(): Promise<ApiResponse<{ roles: OrgRole[] }>> {
  const { data } = await api.get('/users/roles');
  return data;
}

export async function createOrgRole(payload: {
  name: string;
  key?: string;
  description?: string;
  permissions?: string[];
}): Promise<ApiResponse<{ role: OrgRole }>> {
  const { data } = await api.post('/users/roles', payload);
  return data;
}

export async function updateOrgRole(
  roleId: string,
  payload: Partial<{
    name: string;
    description: string;
    permissions: string[];
    isActive: boolean;
  }>,
): Promise<ApiResponse<{ role: OrgRole }>> {
  const { data } = await api.put(`/users/roles/${roleId}`, payload);
  return data;
}

export async function duplicateOrgRole(roleId: string): Promise<ApiResponse<{ role: OrgRole }>> {
  const { data } = await api.post(`/users/roles/${roleId}/duplicate`);
  return data;
}

export async function deleteOrgRole(roleId: string): Promise<ApiResponse<{ deleted: boolean }>> {
  const { data } = await api.delete(`/users/roles/${roleId}`);
  return data;
}

export async function getPermissionCatalog(): Promise<
  ApiResponse<{ modules: PermissionModule[] }>
> {
  const { data } = await api.get('/users/permissions/catalog');
  return data;
}
