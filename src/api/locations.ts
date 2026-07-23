import api from '@/services/api';
import type { ApiResponse } from '@/api/types';

export interface LocationCountry {
  code: string;
  name: string;
}

export interface LocationDepartment {
  id: number;
  name: string;
}

export interface LocationCity {
  id: number;
  name: string;
  departmentId: number;
}

export async function listCountries(): Promise<LocationCountry[]> {
  const { data } = await api.get<ApiResponse<{ countries: LocationCountry[] }>>(
    '/public/locations/countries',
  );
  return data.data.countries;
}

export async function listDepartments(country: string): Promise<{
  departments: LocationDepartment[];
  catalogDriven: boolean;
}> {
  const { data } = await api.get<
    ApiResponse<{ departments: LocationDepartment[]; catalogDriven: boolean; country: string }>
  >('/public/locations/departments', { params: { country } });
  return {
    departments: data.data.departments,
    catalogDriven: data.data.catalogDriven,
  };
}

export async function listCities(departmentId: number): Promise<LocationCity[]> {
  const { data } = await api.get<ApiResponse<{ cities: LocationCity[]; departmentId: number }>>(
    '/public/locations/cities',
    { params: { departmentId } },
  );
  return data.data.cities;
}
