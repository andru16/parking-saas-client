import { useEffect, useRef } from 'react';

/**
 * Autosave con debounce + trailing save.
 * Siempre persiste el valor más reciente al ejecutar (no snapshots viejos en cola),
 * para evitar que un guardado obsoleto borre filas recién agregadas.
 */
export function useDebouncedAutosave<T>(
  value: T,
  onSave: (value: T) => Promise<void>,
  options?: { delayMs?: number; enabled?: boolean },
) {
  const delayMs = options?.delayMs ?? 2000;
  const enabled = options?.enabled ?? true;
  const onSaveRef = useRef(onSave);
  const valueRef = useRef(value);
  const isFirstRender = useRef(true);
  const skipNextRef = useRef(false);
  const chainRef = useRef<Promise<void>>(Promise.resolve());
  const dirtyWhileSavingRef = useRef(false);
  const savingRef = useRef(false);

  valueRef.current = value;

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (!enabled) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (skipNextRef.current) {
      skipNextRef.current = false;
      return;
    }

    if (savingRef.current) {
      dirtyWhileSavingRef.current = true;
    }

    const timer = setTimeout(() => {
      chainRef.current = chainRef.current
        .catch(() => undefined)
        .then(async () => {
          savingRef.current = true;
          try {
            let loops = 0;
            do {
              dirtyWhileSavingRef.current = false;
              const latest = valueRef.current;
              await onSaveRef.current(latest);
              loops += 1;
            } while (dirtyWhileSavingRef.current && loops < 6);
          } finally {
            savingRef.current = false;
          }
        });
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs, enabled]);

  return {
    skipNextSave: () => {
      skipNextRef.current = true;
    },
  };
}
