const STORAGE_KEY = 'parking_setup_welcome';

export function markSetupWelcomePending() {
  try {
    sessionStorage.setItem(STORAGE_KEY, 'pending');
  } catch {
    // ignore
  }
}

/** Permite la pantalla de bienvenida; resiste remounts de Strict Mode. */
export function claimSetupWelcomeAccess(): boolean {
  try {
    const value = sessionStorage.getItem(STORAGE_KEY);
    if (value === 'pending' || value === 'showing') {
      sessionStorage.setItem(STORAGE_KEY, 'showing');
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

export function clearSetupWelcome() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
