import { describe, it, expect } from 'vitest';
import { filterSuperAdminNav } from '@/modules/superAdmin/nav.config';
import { PLATFORM_PERMISSIONS } from '@/modules/superAdmin/permissions';

describe('Super Admin nav', () => {
  it('filtra por platform permissions', () => {
    const items = filterSuperAdminNav([PLATFORM_PERMISSIONS.SUPPORT_MANAGE]);
    expect(items.some((i) => i.id === 'support')).toBe(true);
    expect(items.some((i) => i.id === 'plans')).toBe(false);
  });
});
