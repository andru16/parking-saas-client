import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { VehicleCategoryItem } from '@/api/setup';
import { SettingsFormActions } from '@/modules/settings/components/SettingsSectionShell';
import { useDebouncedAutosave } from '../../hooks/useDebouncedAutosave';
import type { SetupStepSubmit } from '../../types';
import { confirmAction, showInfo } from '@/lib/dialogs';

interface Props {
  initialCategories: VehicleCategoryItem[];
  onSave: (categories: VehicleCategoryItem[]) => Promise<VehicleCategoryItem[] | void>;
  isSaving: boolean;
  readOnly?: boolean;
  autosave?: boolean;
  onCancel?: () => void;
  /** Mostrar foto/observaciones (settings). */
  showExtendedRequirements?: boolean;
  registerStepSubmit?: (fn: SetupStepSubmit) => () => void;
}

/** Opciones fijas del setup — el resto de campos se rellenan con valores por defecto. */
const CATEGORY_PRESETS = [
  { name: 'Carro', icon: 'car', color: '#3B82F6' },
  { name: 'Motos', icon: 'motorcycle', color: '#F59E0B' },
  { name: 'Bicicleta', icon: 'bicycle', color: '#10B981' },
] as const;

type PresetName = (typeof CATEGORY_PRESETS)[number]['name'];

function createCategory(name: PresetName, displayOrder: number): VehicleCategoryItem {
  const preset = CATEGORY_PRESETS.find((p) => p.name === name)!;
  return {
    name: preset.name,
    description: '',
    icon: preset.icon,
    color: preset.color,
    displayOrder,
    isActive: true,
    requirements: {
      requiresPlate: name !== 'Bicicleta',
      requiresOwner: false,
      requiresPhoto: false,
      requiresNotes: false,
    },
  };
}

const fieldClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-600';

