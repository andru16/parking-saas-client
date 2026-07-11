import axios from 'axios';
import { tokenStorage } from '@/modules/auth/tokenStorage';
import { notifySessionExpired } from '@/modules/auth/authEvents';
import type { ApiResponse } from '@/api/types';
import type { LoginResult } from '@/api/auth';

/** Cliente dedicado para refresh — evita dependencia circular con el interceptor */
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<string | null> | null = null;

/**
 * Renueva el access token usando la cookie HttpOnly de refresh.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const { data } = await refreshClient.post<ApiResponse<LoginResult>>('/auth/refresh');
      const token = data.data.accessToken;
      tokenStorage.set(token);
      return token;
    } catch {
      tokenStorage.clear();
      notifySessionExpired();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
