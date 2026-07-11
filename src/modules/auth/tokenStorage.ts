const ACCESS_TOKEN_KEY = 'parking_saas_access_token';
const REMEMBER_ME_KEY = 'parking_saas_remember_me';

function getActiveStorage(): Storage {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true' ? localStorage : sessionStorage;
}

/**
 * Almacenamiento del access token.
 * "Recordarme" persiste en localStorage; de lo contrario sessionStorage.
 */
export const tokenStorage = {
  isRememberMe(): boolean {
    return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
  },

  setRememberMe(remember: boolean): void {
    if (remember) {
      localStorage.setItem(REMEMBER_ME_KEY, 'true');
    } else {
      localStorage.removeItem(REMEMBER_ME_KEY);
    }
  },

  get(): string | null {
    return (
      getActiveStorage().getItem(ACCESS_TOKEN_KEY) ??
      sessionStorage.getItem(ACCESS_TOKEN_KEY) ??
      localStorage.getItem(ACCESS_TOKEN_KEY)
    );
  },

  set(token: string): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    getActiveStorage().setItem(ACCESS_TOKEN_KEY, token);
  },

  clear(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};
