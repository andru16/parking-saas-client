import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useSupportMeta, useSupportList } from '@/modules/support/hooks/useSupport';

vi.mock('@/api/support', () => ({
  getSupportMeta: vi.fn(async () => ({
    success: true,
    data: {
      meta: {
        categories: [{ id: 'question', label: 'Duda' }],
        priorities: [{ id: 'medium', label: 'Media' }],
        statuses: [{ id: 'open', label: 'Abierto' }],
      },
    },
  })),
  listSupportTickets: vi.fn(async () => ({
    success: true,
    data: {
      items: [{ _id: '1', numberLabel: 'SUP-00001', subject: 'Test', status: 'open' }],
      pagination: { page: 1, limit: 15, total: 1, totalPages: 1 },
    },
  })),
  createSupportTicket: vi.fn(),
  getSupportTicket: vi.fn(),
  replySupportTicket: vi.fn(),
  updateSupportTicketStatus: vi.fn(),
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useSupport hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useSupportMeta carga meta', async () => {
    const { result } = renderHook(() => useSupportMeta(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.categories[0].id).toBe('question');
  });

  it('useSupportList carga items', async () => {
    const { result } = renderHook(() => useSupportList({ page: 1 }), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.items).toHaveLength(1);
  });
});
