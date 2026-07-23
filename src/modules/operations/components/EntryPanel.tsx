import { useEffect, useId, useMemo, useState, type RefObject } from 'react';
import type { PlateLookupResult, TicketItem, VehicleCategoryOption } from '@/api/tickets';
import { useOpenTicket, usePlateLookup, useVehicleCategories } from '@/modules/operations/hooks/useOperations';
import { usePrintConfig, usePrintTicket, shouldAutoPrintEntry } from '@/modules/printing/hooks/usePrinting';
import {
  normalizePlate,
  resolveCategoryFromPlate,
} from '@/modules/operations/utils/colombianPlate';

interface EntryPanelProps {
  onTicketOpened: (ticket: TicketItem) => void;
  plateInputRef?: RefObject<HTMLInputElement | null>;
  cashOpen: boolean;
}

export function EntryPanel({ onTicketOpened, plateInputRef, cashOpen }: EntryPanelProps) {
  const plateFieldId = useId();
  const [plateInput, setPlateInput] = useState('');
  const [debouncedPlate, setDebouncedPlate] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [manualCategoryOverride, setManualCategoryOverride] = useState(false);

  const { data: categories = [] } = useVehicleCategories();
  const { data: printConfig } = usePrintConfig();
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const requiresPlate = selectedCategory?.requirements?.requiresPlate ?? true;
  const plate = normalizePlate(debouncedPlate);
  const lookupEnabled = Boolean(plate.length >= 2);

  const plateResolution = useMemo(
    () => resolveCategoryFromPlate(plate, categories),
    [plate, categories],
  );

  const { data: lookup, isFetching: isLookingUp } = usePlateLookup(plate, lookupEnabled);
  const openTicket = useOpenTicket();
  const printTicket = usePrintTicket();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedPlate(normalizePlate(plateInput));
    }, 200);
    return () => window.clearTimeout(timer);
  }, [plateInput]);

  useEffect(() => {
    setManualCategoryOverride(false);
  }, [plate]);

  useEffect(() => {
    if (lookup?.found && lookup.vehicle?.category?.id) {
      setSelectedCategoryId(lookup.vehicle.category.id);
      return;
    }

    if (manualCategoryOverride) return;

    if (plateResolution.categoryId) {
      setSelectedCategoryId(plateResolution.categoryId);
      return;
    }

    if (!lookupEnabled && categories.length === 1) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [lookup, plateResolution.categoryId, manualCategoryOverride, lookupEnabled, categories]);

  const hasOpenTicket = Boolean(lookup?.openTicket);
  const knownVehicle = Boolean(lookup?.found && lookup.vehicle);
  const needsQuickRegister = lookupEnabled && lookup && !lookup.found;

  const autoCategoryReady =
    Boolean(plateResolution.autoDetected && plateResolution.categoryId) && !manualCategoryOverride;

  const showCategoryPicker =
    !knownVehicle &&
    (needsQuickRegister || (!lookupEnabled && categories.length > 0)) &&
    !(autoCategoryReady && needsQuickRegister) &&
    !(categories.length === 1 && !lookupEnabled);

  const canOpen = useMemo(() => {
    if (!cashOpen || openTicket.isPending || hasOpenTicket) return false;
    if (plateResolution.reason === 'plate_kind_mismatch') return false;
    if (knownVehicle) return true;
    if (needsQuickRegister) {
      if (!selectedCategoryId) return false;
      if (requiresPlate && plate.length < 2) return false;
      return true;
    }
    if (!lookupEnabled && selectedCategoryId && !requiresPlate) return true;
    return false;
  }, [
    cashOpen,
    openTicket.isPending,
    hasOpenTicket,
    plateResolution.reason,
    knownVehicle,
    needsQuickRegister,
    selectedCategoryId,
    requiresPlate,
    plate.length,
    lookupEnabled,
  ]);

  async function handleOpenTicket() {
    setError(null);
    if (!cashOpen) {
      setError('Debe abrir la caja antes de registrar ingresos.');
      return;
    }

    if (plateResolution.reason === 'plate_kind_mismatch' && plateResolution.message) {
      setError(plateResolution.message);
      return;
    }

    try {
      const payload: {
        plate?: string;
        vehicleId?: string;
        vehicleCategoryId?: string;
      } = {};

      if (knownVehicle && lookup?.vehicle) {
        payload.vehicleId = lookup.vehicle.id;
        if (lookup.vehicle.plate) payload.plate = lookup.vehicle.plate;
      } else {
        const categoryId = selectedCategoryId || plateResolution.categoryId;
        if (!categoryId) {
          setError('Seleccione la categoría del vehículo.');
          return;
        }
        payload.vehicleCategoryId = categoryId;
        if (plate) payload.plate = plate;
      }

      const res = await openTicket.mutateAsync(payload);
      const opened = res.data.ticket;
      onTicketOpened(opened);

      if (shouldAutoPrintEntry(printConfig)) {
        void printTicket.mutateAsync({ ticketId: opened.id, type: 'entry' });
      }

      setPlateInput('');
      setDebouncedPlate('');
      setSelectedCategoryId('');
      setManualCategoryOverride(false);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'No se pudo registrar el ingreso';
      setError(message);
    }
  }

  return (
    <section className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm">
      <header className="border-b border-gray-100 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-900">Ingreso</h2>
        
      </header>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {!cashOpen && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Caja cerrada: abra un turno para operar.
          </div>
        )}

        <div>
          <label htmlFor={plateFieldId} className="mb-1 block text-xs font-medium text-gray-700">
            Placa del vehículo
          </label>
          <input
            ref={plateInputRef}
            id={plateFieldId}
            type="text"
            autoComplete="off"
            autoFocus
            disabled={!cashOpen}
            placeholder="Ej: CBF424 · ZGT26F · UMO47"
            value={plateInput}
            onChange={(e) => setPlateInput(normalizePlate(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && canOpen) {
                e.preventDefault();
                void handleOpenTicket();
              }
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-3 font-mono text-xl tracking-wider uppercase focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 disabled:bg-gray-50"
          />
          {isLookingUp && <p className="mt-1 text-xs text-gray-400">Buscando...</p>}
        </div>

        {lookupEnabled && lookup && (
          <LookupCard lookup={lookup} onSelectOpenTicket={onTicketOpened} />
        )}

      
        {plateResolution.reason === 'plate_kind_mismatch' && plateResolution.message && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {plateResolution.message}
          </p>
        )}

        {showCategoryPicker && (
          <QuickCategoryPicker
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelect={(id) => {
              setManualCategoryOverride(true);
              setSelectedCategoryId(id);
            }}
            showHint={Boolean(needsQuickRegister)}
            selectedCategory={selectedCategory}
            plate={plate}
          />
        )}

        {error && (
          <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={!canOpen}
          onClick={() => void handleOpenTicket()}
          className="mt-auto w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {openTicket.isPending ? 'Registrando...' : 'Abrir ticket'}
        </button>
      </div>
    </section>
  );
}

function LookupCard({
  lookup,
  onSelectOpenTicket,
}: {
  lookup: PlateLookupResult;
  onSelectOpenTicket: (ticket: TicketItem) => void;
}) {
  

  const { vehicle, openTicket, activeMembership } = lookup;

  return (
    <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-lg font-bold">{vehicle?.plate ?? 'Sin placa'}</span>
        {vehicle?.category && (
          <span
            className="rounded-md px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: `${vehicle.category.color}22`,
              color: vehicle.category.color,
            }}
          >
            {vehicle.category.name}
          </span>
        )}
      </div>

      {activeMembership ? (
        <p className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">
          Membresía vigente: {activeMembership.name}
        </p>
      ) : (
        <p className="text-xs text-gray-500">Sin membresía activa</p>
      )}

      {openTicket && (
        <button
          type="button"
          onClick={() => onSelectOpenTicket(openTicket)}
          className="w-full rounded-md border border-red-200 bg-red-50 px-2 py-1.5 text-left text-xs font-medium text-red-700 hover:bg-red-100"
        >
          Ya tiene ticket abierto — tocar para cobrar
        </button>
      )}
    </div>
  );
}

function QuickCategoryPicker({
  categories,
  selectedCategoryId,
  onSelect,
  showHint,
  selectedCategory,
  plate,
}: {
  categories: VehicleCategoryOption[];
  selectedCategoryId: string;
  onSelect: (id: string) => void;
  showHint: boolean;
  selectedCategory?: VehicleCategoryOption;
  plate: string;
}) {
  const requiresPlate = selectedCategory?.requirements?.requiresPlate ?? true;

  return (
    <div className="space-y-2 rounded-lg border border-dashed border-gray-300 p-3">
      {showHint && (
        <p className="text-xs font-medium text-gray-600">
          Elija categoría (no se pudo detectar automáticamente)
        </p>
      )}
      <div className="grid grid-cols-1 gap-1.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium ${
              selectedCategoryId === cat.id
                ? 'border-primary-500 bg-primary-50 text-primary-900'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: cat.color || '#3B82F6' }}
            />
            {cat.name}
          </button>
        ))}
      </div>
      {selectedCategory && requiresPlate && !plate && (
        <p className="text-xs text-amber-700">Esta categoría requiere placa.</p>
      )}
    </div>
  );
}
