import axios from 'axios';
import { adminTokenStorage } from '@/modules/superAdmin/adminTokenStorage';

declare module 'axios' {
  interface AxiosRequestConfig {
    _adminRetry?: boolean;
    _skipAdminRefresh?: boolean;
  }
}

const SKIP = ['/admin/auth/login', '/admin/auth/refresh', '/admin/auth/logout'];

export const adminApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

adminApi.interceptors.request.use((config) => {
  const token = adminTokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAdminToken(): Promise<string | null> {
  try {
    const { data } = await adminApi.post(
      '/admin/auth/refresh',
      null,
      { _skipAdminRefresh: true } as never,
    );
    const token = data?.data?.accessToken as string | undefined;
    if (token) {
      adminTokenStorage.set(token);
      return token;
    }
  } catch {
    adminTokenStorage.clear();
  }
  return null;
}

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const url = original?.url as string | undefined;

    if (
      error.response?.status === 401 &&
      original &&
      !original._adminRetry &&
      !original._skipAdminRefresh &&
      url &&
      !SKIP.some((p) => url.includes(p))
    ) {
      original._adminRetry = true;
      refreshPromise ??= refreshAdminToken().finally(() => {
        refreshPromise = null;
      });
      const token = await refreshPromise;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return adminApi(original);
      }
    }

    return Promise.reject(error);
  },
);
