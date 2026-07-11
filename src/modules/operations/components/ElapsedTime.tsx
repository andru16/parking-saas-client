import { useEffect, useState } from 'react';

/** Intervalo compartido para relojes de tickets abiertos (evita N timers). */
const TICK_MS = 30_000;
const listeners = new Set<() => void>();
let sharedTimer: ReturnType<typeof setInterval> | null = null;
let sharedNow = Date.now();

function ensureSharedTicker() {
  if (sharedTimer) return;
  sharedTimer = setInterval(() => {
    sharedNow = Date.now();
    listeners.forEach((fn) => fn());
  }, TICK_MS);
}

function releaseSharedTicker(listener: () => void) {
  listeners.delete(listener);
  if (listeners.size === 0 && sharedTimer) {
    clearInterval(sharedTimer);
    sharedTimer = null;
  }
}

function formatElapsed(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/** Tiempo transcurrido desde `from`/`since` — un solo ticker compartido cada 30s. */
export function ElapsedTime({
  from,
  since,
}: {
  from?: string | Date;
  since?: string | Date;
}) {
  const [, setTick] = useState(0);
  const startValue = from ?? since;

  useEffect(() => {
    const listener = () => setTick((n) => n + 1);
    listeners.add(listener);
    ensureSharedTicker();
    return () => releaseSharedTicker(listener);
  }, []);

  if (!startValue) return <span>—</span>;

  const start =
    startValue instanceof Date ? startValue.getTime() : new Date(startValue).getTime();
  const label = formatElapsed(sharedNow - start);

  return <span className="tabular-nums text-slate-600">{label}</span>;
}
