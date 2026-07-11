import api from '@/services/api';
import type { ApiResponse } from '@/api/types';

export interface DashboardKpis {
  entriesToday: number;
  exitsToday: number;
  vehiclesInside: number;
  openTickets: number;
  closedTicketsToday: number;
  ticketsTotal: number;
  revenueToday: number;
  revenueMonth: number;
  vehiclesWithMembership: number;
  membershipsActive: number;
  membershipsExpiring: number;
  membershipsExpired?: number;
  membershipRevenue?: number;
  occasionalVehiclesInside: number;
  cashRegistersOpen: number;
  cashRegistersClosedToday: number;
  cashOpen: number;
  cashClosed: number;
  activeCashiers: number;
  occupancy: { current: number; max: number; percent: number } | null;
  timezone: string;
  asOf: string;
}

export interface DashboardCharts {
  incomeByDay: { date: string; total: number; count: number }[];
  incomeByHour: { hour: string; total: number }[];
  incomeByMonth: { month: string; total: number; count: number }[];
  ticketsByHour: { hour: string; count: number }[];
  vehiclesByCategory: { categoryId: string; name: string; color?: string; count: number }[];
  paymentMethods: { method: string; total: number; count: number }[];
  revenueEvolution: { date: string; total: number; cumulative: number }[];
  membershipsActive: { count: number };
  occupancy: {
    current: number;
    max: number | null;
    percent: number | null;
    history: { date: string; entries: number }[];
  };
  timezone: string;
}

export interface ReportColumn {
  key: string;
  label: string;
}

export interface ReportFilters {
  from?: string;
  to?: string;
  vehicleCategoryId?: string;
  status?: string;
  cashRegisterId?: string;
  userId?: string;
  paymentMethod?: string;
  memberId?: string;
  membershipScope?: string;
  page?: number;
  limit?: number;
}

export interface ReportCatalogItem {
  type: string;
  category: string;
  label: string;
  description: string;
}

export interface ReportResult {
  reportType: string;
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  pagination: { page: number; limit: number; totalRecords: number; totalPages: number };
}

export type ReportType =
  | 'tickets'
  | 'vehicles'
  | 'members'
  | 'memberships'
  | 'membership-payments'
  | 'frequent-vehicles'
  | 'frequent-members'
  | 'payments'
  | 'cash-registers'
  | 'users'
  | 'audit';

export async function getDashboardKpis(): Promise<ApiResponse<{ kpis: DashboardKpis }>> {
  const { data } = await api.get('/reports/dashboard/kpis');
  return data;
}

export async function getDashboardCharts(
  days = 30,
): Promise<ApiResponse<{ charts: DashboardCharts }>> {
  const { data } = await api.get('/reports/dashboard/charts', { params: { days } });
  return data;
}

export async function getReportFilterOptions(): Promise<
  ApiResponse<{
    options: {
      vehicleCategories: { id: string; name: string }[];
      cashRegisters: { id: string; label: string; status: string }[];
      users: { id: string; name: string; email: string }[];
      ticketStatuses: string[];
      membershipScopes: { id: string; label: string }[];
      userStatuses: string[];
      paymentMethods: string[];
    };
  }>
> {
  const { data } = await api.get('/reports/meta/filters');
  return data;
}

export async function getAllowedReports(): Promise<
  ApiResponse<{
    reports: string[];
    catalog: ReportCatalogItem[];
    byCategory: { category: string; reports: ReportCatalogItem[] }[];
  }>
> {
  const { data } = await api.get('/reports/meta/allowed');
  return data;
}

export async function fetchReport(
  type: ReportType,
  filters: ReportFilters,
): Promise<
  ApiResponse<{
    reportType: string;
    columns: ReportColumn[];
    rows: Record<string, unknown>[];
    pagination: ReportResult['pagination'];
  }>
> {
  const { data } = await api.get(`/reports/${type}`, { params: filters });
  return data;
}

export async function exportReport(
  type: ReportType,
  format: 'csv' | 'xlsx' | 'pdf',
  filters: ReportFilters,
): Promise<Blob> {
  const response = await api.get(`/reports/${type}/export`, {
    params: { ...filters, format },
    responseType: 'blob',
  });
  return response.data;
}
