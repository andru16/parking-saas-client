import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getVehicle, listVehicles, updateVehicle } from '@/api/vehicles';

export const vehicleKeys = {
  all: ['vehicles'] as const,
  list: (params: object) => [...vehicleKeys.all, 'list', params] as const,
  detail: (id: string) => [...vehicleKeys.all, 'detail', id] as const,
};

export function useVehiclesList(params: {
  page?: number;
  search?: string;
  status?: string;
  presence?: string;
}) {
  return useQuery({
    queryKey: vehicleKeys.list(params),
    queryFn: async () => (await listVehicles({ ...params, limit: 15 })).data,
  });
}

export function useVehicleDetail(id: string | undefined) {
  return useQuery({
    queryKey: vehicleKeys.detail(id ?? ''),
    enabled: Boolean(id),
    queryFn: async () => (await getVehicle(id!)).data,
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        notes?: string | null;
        status?: 'active' | 'inactive';
      };
    }) => updateVehicle(id, payload),
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: vehicleKeys.detail(vars.id) });
      void qc.invalidateQueries({ queryKey: vehicleKeys.all });
    },
  });
}
