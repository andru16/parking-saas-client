import { useCallback, useMemo, useRef, useState } from 'react';
import type { TicketItem } from '@/api/tickets';
import { ActiveTicketsPanel } from '@/modules/operations/components/ActiveTicketsPanel';
import { CashRegisterBanner } from '@/modules/operations/components/CashRegisterBanner';
import { EntryPanel } from '@/modules/operations/components/EntryPanel';
import { TicketDetailPanel } from '@/modules/operations/components/TicketDetailPanel';
import { useOpenTickets } from '@/modules/operations/hooks/useOperations';
import { useCurrentCashRegister } from '@/modules/cash/hooks/useCashRegister';
import { usePosKeyboard } from '@/modules/operations/usePosKeyboard';

export function OperationsPage() {
  const { data: openTickets = [], isLoading } = useOpenTickets();
  const { data: cashSession } = useCurrentCashRegister();
  const cashOpen = Boolean(cashSession);
  const [selectedTicket, setSelectedTicket] = useState<TicketItem | null>(null);
  const [collectRequest, setCollectRequest] = useState(0);
  const plateInputRef = useRef<HTMLInputElement>(null);

  const currentSelected = selectedTicket
    ? (openTickets.find((t) => t.id === selectedTicket.id) ?? selectedTicket)
    : null;

  const keyboardHandlers = useMemo(
    () => ({
      'focus-plate': () => plateInputRef.current?.focus(),
      'new-entry': () => {
        plateInputRef.current?.focus();
        plateInputRef.current?.select();
      },
      collect: () => {
        if (currentSelected?.status === 'open' && cashOpen) {
          setCollectRequest((n) => n + 1);
        }
      },
      'cancel-dialog': () => undefined,
    }),
    [currentSelected?.status, cashOpen],
  );

  usePosKeyboard(keyboardHandlers, true);

  const handleTicketOpened = useCallback((ticket: TicketItem) => {
    setSelectedTicket(ticket);
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Centro de Operaciones</h1>
          <p className="text-sm text-gray-500">
            POS de ingreso y cobro · F2 placa · F3 ingreso · F4 cobrar
          </p>
        </div>
        <CashRegisterBanner />
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-12 xl:min-h-[640px]">
        <div className="xl:col-span-3 min-h-[300px]">
          <EntryPanel
            plateInputRef={plateInputRef}
            cashOpen={cashOpen}
            onTicketOpened={handleTicketOpened}
          />
        </div>

        <div className="xl:col-span-5 min-h-[360px]">
          <ActiveTicketsPanel
            tickets={openTickets}
            selectedId={selectedTicket?.id ?? null}
            onSelect={setSelectedTicket}
            isLoading={isLoading}
          />
        </div>

        <div className="xl:col-span-4 min-h-[300px]">
          <TicketDetailPanel
            ticket={currentSelected}
            cashOpen={cashOpen}
            collectOpenRequest={collectRequest}
            onExitComplete={() => setSelectedTicket(null)}
          />
        </div>
      </div>
    </div>
  );
}
