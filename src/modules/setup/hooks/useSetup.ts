import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  completeSetup,
  getSetupProgress,
  getSetupStep,
  getSetupSummary,
  saveSetupStep,
  type SetupStepKey,
} from '@/api/setup';

export const setupKeys = {
  all: ['setup'] as const,
  progress: () => [...setupKeys.all, 'progress'] as const,
  step: (key: SetupStepKey) => [...setupKeys.all, 'step', key] as const,
  summary: () => [...setupKeys.all, 'summary'] as const,
};

export function useSetupProgress() {
  return useQuery({
    queryKey: setupKeys.progress(),
    queryFn: async () => {
      const response = await getSetupProgress();
      return response.data.progress;
    },
  });
}

export function useSetupStepData<T>(stepKey: SetupStepKey, enabled = true) {
  return useQuery({
    queryKey: setupKeys.step(stepKey),
    queryFn: async () => {
      const response = await getSetupStep<T>(stepKey);
      return response.data;
    },
    enabled,
    staleTime: 30_000,
  });
}

export function useSaveSetupStep<T>(stepKey: SetupStepKey) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: unknown) => saveSetupStep<T>(stepKey, payload),
    onSuccess: (response) => {
      // Actualiza caché sin forzar remount del formulario (evita parpadeo de navegación).
      queryClient.setQueryData(setupKeys.step(stepKey), response.data);
      if (response.data.progress) {
        queryClient.setQueryData(setupKeys.progress(), response.data.progress);
      }
      queryClient.invalidateQueries({ queryKey: setupKeys.summary() });
    },
  });
}

export function useSetupSummary(enabled = false) {
  return useQuery({
    queryKey: setupKeys.summary(),
    queryFn: async () => {
      const response = await getSetupSummary();
      return response.data;
    },
    enabled,
  });
}

export function useCompleteSetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeSetup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: setupKeys.all });
    },
  });
}
