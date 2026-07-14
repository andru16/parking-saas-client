import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { loginRequest, logoutRequest, meRequest, type AuthUser } from '@/api/auth';
import { registerSessionExpiredHandler } from '@/modules/auth/authEvents';
import { refreshAccessToken } from '@/modules/auth/authSession';
import { tokenStorage } from './tokenStorage';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
    botGuard?: { website?: string; formStartedAt: number },
  ) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const clearSessionExpired = useCallback(() => {
    setSessionExpired(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = tokenStorage.get();
    if (!token) {
      // Bootstrap / revalidación sin access token: no tratar fallo como “sesión expirada”.
      const renewed = await refreshAccessToken({ silent: true });
      if (!renewed) {
        setUser(null);
        return;
      }
    }

    const response = await meRequest();
    setUser(response.data.user);
  }, []);

  useEffect(() => {
    registerSessionExpiredHandler(() => {
      tokenStorage.clear();
      setUser(null);
      setSessionExpired(true);
    });
  }, []);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        let token = tokenStorage.get();

        if (!token) {
          // Visitante sin token: intentar cookie de refresh en silencio.
          token = await refreshAccessToken({ silent: true });
        }

        if (!token) {
          if (active) setUser(null);
          return;
        }

        const response = await meRequest();
        if (active) setUser(response.data.user);
      } catch {
        tokenStorage.clear();
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadSession();

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      rememberMe = false,
      botGuard?: { website?: string; formStartedAt: number },
    ) => {
      tokenStorage.setRememberMe(rememberMe);
      const response = await loginRequest({
        email,
        password,
        website: botGuard?.website ?? '',
        formStartedAt: botGuard?.formStartedAt ?? Date.now(),
      });
      tokenStorage.set(response.data.accessToken);
      setSessionExpired(false);
      setUser(response.data.user);
      return response.data.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      tokenStorage.clear();
      tokenStorage.setRememberMe(false);
      setUser(null);
      setSessionExpired(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      sessionExpired,
      login,
      logout,
      refreshUser,
      clearSessionExpired,
    }),
    [user, isLoading, sessionExpired, login, logout, refreshUser, clearSessionExpired],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
