import axios from 'axios';
import { tokenStorage } from '@/modules/auth/tokenStorage';
import { refreshAccessToken } from '@/modules/auth/authSession';
import { resolveApiBaseUrl } from '@/services/resolveApiBaseUrl';

declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
    _skipAuthRefresh?: boolean;
  }
}

const AUTH_SKIP_PATHS = ['/auth/login', '/auth/refresh', '/auth/logout'];

function shouldAttemptRefresh(url?: string, config?: { _skipAuthRefresh?: boolean }): boolean {
  if (config?._skipAuthRefresh) return false;
  if (!url) return false;
  return !AUTH_SKIP_PATHS.some((path) => url.includes(path));
}

const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      shouldAttemptRefresh(originalRequest.url, originalRequest)
    ) {
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();

      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
