import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  hasAllPermissions,
  PERMISSIONS,
} from '@/modules/auth/permissions';
import { filterNavByPermissions, canAccessPath } from '@/modules/navigation/nav.config';

describe('permissions', () => {
  it('hasPermission OR', () => {
    expect(hasPermission(['tickets:create'], PERMISSIONS.TICKETS_CREATE)).toBe(true);
    expect(hasPermission(['tickets:create'], PERMISSIONS.AUDIT_VIEW)).toBe(false);
    expect(hasPermission(['*'], PERMISSIONS.AUDIT_VIEW)).toBe(true);
    expect(hasPermission([], PERMISSIONS.TICKETS_CREATE)).toBe(false);
  });

  it('hasAllPermissions AND', () => {
    expect(
      hasAllPermissions(
        ['cash:open', 'cash:close'],
        [PERMISSIONS.CASH_OPEN, PERMISSIONS.CASH_CLOSE],
      ),
    ).toBe(true);
    expect(hasAllPermissions(['cash:open'], [PERMISSIONS.CASH_OPEN, PERMISSIONS.CASH_CLOSE])).toBe(
      false,
    );
  });
});

describe('nav.config', () => {
  it('filtra menú por permisos', () => {
    const items = filterNavByPermissions(['dashboard:view', 'support:view']);
    expect(items.some((i) => i.id === 'dashboard')).toBe(true);
    expect(items.some((i) => i.id === 'support')).toBe(true);
    expect(items.some((i) => i.id === 'audit')).toBe(false);
  });

  it('wildcard ve el menú activo (sin slots future)', () => {
    expect(filterNavByPermissions(['*']).length).toBeGreaterThan(5);
    expect(filterNavByPermissions(['*']).every((i) => i.enabled !== false)).toBe(true);
  });

  it('respeta feature flags del plan', () => {
    const items = filterNavByPermissions(['*'], { dashboard: true, reports: false });
    expect(items.some((i) => i.id === 'dashboard')).toBe(true);
    expect(items.some((i) => i.id === 'reports')).toBe(false);
  });

  it('canAccessPath respeta permisos', () => {
    expect(canAccessPath(['support:view'], '/support')).toBe(true);
    expect(canAccessPath(['support:view'], '/support/abc')).toBe(true);
    expect(canAccessPath(['dashboard:view'], '/support')).toBe(false);
  });
});
