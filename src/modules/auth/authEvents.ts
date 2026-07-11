type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;

export function registerSessionExpiredHandler(handler: SessionExpiredHandler): void {
  sessionExpiredHandler = handler;
}

export function notifySessionExpired(): void {
  sessionExpiredHandler?.();
}
