import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  adminLogin,
  adminLogout,
  adminMe,
  type SuperAdminUser,
} from '@/modules/superAdmin/api';
import { adminTokenStorage } from '@/modules/superAdmin/adminTokenStorage';
import { adminApi } from '@/modules/superAdmin/adminApi';

interface SuperAdminAuthContextValue {
  user: SuperAdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    remember?: boolean,
    botGuard?: { website?: string; formStartedAt: number },
  ) => Promise<SuperAdminUser>;
  logout: () => Promise<void>;
}

const SuperAdminAuthContext = createContext<SuperAdminAuthContextValue | null>(null);

export function SuperAdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SuperAdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        let token = adminTokenStorage.get();
        if (!token) {
          const { data } = await adminApi.post(
            '/admin/auth/refresh',
            null,
            { _skipAdminRefresh: true } as never,
          );
          token = data?.data?.accessToken ?? null;
          if (token) adminTokenStorage.set(token);
        }
        if (!token) {
          if (active) setUser(null);
          return;
        }
        const response = await adminMe();
        if (active) setUser(response.data.user);
      } catch {
        adminTokenStorage.clear();
        if (active) setUser(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      remember = false,
      botGuard?: { website?: string; formStartedAt: number },
    ) => {
      const response = await adminLogin(email, password, botGuard);
      adminTokenStorage.set(response.data.accessToken, remember);
      setUser(response.data.user);
      return response.data.user;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await adminLogout();
    } finally {
      adminTokenStorage.clear();
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, isLoading, login, logout],
  );

  return (
    <SuperAdminAuthContext.Provider value={value}>{children}</SuperAdminAuthContext.Provider>
  );
}

export function useSuperAdminAuth() {
  const ctx = useContext(SuperAdminAuthContext);
  if (!ctx) throw new Error('useSuperAdminAuth debe usarse dentro de SuperAdminAuthProvider');
  return ctx;
}
