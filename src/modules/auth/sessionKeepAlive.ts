import { refreshAccessToken } from '@/modules/auth/authSession';
import { notifySessionExpired } from '@/modules/auth/authEvents';
import { tokenStorage } from '@/modules/auth/tokenStorage';

/** Renueva el access token cuando queden menos de este margen. */
const REFRESH_BEFORE_MS = 2 * 60 * 1000;

/** Sin actividad en este tiempo → se cierra la sesión. */
const IDLE_TIMEOUT_MS = 60 * 60 * 1000;

/** Intervalo de revisión de actividad / expiración. */
const CHECK_INTERVAL_MS = 30 * 1000;

const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll', 'click'] as const;

function getAccessTokenExpiresAt(token: string): number | null {
  try {
    const segment = token.split('.')[1];
    if (!segment) return null;
    const json = atob(segment.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Mantiene la sesión mientras el usuario interactúa con la app.
 * - Si hay actividad reciente: renueva el access token antes de que expire (15m).
 * - Si no hay actividad durante IDLE_TIMEOUT: cierra la sesión.
 */
export function startSessionKeepAlive(): () => void {
  let lastActivityAt = Date.now();
  let stopped = false;
  let refreshing = false;

  const markActivity = () => {
    lastActivityAt = Date.now();
  };

  const onVisibility = () => {
    if (document.visibilityState === 'visible') {
      markActivity();
      void tick();
    }
  };

  const tick = async () => {
    if (stopped) return;

    const token = tokenStorage.get();
    if (!token) return;

    const now = Date.now();
    const idleFor = now - lastActivityAt;

    if (idleFor >= IDLE_TIMEOUT_MS) {
      tokenStorage.clear();
      notifySessionExpired();
      return;
    }

    const expiresAt = getAccessTokenExpiresAt(token);
    if (!expiresAt) return;

    const remaining = expiresAt - now;
    if (remaining > REFRESH_BEFORE_MS) return;
    if (refreshing) return;

    refreshing = true;
    try {
      // Usuario activo (dentro de la ventana de idle): renovar en silencio de UX
      // pero sí marcar expiración si el refresh falla.
      await refreshAccessToken({ silent: false });
    } finally {
      refreshing = false;
    }
  };

  for (const event of ACTIVITY_EVENTS) {
    window.addEventListener(event, markActivity, { passive: true });
  }
  document.addEventListener('visibilitychange', onVisibility);

  const intervalId = window.setInterval(() => {
    void tick();
  }, CHECK_INTERVAL_MS);

  // Primera pasada al montar sesión autenticada.
  void tick();

  return () => {
    stopped = true;
    window.clearInterval(intervalId);
    for (const event of ACTIVITY_EVENTS) {
      window.removeEventListener(event, markActivity);
    }
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
