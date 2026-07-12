/**
 * Base URL del API.
 *
 * - Desarrollo (`vite`): siempre `/api` (proxy → localhost:3000). No depende de Vercel.
 * - Producción: URL absoluta del core. Si VITE_API_URL falta, es relativa o es un
 *   placeholder (tu-backend, etc.), usa el core real desplegado.
 */

const PRODUCTION_API_URL = 'https://parking-saas-core.vercel.app/api';

const PLACEHOLDER_MARKERS = [
  'tu-backend',
  'tu-api',
  'your-api',
  'your-backend',
  'mi_backend',
  'mi-backend',
  'example.com',
  'localhost:3000',
];

function isPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => lower.includes(marker));
}

function ensureApiSuffix(absoluteUrl: string): string {
  try {
    const url = new URL(absoluteUrl);
    const path = url.pathname.replace(/\/+$/, '') || '';
    if (path === '/api' || path.endsWith('/api')) {
      return `${url.origin}${path}`;
    }
    return `${url.origin}/api`;
  } catch {
    return absoluteUrl;
  }
}

export function resolveApiBaseUrl(
  raw: string | undefined = import.meta.env.VITE_API_URL,
): string {
  // Local: proxy de Vite. No tocar.
  if (import.meta.env.DEV) {
    const local = (raw ?? '/api').trim().replace(/\/+$/, '');
    if (!local || local.startsWith('/')) return local || '/api';
    // Si alguien pone URL absoluta en .env local, respetarla (tests puntuales)
    if (isPlaceholder(local)) return '/api';
    return ensureApiSuffix(local);
  }

  // Producción / preview build
  const value = (raw ?? '').trim().replace(/\/+$/, '');

  if (!value || value.startsWith('/') || isPlaceholder(value)) {
    return PRODUCTION_API_URL;
  }

  return ensureApiSuffix(value);
}
