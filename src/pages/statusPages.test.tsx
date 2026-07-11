import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AccessDeniedPage } from '@/pages/AccessDeniedPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

describe('páginas de estado', () => {
  it('AccessDeniedPage renderiza', () => {
    render(
      <MemoryRouter>
        <AccessDeniedPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: /acceso denegado/i })).toBeInTheDocument();
  });

  it('NotFoundPage renderiza', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /volver al inicio/i })).toBeInTheDocument();
  });
});
