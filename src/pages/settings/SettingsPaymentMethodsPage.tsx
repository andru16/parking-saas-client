import { useState } from 'react';
import type { PaymentMethodConfig } from '@/api/settings';
import { SettingsFormActions, SettingsSectionShell } from '@/modules/settings/components/SettingsSectionShell';
import {
  useSaveSettingsSection,
  useSettingsSectionData,
} from '@/modules/settings/hooks/useSettingsSection';

export function SettingsPaymentMethodsPage() {
  const query = useSettingsSectionData('payment_methods');
  const save = useSaveSettingsSection('payment_methods');

  if (query.isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-400">Cargando métodos de pago...</p>
      </div>
    );
  }

  return (
    <SettingsSectionShell
      title="Métodos de pago"
      description="Active solo los que acepta su parqueadero. Esos serán los disponibles al cobrar en caja."
    >
      {({ readOnly, formKey, finishEditing, cancelEditing }) => (
        <PaymentMethodsForm
          key={formKey}
          initial={query.data?.data.methods ?? []}
          readOnly={readOnly}
          isSaving={save.isPending}
          onCancel={cancelEditing}
          onSave={async (methods) => {
            await save.mutateAsync({ methods });
            finishEditing();
          }}
        />
      )}
    </SettingsSectionShell>
  );
}

function PaymentMethodsForm({
  initial,
  readOnly,
  isSaving,
  onCancel,
  onSave,
}: {
  initial: PaymentMethodConfig[];
  readOnly: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (methods: PaymentMethodConfig[]) => Promise<void>;
}) {
  const [methods, setMethods] = useState(() =>
    initial.map((m, i) => ({ ...m, displayOrder: m.displayOrder ?? i })),
  );

  const update = (index: number, patch: Partial<PaymentMethodConfig>) => {
    setMethods((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= methods.length) return;
    setMethods((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((m, i) => ({ ...m, displayOrder: i }));
    });
  };

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave(methods.map((m, i) => ({ ...m, displayOrder: i })));
      }}
    >
      {methods.map((method, index) => (
        <div key={`${method.code}-${index}`} className="grid gap-3 rounded-lg border p-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Código</label>
            <input
              className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-50"
              value={method.code}
              disabled={readOnly || method.isSystem}
              onChange={(e) =>
                update(index, { code: e.target.value.toLowerCase().replace(/\s+/g, '_') })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Etiqueta</label>
            <input
              className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-50"
              value={method.label}
              disabled={readOnly}
              onChange={(e) => update(index, { label: e.target.value })}
            />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={method.enabled}
              onChange={(e) => update(index, { enabled: e.target.checked })}
            />
            Activo
          </label>
          {!readOnly && (
            <div className="flex items-end gap-2">
              <button type="button" className="text-sm text-gray-600" onClick={() => move(index, -1)}>
                ↑
              </button>
              <button type="button" className="text-sm text-gray-600" onClick={() => move(index, 1)}>
                ↓
              </button>
              {!method.isSystem && (
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() => setMethods((prev) => prev.filter((_, i) => i !== index))}
                >
                  Eliminar
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {!readOnly && (
        <button
          type="button"
          className="w-full rounded-lg border border-dashed py-2 text-sm text-primary-700"
          onClick={() =>
            setMethods((prev) => [
              ...prev,
              {
                code: `custom_${prev.length + 1}`,
                label: 'Nuevo método',
                enabled: true,
                displayOrder: prev.length,
                isSystem: false,
              },
            ])
          }
        >
          + Agregar método
        </button>
      )}

      {!readOnly && <SettingsFormActions isSaving={isSaving} onCancel={onCancel} />}
    </form>
  );
}
