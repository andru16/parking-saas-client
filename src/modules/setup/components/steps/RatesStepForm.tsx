import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { RateItem } from '@/api/setup';
import { SettingsFormActions } from '@/modules/settings/components/SettingsSectionShell';
import { BILLING_MODES } from '../../constants';
import { useDebouncedAutosave } from '../../hooks/useDebouncedAutosave';
import type { SetupStepSubmit } from '../../types';
import { confirmAction } from '@/lib/dialogs';

interface CategoryOption {
  _id: string;
  name: string;
}

interface Props {
  initialRates: RateItem[];
  categories: CategoryOption[];
  onSave: (rates: RateItem[]) => Promise<RateItem[] | void>;
  isSaving: boolean;
  readOnly?: boolean;
  autosave?: boolean;
  onCancel?: () => void;
  /** Campos avanzados del motor de tarifas (settings). */
  advanced?: boolean;
  registerStepSubmit?: (fn: SetupStepSubmit) => () => void;
}

const CONTEXT_TYPES = [
  { value: 'normal', label: 'Normal' },
  { value: 'night', label: 'Nocturna' },
  { value: 'holiday', label: 'Festivo' },
  { value: 'special', label: 'Especial' },
] as const;

function buildRateName(categoryName: string, billingMode: string): string {
  const modeLabel = BILLING_MODES.find((m) => m.value === billingMode)?.label ?? billingMode;
  return `${categoryName} — ${modeLabel}`;
}

type LocalRate = RateItem & { clientKey: string };

function createClientKey() {
  return `rate-${crypto.randomUUID()}`;
}

function normalizeRate(rate: RateItem & { clientKey?: string }): LocalRate {
  return {
    ...rate,
    id: rate.id ? String(rate.id) : undefined,
    clientKey: rate.clientKey || (rate.id ? String(rate.id) : createClientKey()),
    vehicleCategoryId: rate.vehicleCategoryId ? String(rate.vehicleCategoryId) : '',
    value: Number(rate.value) || 0,
    baseTimeMinutes: Number(rate.baseTimeMinutes) || 0,
    graceMinutes: Number(rate.graceMinutes) || 0,
    minFractionMinutes:
      rate.minFractionMinutes != null ? Number(rate.minFractionMinutes) : undefined,
    fractionPrice: rate.fractionPrice != null ? Number(rate.fractionPrice) : undefined,
    status: rate.status === 'inactive' ? 'inactive' : 'active',
  };
}

const fieldClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-600';

/** Une la respuesta del servidor con el estado local sin borrar filas nuevas. */
function mergeSavedIntoLocal(local: LocalRate[], saved: RateItem[]): LocalRate[] {
  const pool = [...saved];

  const takeMatch = (row: LocalRate): RateItem | undefined => {
    if (row.id) {
      const idx = pool.findIndex((s) => String(s.id) === String(row.id));
      if (idx >= 0) return pool.splice(idx, 1)[0];
    }
    const idx = pool.findIndex(
      (s) =>
        String(s.vehicleCategoryId) === String(row.vehicleCategoryId) &&
        s.billingMode === row.billingMode &&
        (s.contextType || 'normal') === (row.contextType || 'normal'),
    );
    if (idx >= 0) return pool.splice(idx, 1)[0];
    return undefined;
  };

  return local.map((row) => {
    const match = takeMatch(row);
    if (!match) return row;
    return normalizeRate({
      ...match,
      value: row.value,
      clientKey: row.clientKey,
    });
  });
}

function emptyRate(category: CategoryOption): LocalRate {
  return {
    clientKey: createClientKey(),
    name: buildRateName(category.name, 'fixed'),
    vehicleCategoryId: String(category._id),
    contextType: 'normal',
    billingMode: 'fixed',
    value: 0,
    baseTimeMinutes: 0,
    graceMinutes: 0,
    status: 'active',
  };
}

function pickCategoryForNewRate(
  categories: CategoryOption[],
  rates: RateItem[],
): CategoryOption | undefined {
  const used = new Set(rates.map((r) => String(r.vehicleCategoryId)).filter(Boolean));
  return categories.find((c) => !used.has(String(c._id))) ?? categories[0];
}

function modeMeta(billingMode: string) {
  return BILLING_MODES.find((m) => m.value === billingMode);
}

