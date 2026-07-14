import { useMemo, useState } from 'react';
import type { TicketItem } from '@/api/tickets';
import { ElapsedTime } from '@/modules/operations/components/ElapsedTime';
import { getTimeBand, TIME_BAND_STYLES } from '@/modules/operations/posVisuals';

type SortKey = 'entryAt' | 'plate' | 'elapsed' | 'category';

interface ActiveTicketsPanelProps {
  tickets: TicketItem[];
  selectedId: string | null;
  onSelect: (ticket: TicketItem) => void;
  isLoading: boolean;
}

export function ActiveTicketsPanel({
  tickets,
  selectedId,
  onSelect,
  isLoading,
}: ActiveTicketsPanelProps) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('entryAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    let list = tickets;
    if (q) {
      list = list.filter((t) => (t.vehicle?.plate ?? '').toUpperCase().includes(q));
    }

    const dir = sortDir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case 'plate':
          return (
            dir *
            (a.vehicle?.plate ?? '').localeCompare(b.vehicle?.plate ?? '', 'es', {
              sensitivity: 'base',
            })
          );
        case 'category':
          return (
            dir *
            (a.category?.name ?? '').localeCompare(b.category?.name ?? '', 'es', {
              sensitivity: 'base',
            })
          );
        case 'elapsed':
          return dir * (new Date(a.entryAt).getTime() - new Date(b.entryAt).getTime()) * -1;
        case 'entryAt':
        default:
          return dir * (new Date(a.entryAt).getTime() - new Date(b.entryAt).getTime());
      }
    });
  }, [tickets, query, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'plate' || key === 'category' ? 'asc' : 'desc');
    }
  }

  return (
    <section className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <header className="space-y-3 border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">
              Vehículos dentro
            </h2>
          </div>
          <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-primary-100 px-2 text-sm font-bold text-primary-800">
            {tickets.length}
          </span>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          placeholder="Buscar placa..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm uppercase focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
        />

        <div className="flex flex-wrap gap-1">
          {(
            [
              ['entryAt', 'Hora'],
              ['plate', 'Placa'],
              ['elapsed', 'Tiempo'],
              ['category', 'Categoría'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleSort(key)}
              className={`rounded-md px-2 py-1 text-xs font-medium ${
                sortKey === key
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
              {sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {isLoading && <p className="p-4 text-center text-sm text-gray-400">Cargando...</p>}

        {!isLoading && tickets.length === 0 && (
          <p className="p-8 text-center text-sm text-gray-400">
            No hay vehículos dentro del parqueadero
          </p>
        )}

        {!isLoading && tickets.length > 0 && filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">Sin coincidencias para “{query}”</p>
        )}

        <ul className="space-y-1 p-2">
          {filtered.map((ticket) => {
            const band = getTimeBand(ticket.entryAt);
            const styles = TIME_BAND_STYLES[band];
            const selected = selectedId === ticket.id;

            return (
              <li key={ticket.id}>
                <button
                  type="button"
                  onClick={() => onSelect(ticket)}
                  className={`w-full rounded-xl border-l-4 px-3 py-3 text-left transition-colors ${styles.border} ${
                    selected ? 'bg-primary-50 ring-2 ring-primary-500' : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xl font-bold tracking-wide text-gray-900">
                        {ticket.vehicle?.plate ?? 'Sin placa'}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {ticket.category && (
                          <span
                            className="rounded-md px-2 py-0.5 text-xs font-medium"
                            style={{
                              backgroundColor: `${ticket.category.color}22`,
                              color: ticket.category.color,
                            }}
                          >
                            {ticket.category.name}
                          </span>
                        )}
                        {ticket.membership && (
                          <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                            Membresía
                          </span>
                        )}
                        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${styles.badge}`}>
                          {styles.label}
                        </span>
                        <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Abierto
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-lg font-semibold text-primary-700">
                        <ElapsedTime from={ticket.entryAt} />
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(ticket.entryAt).toLocaleTimeString('es-CO', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-500">
                    {ticket.entryUser && (
                      <span>
                        Ingreso: {ticket.entryUser.firstName} {ticket.entryUser.lastName}
                      </span>
                    )}
                    {ticket.cashRegister?.cashPointName && (
                      <span>Caja: {ticket.cashRegister.cashPointName}</span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
