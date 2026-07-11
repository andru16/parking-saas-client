import api from '@/services/api';

export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

export const getHealth = async (): Promise<HealthResponse> => {
  const { data } = await api.get<HealthResponse>('/health');
  return data;
};