export function VehicleCategoriesStepForm({
  initialCategories,
  onSave,
  isSaving,
  readOnly = false,
  autosave = true,
  onCancel,
  showExtendedRequirements = false,
  registerStepSubmit,
}: Props) {
  const [categories, setCategories] = useState<VehicleCategoryItem[]>(() =>
    initialCategories.map((c) => ({ ...c, id: c.id ? String(c.id) : undefined })),
  );
  const [localError, setLocalError] = useState<string | null>(null);
  const skipNextSaveRef = useRef(() => {});

  const persist = useCallback(
    async (current: VehicleCategoryItem[]) => {
      const saved = await onSave(current);
      if (saved?.length) {
        skipNextSaveRef.current();
        setCategories(saved.map((c) => ({ ...c, id: c.id ? String(c.id) : undefined })));
      }
    },
    [onSave],
  );

  const { skipNextSave } = useDebouncedAutosave(categories, persist, {
    enabled: autosave && !readOnly && categories.length > 0,
  });
  skipNextSaveRef.current = skipNextSave;

  useEffect(() => {
    if (!registerStepSubmit) return;
    return registerStepSubmit(async () => {
      setLocalError(null);
      if (categories.length === 0) {
        setLocalError('Agregue al menos una categoría de vehículo');
        return false;
      }
      if (!categories.some((c) => c.isActive)) {
        setLocalError('Active al menos una categoría de vehículo');
        return false;
      }
      if (categories.some((c) => !c.name.trim())) {
        setLocalError('Todas las categorías deben tener nombre');
        return false;
      }
      await persist(categories);
      return true;
    });
  }, [registerStepSubmit, categories, persist]);

  const availablePresets = useMemo(() => {
    const used = new Set(categories.map((c) => c.name));
    return CATEGORY_PRESETS.filter((p) => !used.has(p.name));
  }, [categories]);

  const updateCategory = (index: number, patch: Partial<VehicleCategoryItem>) => {
    if (readOnly) return;
    setCategories((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const changeCategoryType = (index: number, name: PresetName) => {
    if (readOnly) return;
    const preset = CATEGORY_PRESETS.find((p) => p.name === name)!;
    setCategories((prev) =>
      prev.map((c, i) =>
        i === index
          ? {
              ...c,
              name: preset.name,
              icon: preset.icon,
              color: preset.color,
              description: '',
              requirements: {
                ...c.requirements,
                requiresPlate: name !== 'Bicicleta',
                requiresPhoto: false,
                requiresNotes: false,
              },
            }
          : c,
      ),
    );
  };

  const moveCategory = (index: number, direction: -1 | 1) => {
    if (readOnly) return;
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    setCategories((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((c, i) => ({ ...c, displayOrder: i }));
    });
  };

  const removeCategory = (index: number) => {
    if (readOnly) return;
    const category = categories[index];
    void (async () => {
      if (category?.inUse) {
        await showInfo(
          'Categoría en uso',
          'Esta categoría está en uso. Desactívela en lugar de eliminarla.',
        );
        return;
      }
      const ok = await confirmAction({
        title: '¿Eliminar esta categoría?',
        text: category?.name ? `Se eliminará “${category.name}”.` : undefined,
        confirmText: 'Eliminar',
        danger: true,
      });
      if (!ok) return;
      setCategories((prev) => prev.filter((_, i) => i !== index));
    })();
  };

  const addCategory = () => {
    if (readOnly) return;
    const next = availablePresets[0];
    if (!next) return;
    setCategories((prev) => [...prev, createCategory(next.name, prev.length)]);
  };

  const handleManualSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await onSave(categories);
    if (saved?.length) {
      setCategories(saved.map((c) => ({ ...c, id: c.id ? String(c.id) : undefined })));
    }
  };

  return (
    <form onSubmit={handleManualSave} className="space-y-4">
      <p className="text-sm text-gray-600">
        Seleccione las categorías que opera su parqueadero. Puede activar o desactivar cada una y
        indicar si requiere placa o propietario.
      </p>

      {localError && <p className="text-sm text-red-600">{localError}</p>}

      {categories.map((category, index) => {
        const optionsForRow = CATEGORY_PRESETS.filter(
          (p) => p.name === category.name || !categories.some((c) => c.name === p.name),
        );

        return (
          <div key={category.id ?? `new-${index}`} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Categoría {index + 1}</h3>
                {category.inUse && (
                  <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
                    En uso
                  </span>
                )}
              </div>
              {!readOnly && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => moveCategory(index, -1)}
                    className="text-sm text-gray-600"
                    aria-label="Subir"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveCategory(index, 1)}
                    className="text-sm text-gray-600"
                    aria-label="Bajar"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCategory(index)}
                    className="text-sm text-red-600 disabled:opacity-40"
                    disabled={Boolean(category.inUse)}
                    title={
                      category.inUse
                        ? 'No se puede eliminar: categoría en uso'
                        : 'Eliminar'
                    }
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tipo *</label>
              <select
                className={fieldClass}
                disabled={readOnly}
                value={
                  CATEGORY_PRESETS.some((p) => p.name === category.name) ? category.name : ''
                }
                onChange={(e) => changeCategoryType(index, e.target.value as PresetName)}
              >
                {!CATEGORY_PRESETS.some((p) => p.name === category.name) && (
                  <option value="" disabled>
                    Seleccione tipo
                  </option>
                )}
                {optionsForRow.map((preset) => (
                  <option key={preset.name} value={preset.name}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 disabled:cursor-not-allowed"
                  disabled={readOnly}
                  checked={category.isActive}
                  onChange={(e) => updateCategory(index, { isActive: e.target.checked })}
                />
                Activa
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 disabled:cursor-not-allowed"
                  disabled={readOnly}
                  checked={category.requirements.requiresPlate}
                  onChange={(e) =>
                    updateCategory(index, {
                      requirements: {
                        ...category.requirements,
                        requiresPlate: e.target.checked,
                      },
                    })
                  }
                />
                Requiere placa
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 disabled:cursor-not-allowed"
                  disabled={readOnly}
                  checked={category.requirements.requiresOwner}
                  onChange={(e) =>
                    updateCategory(index, {
                      requirements: {
                        ...category.requirements,
                        requiresOwner: e.target.checked,
                      },
                    })
                  }
                />
                Requiere propietario
              </label>
              {showExtendedRequirements && (
                <>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 disabled:cursor-not-allowed"
                      disabled={readOnly}
                      checked={category.requirements.requiresPhoto}
                      onChange={(e) =>
                        updateCategory(index, {
                          requirements: {
                            ...category.requirements,
                            requiresPhoto: e.target.checked,
                          },
                        })
                      }
                    />
                    Requiere fotografía
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 disabled:cursor-not-allowed"
                      disabled={readOnly}
                      checked={category.requirements.requiresNotes}
                      onChange={(e) =>
                        updateCategory(index, {
                          requirements: {
                            ...category.requirements,
                            requiresNotes: e.target.checked,
                          },
                        })
                      }
                    />
                    Requiere observaciones
                  </label>
                </>
              )}
            </div>
          </div>
        );
      })}

      {!readOnly && (
        <button
          type="button"
          onClick={addCategory}
          disabled={availablePresets.length === 0}
          className="w-full rounded-lg border border-dashed px-4 py-2 text-sm text-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {availablePresets.length === 0
            ? 'Ya agregó todas las categorías disponibles'
            : '+ Agregar categoría'}
        </button>
      )}

      {!autosave && !readOnly && onCancel && (
        <SettingsFormActions isSaving={isSaving} onCancel={onCancel} />
      )}
      {autosave && isSaving && <p className="text-sm text-primary-600">Guardando...</p>}
    </form>
  );
}
