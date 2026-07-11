import { useEffect } from 'react';

export type PosShortcutAction =
  | 'focus-plate'
  | 'new-entry'
  | 'collect'
  | 'cancel-dialog'
  | 'confirm';

const DEFAULT_MAP: Record<string, PosShortcutAction> = {
  F2: 'focus-plate',
  F3: 'new-entry',
  F4: 'collect',
  Escape: 'cancel-dialog',
};

/**
 * Arquitectura de atajos del POS.
 * F2 buscar placa · F3 nuevo ingreso · F4 cobrar · ESC cancelar diálogo.
 * ENTER se maneja en el campo de placa (confirmar ingreso).
 */
export function usePosKeyboard(
  handlers: Partial<Record<PosShortcutAction, () => void>>,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const action = DEFAULT_MAP[event.key];
      if (!action) return;

      if (event.key === 'F2' || event.key === 'F3' || event.key === 'F4') {
        event.preventDefault();
      }

      handlers[action]?.();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlers, enabled]);
}
