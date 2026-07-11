import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RoleGuard } from '@/modules/navigation/RoleGuard';
import { PERMISSIONS } from '@/modules/auth/permissions';

vi.mock('@/modules/auth/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '@/modules/auth/AuthProvider';

function renderWithGuard(permissions: string[] | null, required?: string | string[]) {
  vi.mocked(useAuth).mockReturnValue({
    user: permissions
      ? { permissions, role: { key: 'cashier', name: 'cashier' } }
      : null,
    isLoading: false,
  } as never);

  return render(
    <MemoryRouter initialEntries={['/secure']}>
      <Routes>
        <Route
          path="/secure"
          element={
            <RoleGuard permissions={required ?? PERMISSIONS.AUDIT_VIEW}>
              <div>OK</div>
            </RoleGuard>
          }
        />
        <Route path="/acceso-denegado" element={<div>DENEGADO</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RoleGuard', () => {
  it('permite acceso con permiso', () => {
    renderWithGuard(['audit:view'], PERMISSIONS.AUDIT_VIEW);
    expect(screen.getByText('OK')).toBeInTheDocument();
  });

  it('redirige sin permiso', () => {
    renderWithGuard(['tickets:create'], PERMISSIONS.AUDIT_VIEW);
    expect(screen.getByText('DENEGADO')).toBeInTheDocument();
  });

  it('wildcard permite', () => {
    renderWithGuard(['*'], PERMISSIONS.SETTINGS_MANAGE);
    expect(screen.getByText('OK')).toBeInTheDocument();
  });
});
