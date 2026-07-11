import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { hasPermission } from '@/modules/auth/permissions';
import { canAccessPath } from '@/modules/navigation/nav.config';
import { hasRole, type AppRole } from '@/modules/navigation/roles';

/**
 * Guard de UI por permisos (preferido) o roles (legacy).
 * Complementa — no reemplaza — requirePermission del backend.
 */
export function RoleGuard({
  children,
  roles,
  permissions,
}: {
  children: ReactNode;
  roles?: AppRole[];
  permissions?: string | string[];
}) {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const roleName = user?.role?.name ?? user?.role?.key ?? null;
  const userPermissions = user?.permissions ?? [];

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  let allowed = false;

  if (permissions) {
    allowed = hasPermission(userPermissions, permissions);
  } else if (roles) {
    allowed = hasRole(roleName, roles) || userPermissions.includes('*');
  } else {
    allowed = canAccessPath(userPermissions, location.pathname);
  }

  if (!allowed) {
    return <Navigate to="/acceso-denegado" replace state={{ from: location.pathname }} />;
  }

  return children;
}
