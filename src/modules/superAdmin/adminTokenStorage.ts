const KEY = 'parking_saas_admin_access_token';

export const adminTokenStorage = {
  get(): string | null {
    return sessionStorage.getItem(KEY) ?? localStorage.getItem(KEY);
  },

  set(token: string, remember = false) {
    this.clear();
    if (remember) localStorage.setItem(KEY, token);
    else sessionStorage.setItem(KEY, token);
  },

  clear() {
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(KEY);
  },
};
