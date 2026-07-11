import { useEffect, useRef } from 'react';

/**
 * Autosave con debounce. Usa ref para onSave y evita re-disparos
 * cuando el padre re-renderiza (p. ej. isPending del mutation).
 * Serializa guardados para no solapar requests (evita carreras delete/create).
 */
export function useDebouncedAutosave<T>(
  value: T,
  onSave: (value: T) => Promise<void>,
  options?: { delayMs?: number; enabled?: boolean },
) {
  const delayMs = options?.delayMs ?? 2000;
  const enabled = options?.enabled ?? true;
  const onSaveRef = useRef(onSave);
  const isFirstRender = useRef(true);
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());
  const skipNextRef = useRef(false);

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

    const timer = setTimeout(() => {
      const snapshot = value;
      saveChainRef.current = saveChainRef.current
        .catch(() => undefined)
        .then(() => onSaveRef.current(snapshot));
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs, enabled]);

  return {
    /** Marca el próximo cambio de value como sync post-save (no volver a guardar). */
    skipNextSave: () => {
      skipNextRef.current = true;
    },
  };
}
