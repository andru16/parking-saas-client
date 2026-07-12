import { describe, expect, it, vi, afterEach } from 'vitest';

describe('resolveApiBaseUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('en DEV usa /api aunque VITE_API_URL sea placeholder', async () => {
    vi.stubEnv('DEV', true);
    vi.stubEnv('PROD', false);
    vi.stubEnv('VITE_API_URL', 'https://tu-backend.vercel.app');
    const { resolveApiBaseUrl } = await import('./resolveApiBaseUrl');
    expect(resolveApiBaseUrl('https://tu-backend.vercel.app')).toBe('/api');
  });

  it('en PROD reemplaza placeholder por el core real', async () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('PROD', true);
    const { resolveApiBaseUrl } = await import('./resolveApiBaseUrl');
    expect(resolveApiBaseUrl('https://tu-backend.vercel.app')).toBe(
      'https://parking-saas-core.vercel.app/api',
    );
  });

  it('en PROD añade /api si solo viene el host', async () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('PROD', true);
    const { resolveApiBaseUrl } = await import('./resolveApiBaseUrl');
    expect(resolveApiBaseUrl('https://parking-saas-core.vercel.app')).toBe(
      'https://parking-saas-core.vercel.app/api',
    );
  });

  it('en PROD no deja /api relativo (iría al frontend)', async () => {
    vi.stubEnv('DEV', false);
    vi.stubEnv('PROD', true);
    const { resolveApiBaseUrl } = await import('./resolveApiBaseUrl');
    expect(resolveApiBaseUrl('/api')).toBe('https://parking-saas-core.vercel.app/api');
  });
});
