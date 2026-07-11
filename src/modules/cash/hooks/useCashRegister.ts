import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  closeCashRegister,
  getCashRegisterSummary,
  getCurrentCashRegister,
  listCashPoints,
  listCashRegisterHistory,
  openCashRegister,
} from '@/api/cashRegisters';

export const cashKeys = {
  all: ['cash'] as const,
  current: () => [...cashKeys.all, 'current'] as const,
  summary: () => [...cashKeys.all, 'summary'] as const,
  points: () => [...cashKeys.all, 'points'] as const,
  history: (page: number) => [...cashKeys.all, 'history', page] as const,
};

export function useCashPoints() {
  return useQuery({
    queryKey: cashKeys.points(),
    queryFn: async () => {
      const res = await listCashPoints();
      return res.data.cashPoints;
    },
  });
}

export function useCurrentCashRegister() {
  return useQuery({
    queryKey: cashKeys.current(),
    queryFn: async () => {
      const res = await getCurrentCashRegister();
      return res.data.session;
    },
  });
}

export function useCashRegisterSummary(enabled: boolean) {
  return useQuery({
    queryKey: cashKeys.summary(),
    queryFn: async () => {
      const res = await getCashRegisterSummary();
      return res.data.summary;
    },
    enabled,
    refetchInterval: enabled ? 15_000 : false,
  });
}

export function useCashRegisterHistory(page = 1) {
  return useQuery({
    queryKey: cashKeys.history(page),
    queryFn: async () => {
      const res = await listCashRegisterHistory(page);
      return res.data;
    },
  });
}

export function useOpenCashRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: openCashRegister,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cashKeys.all });
    },
  });
}

export function useCloseCashRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: closeCashRegister,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: cashKeys.all });
    },
  });
}
