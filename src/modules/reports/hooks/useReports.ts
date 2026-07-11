import { useMutation, useQuery } from '@tanstack/react-query';
import {
  exportReport,
  fetchReport,
  getAllowedReports,
  getReportFilterOptions,
  type ReportFilters,
  type ReportType,
} from '@/api/reports';

export const reportKeys = {
  all: ['reports'] as const,
  allowed: () => [...reportKeys.all, 'allowed'] as const,
  filters: () => [...reportKeys.all, 'filter-options'] as const,
  data: (type: ReportType, filters: ReportFilters) =>
    [...reportKeys.all, type, filters] as const,
};

export function useAllowedReports() {
  return useQuery({
    queryKey: reportKeys.allowed(),
    queryFn: async () => {
      const res = await getAllowedReports();
      return res.data;
    },
  });
}

export function useReportFilterOptions() {
  return useQuery({
    queryKey: reportKeys.filters(),
    queryFn: async () => {
      const res = await getReportFilterOptions();
      return res.data.options;
    },
  });
}

export function useReport(type: ReportType, filters: ReportFilters, enabled: boolean) {
  return useQuery({
    queryKey: reportKeys.data(type, filters),
    queryFn: async () => {
      const res = await fetchReport(type, filters);
      return res.data;
    },
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({
      type,
      format,
      filters,
    }: {
      type: ReportType;
      format: 'csv' | 'xlsx' | 'pdf';
      filters: ReportFilters;
    }) => exportReport(type, format, filters),
  });
}
