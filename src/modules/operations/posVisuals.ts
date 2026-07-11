/**
 * Umbrales visuales del POS — configurables en el futuro vía settings.
 */
export const POS_TIME_THRESHOLDS = {
  /** < 1h */
  shortMinutes: 60,
  /** 1–3h */
  mediumMinutes: 180,
} as const;

export type PosTimeBand = 'short' | 'medium' | 'long';

export function getTimeBand(entryAt: string, now = Date.now()): PosTimeBand {
  const minutes = Math.max(0, Math.floor((now - new Date(entryAt).getTime()) / 60_000));
  if (minutes < POS_TIME_THRESHOLDS.shortMinutes) return 'short';
  if (minutes < POS_TIME_THRESHOLDS.mediumMinutes) return 'medium';
  return 'long';
}

export const TIME_BAND_STYLES: Record<
  PosTimeBand,
  { badge: string; border: string; label: string }
> = {
  short: {
    badge: 'bg-emerald-50 text-emerald-800',
    border: 'border-l-emerald-400',
    label: '< 1h',
  },
  medium: {
    badge: 'bg-amber-50 text-amber-800',
    border: 'border-l-amber-400',
    label: '1–3h',
  },
  long: {
    badge: 'bg-red-50 text-red-800',
    border: 'border-l-red-500',
    label: '> 3h',
  },
};
