import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { usePlanEntitlements } from '@/modules/billing/usePlanEntitlements';

/**
 * Bloquea la ruta si el plan no incluye la feature.
 */
export function FeatureGuard({
  feature,
  children,
}: {
  feature: string;
  children: ReactNode;
}) {
  const location = useLocation();
  const { hasFeature, features } = usePlanEntitlements();

  if (features && !hasFeature(feature)) {
    return <Navigate to="/acceso-denegado" replace state={{ from: location.pathname }} />;
  }

  return children;
}
