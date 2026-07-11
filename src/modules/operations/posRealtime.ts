/**
 * Capa de tiempo real del POS.
 * Hoy: polling vía React Query.
 * Futuro: suscripción Socket.IO sin cambiar consumidores.
 */

type PosEvent =
  | { type: 'tickets:changed' }
  | { type: 'ticket:opened'; ticketId: string }
  | { type: 'ticket:closed'; ticketId: string }
  | { type: 'ticket:cancelled'; ticketId: string }
  | { type: 'cash:changed' };

type Listener = (event: PosEvent) => void;

const listeners = new Set<Listener>();

export const posRealtime = {
  /** Intervalo de refresco actual (ms). */
  pollIntervalMs: 15_000,

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  emit(event: PosEvent) {
    listeners.forEach((l) => l(event));
  },

  /**
   * Hook de extensión: conectar Socket.IO aquí y reemitir eventos.
   * Ejemplo futuro: socket.on('ticket:opened', (p) => posRealtime.emit(...))
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  connectSocket(_url?: string) {
    // Placeholder — sin implementación Socket.IO en esta fase.
  },
};
