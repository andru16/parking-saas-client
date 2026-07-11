import { useCallback, useMemo, useRef, useState } from 'react';
import type { RateItem } from '@/api/setup';
import { SettingsFormActions } from '@/modules/settings/components/SettingsSectionShell';
import { BILLING_MODES } from '../../constants';
import { useDebouncedAutosave } from '../../hooks/useDebouncedAutosave';

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

function normalizeRate(rate: RateItem): RateItem {
  return {
    ...rate,
    id: rate.id ? String(rate.id) : undefined,
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

function emptyRate(category: CategoryOption): RateItem {
  return {
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

function modeMeta(billingMode: string) {
  return BILLING_MODES.find((m) => m.value === billingMode);
}

const fieldClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-600';

export function RatesStepForm({
  initialRates,
  categories,
  onSave,
  isSaving,
  readOnly = false,
  autosave = true,
  onCancel,
  advanced = false,
}: Props) {
  const [rates, setRates] = useState<RateItem[]>(() => initialRates.map(normalizeRate));
  const skipNextSaveRef = useRef(() => {});

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [String(c._id), { ...c, _id: String(c._id) }])),
    [categories],
  );

  const persist = useCallback(
    async (current: RateItem[]) => {
      const saved = await onSave(current);
      if (saved?.length) {
        skipNextSaveRef.current();
        setRates(saved.map(normalizeRate));
      }
    },
    [onSave],
  );

  const { skipNextSave } = useDebouncedAutosave(rates, persist, {
    enabled: autosave && !readOnly && rates.length > 0,
  });
  skipNextSaveRef.current = skipNextSave;

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
    if (!confirm('¿Eliminar esta tarifa?')) return;
    setRates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await onSave(rates);
    if (saved?.length) {
      setRates(saved.map(normalizeRate));
    }
  };

  return (
    <form onSubmit={handleManualSave} className="space-y-4">
      <p className="text-sm text-gray-600">
        Defina cómo cobra cada tipo de vehículo. Puede usar <strong>precio fijo</strong> (un
        solo valor por estadía), por hora, por fracción u otras modalidades.
      </p>

      {rates.map((rate, index) => {
        const meta = modeMeta(rate.billingMode);
        return (
        <div key={rate.id ?? `new-${index}`} className="space-y-3 rounded-lg border p-4">
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
            const firstCategory = categories[0];
            if (firstCategory) {
              setRates((prev) => [
                ...prev,
                emptyRate({ _id: String(firstCategory._id), name: firstCategory.name }),
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