export function RatesStepForm({
  initialRates,
  categories,
  onSave,
  isSaving,
  readOnly = false,
  autosave = true,
  onCancel,
  advanced = false,
  registerStepSubmit,
}: Props) {
  const [rates, setRates] = useState<LocalRate[]>(() =>
    initialRates.map((r) => normalizeRate(r)),
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const skipNextSaveRef = useRef(() => {});
  const ratesRef = useRef(rates);
  const persistGenRef = useRef(0);
  ratesRef.current = rates;

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [String(c._id), { ...c, _id: String(c._id) }])),
    [categories],
  );

  const persist = useCallback(
    async (current: LocalRate[]) => {
      const gen = ++persistGenRef.current;
      const payload = current.map(({ clientKey: _clientKey, ...rate }) => rate);
      const saved = await onSave(payload);

      // Un resultado obsoleto no debe pisar el UI ni acortar la lista.
      if (gen !== persistGenRef.current) return;

      if (saved?.length) {
        skipNextSaveRef.current();
        setRates(mergeSavedIntoLocal(ratesRef.current, saved));
      }
    },
    [onSave],
  );

  const { skipNextSave } = useDebouncedAutosave(rates, persist, {
    enabled: autosave && !readOnly && rates.length > 0,
    delayMs: 1200,
  });
  skipNextSaveRef.current = skipNextSave;

  useEffect(() => {
    if (!registerStepSubmit) return;
    return registerStepSubmit(async () => {
      setLocalError(null);
      if (rates.length === 0) {
        setLocalError('Configure al menos una tarifa');
        return false;
      }
      if (rates.some((r) => !r.vehicleCategoryId)) {
        setLocalError('Cada tarifa debe tener una categoría de vehículo');
        return false;
      }
      if (!advanced) {
        const activeCategories = rates
          .filter((r) => r.status !== 'inactive')
          .map((r) => String(r.vehicleCategoryId))
          .filter(Boolean);
        if (new Set(activeCategories).size !== activeCategories.length) {
          setLocalError('Cada categoría de vehículo solo puede tener una tarifa activa');
          return false;
        }
      }
      if (rates.some((r) => r.status !== 'inactive' && !(Number(r.value) > 0))) {
        setLocalError('El valor de cada tarifa activa debe ser mayor a 0');
        return false;
      }
      await persist(rates);
      return true;
    });
  }, [registerStepSubmit, rates, persist, advanced]);

  const updateRate = (index: number, patch: Partial<RateItem>) => {
    if (readOnly) return;
    setRates((prev) =>
      prev.map((rate, i) => {
        if (i !== index) return rate;

        const next = { ...rate, ...patch };
        if (patch.vehicleCategoryId != null) {
          next.vehicleCategoryId = String(patch.vehicleCategoryId);
        }
        const category = categoryById.get(String(next.vehicleCategoryId));
        if (category && (patch.vehicleCategoryId != null || patch.billingMode != null)) {
          next.name = buildRateName(category.name, next.billingMode);
        }
        return next;
      }),
    );
  };

  const removeRate = (index: number) => {
    if (readOnly) return;
    void (async () => {
      const ok = await confirmAction({
        title: '¿Eliminar esta tarifa?',
        confirmText: 'Eliminar',
        danger: true,
      });
      if (!ok) return;
      setRates((prev) => prev.filter((_, i) => i !== index));
    })();
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await persist(rates);
  };

  return (
    <form onSubmit={handleManualSave} className="space-y-4">
      <p className="text-sm text-gray-600">
        Defina cómo cobra cada tipo de vehículo. Puede usar <strong>precio fijo</strong> (un
        solo valor por estadía), por hora, por fracción u otras modalidades.
      </p>

      {localError && <p className="text-sm text-red-600">{localError}</p>}

      {rates.map((rate, index) => {
        const meta = modeMeta(rate.billingMode);
        return (
        <div key={rate.clientKey} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Tarifa {index + 1}</h3>
            {!readOnly && (
              <button
                type="button"
                onClick={() => removeRate(index)}
                className="text-sm text-red-600"
              >
                Eliminar
              </button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tipo de vehículo *
              </label>
              <select
                className={fieldClass}
                value={rate.vehicleCategoryId}
                disabled={readOnly}
                onChange={(e) => updateRate(index, { vehicleCategoryId: e.target.value })}
              >
                <option value="">Seleccione</option>
                {categories.map((c) => (
                  <option key={String(c._id)} value={String(c._id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Modalidad de cobro *
              </label>
              <select
                className={fieldClass}
                value={rate.billingMode}
                disabled={readOnly}
                onChange={(e) => updateRate(index, { billingMode: e.target.value })}
              >
                {BILLING_MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              {meta?.hint && (
                <p className="mt-1 text-xs text-gray-500">{meta.hint}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {meta?.priceLabel ?? 'Precio *'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  className={`${fieldClass} pl-7 pr-3`}
                  placeholder={rate.billingMode === 'fixed' ? '4000' : '0'}
                  value={rate.value || ''}
                  disabled={readOnly}
                  onChange={(e) =>
                    updateRate(index, {
                      value: e.target.value === '' ? 0 : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          {rate.billingMode === 'hour_fraction' && (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Duración de la fracción (min)
                </label>
                <input
                  type="number"
                  min={1}
                  className={fieldClass}
                  disabled={readOnly}
                  placeholder="15"
                  value={rate.minFractionMinutes ?? ''}
                  onChange={(e) =>
                    updateRate(index, {
                      minFractionMinutes:
                        e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Precio por fracción (opcional)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  className={fieldClass}
                  disabled={readOnly}
                  placeholder="Usa el precio principal si vacío"
                  value={rate.fractionPrice ?? ''}
                  onChange={(e) =>
                    updateRate(index, {
                      fractionPrice:
                        e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          )}

          {advanced && (
            <div className="grid gap-3 border-t border-gray-100 pt-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Contexto</label>
                <select
                  className={fieldClass}
                  value={rate.contextType || 'normal'}
                  disabled={readOnly}
                  onChange={(e) => updateRate(index, { contextType: e.target.value })}
                >
                  {CONTEXT_TYPES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              {rate.billingMode !== 'fixed' && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Tiempo base (min)
                    </label>
                    <input
                      type="number"
                      min={0}
                      className={fieldClass}
                      disabled={readOnly}
                      value={rate.baseTimeMinutes ?? 0}
                      onChange={(e) =>
                        updateRate(index, { baseTimeMinutes: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Gracia (min)
                    </label>
                    <input
                      type="number"
                      min={0}
                      className={fieldClass}
                      disabled={readOnly}
                      value={rate.graceMinutes ?? 0}
                      onChange={(e) =>
                        updateRate(index, { graceMinutes: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
                </>
              )}
              {rate.billingMode === 'fixed' && (
                <p className="md:col-span-2 text-xs text-gray-500">
                  En precio fijo el monto no depende del tiempo ni de la gracia.
                </p>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Ventana inicio
                </label>
                <input
                  type="time"
                  className={fieldClass}
                  disabled={readOnly}
                  value={rate.windowStart ?? ''}
                  onChange={(e) => updateRate(index, { windowStart: e.target.value || undefined })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Ventana fin</label>
                <input
                  type="time"
                  className={fieldClass}
                  disabled={readOnly}
                  value={rate.windowEnd ?? ''}
                  onChange={(e) => updateRate(index, { windowEnd: e.target.value || undefined })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tope diario</label>
                <input
                  type="number"
                  min={0}
                  className={fieldClass}
                  disabled={readOnly}
                  value={rate.maxDailyCharge ?? ''}
                  onChange={(e) =>
                    updateRate(index, {
                      maxDailyCharge:
                        e.target.value === '' ? undefined : Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Estado</label>
                <select
                  className={fieldClass}
                  value={rate.status}
                  disabled={readOnly}
                  onChange={(e) =>
                    updateRate(index, { status: e.target.value as 'active' | 'inactive' })
                  }
                >
                  <option value="active">Activa</option>
                  <option value="inactive">Inactiva</option>
                </select>
              </div>
            </div>
          )}
        </div>
        );
      })}

      {!readOnly && (
        <button
          type="button"
          disabled={categories.length === 0}
          onClick={() => {
            const category = pickCategoryForNewRate(categories, rates);
            if (category) {
              setRates((prev) => [
                ...prev,
                emptyRate({ _id: String(category._id), name: category.name }),
              ]);
            }
          }}
          className="w-full rounded-lg border border-dashed px-4 py-2 text-sm text-primary-700 disabled:opacity-50"
        >
          + Agregar tarifa
        </button>
      )}

      {categories.length === 0 && (
        <p className="text-sm text-amber-700">
          Primero configure categorías de vehículos activas.
        </p>
      )}

      {!autosave && !readOnly && onCancel && (
        <SettingsFormActions isSaving={isSaving} onCancel={onCancel} />
      )}
      {autosave && isSaving && <p className="text-sm text-primary-600">Guardando...</p>}
    </form>
  );
}
