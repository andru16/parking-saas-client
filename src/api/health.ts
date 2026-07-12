import api from '@/services/api';
import type { ApiResponse } from '@/api/types';

export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

export const getHealth = async (): Promise<HealthResponse> => {
  const { data } = await api.get<ApiResponse<{ status: string }>>('/health');
  return {
    status: data.data?.status ?? 'ok',
    message: data.message ?? 'API operativa',
    timestamp: data.timestamp,
  };
};
