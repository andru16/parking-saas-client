/**
 * Resuelve la base URL del API.
 * - Dev: `/api` (proxy Vite)
 * - Prod: URL absoluta que debe terminar en `/api`
 * Si alguien pone solo el host del backend, se añade `/api`.
 */
export function resolveApiBaseUrl(
  raw: string | undefined = import.meta.env.VITE_API_URL,
): string {
  const value = (raw ?? '/api').trim();
  if (!value) return '/api';

  const withoutTrailingSlash = value.replace(/\/+$/, '');

  // Ruta relativa (dev / same-origin)
  if (withoutTrailingSlash.startsWith('/')) {
    return withoutTrailingSlash || '/api';
  }

  // Absolute URL
  try {
    const url = new URL(withoutTrailingSlash);
    const path = url.pathname.replace(/\/+$/, '') || '';
    if (path === '/api' || path.endsWith('/api')) {
      return `${url.origin}${path}`;
    }
    // Host sin /api → lo añadimos
    return `${url.origin}/api`;
  } catch {
    return withoutTrailingSlash;
  }
}
