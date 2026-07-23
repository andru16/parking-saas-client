import { useMemo } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';

export type PlanLimits = {
  maxUsers: number | null;
  maxCashRegisters: number | null;
  maxSites: number | null;
  maxActiveVehicles: number | null;
  maxDailyTickets: number | null;
};

/**
 * Entitlements del plan SaaS de la organización autenticada.
 */
export function usePlanEntitlements() {
  const { user } = useAuth();
  const plan = user?.organization?.subscription?.plan ?? null;

  return useMemo(() => {
    const features = plan?.features ?? null;
    const rawLimits = plan?.limits ?? {};

    const limits: PlanLimits = {
      maxUsers: rawLimits.maxUsers ?? null,
      maxCashRegisters: rawLimits.maxCashRegisters ?? null,
      maxSites: rawLimits.maxSites ?? null,
      maxActiveVehicles: rawLimits.maxActiveVehicles ?? null,
      maxDailyTickets: rawLimits.maxDailyTickets ?? null,
    };

    function hasFeature(key: string): boolean {
      if (!features) return true;
      return features[key] === true;
    }

    function canAddMore(current: number, limitKey: keyof PlanLimits): boolean {
      const max = limits[limitKey];
      if (max == null) return true;
      return current < max;
    }

    function limitMessage(limitKey: keyof PlanLimits): string | null {
      const max = limits[limitKey];
      if (max == null) return null;
      const labels: Record<keyof PlanLimits, string> = {
        maxUsers: 'usuarios',
        maxCashRegisters: 'cajas',
        maxSites: 'sedes',
        maxActiveVehicles: 'vehículos activos',
        maxDailyTickets: 'tickets diarios',
      };
      return `Su plan permite hasta ${max} ${labels[limitKey]}. Actualice su suscripción para ampliar el cupo.`;
    }

    return {
      plan,
      features,
      limits,
      hasFeature,
      canAddMore,
      limitMessage,
      planName: plan?.name ?? null,
      planCode: plan?.code ?? null,
    };
  }, [plan]);
}
