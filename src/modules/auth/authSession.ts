import axios from 'axios';
import { tokenStorage } from '@/modules/auth/tokenStorage';
import { notifySessionExpired } from '@/modules/auth/authEvents';
import type { ApiResponse } from '@/api/types';
import type { LoginResult } from '@/api/auth';
import { resolveApiBaseUrl } from '@/services/resolveApiBaseUrl';

/** Cliente dedicado para refresh — evita dependencia circular con el interceptor */
const refreshClient = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise: Promise<string | null> | null = null;

export type RefreshOptions = {
  /**
   * Si es true, un fallo no marca "sesión expirada".
   * Usar en el bootstrap de visitantes sin access token.
   */
  silent?: boolean;
};

/**
 * Renueva el access token usando la cookie HttpOnly de refresh.
 */
export async function refreshAccessToken(options?: RefreshOptions): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const silent = options?.silent === true;

  refreshPromise = (async () => {
    try {
      const { data } = await refreshClient.post<ApiResponse<LoginResult>>('/auth/refresh');
      const token = data.data.accessToken;
      tokenStorage.set(token);
      return token;
    } catch {
      tokenStorage.clear();
      // Solo avisamos expiración cuando había una sesión esperada (no en primeros visits).
      if (!silent) {
        notifySessionExpired();
      }
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
