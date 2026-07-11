import { useState } from 'react';
import type { MembershipPlanConfig } from '@/api/settings';
import { SettingsFormActions, SettingsSectionShell } from '@/modules/settings/components/SettingsSectionShell';
import {
  useSaveSettingsSection,
  useSettingsSectionData,
} from '@/modules/settings/hooks/useSettingsSection';

export function SettingsMembershipsPage() {
  const query = useSettingsSectionData('memberships');
  const save = useSaveSettingsSection('memberships');

  if (query.isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-400">Cargando membresías...</p>
      </div>
    );
  }

  return (
    <SettingsSectionShell
      title="Membresías"
      description="Planes, duraciones, beneficios y recordatorios de vencimiento."
    >
      {({ readOnly, formKey, finishEditing, cancelEditing }) => (
        <MembershipsForm
          key={formKey}
          initial={query.data?.data.plans ?? []}
          readOnly={readOnly}
          isSaving={save.isPending}
          onCancel={cancelEditing}
          onSave={async (plans) => {
            await save.mutateAsync({ plans });
            finishEditing();
          }}
        />
      )}
    </SettingsSectionShell>
  );
}

function MembershipsForm({
  initial,
  readOnly,
  isSaving,
  onCancel,
  onSave,
}: {
  initial: MembershipPlanConfig[];
  readOnly: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (plans: MembershipPlanConfig[]) => Promise<void>;
}) {
  const [plans, setPlans] = useState(initial);
  const field =
    'w-full rounded-lg border px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-50';

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave(plans);
      }}
    >
      {plans.map((plan, index) => (
        <div key={plan.id ?? `new-${index}`} className="space-y-3 rounded-lg border p-4">
          <div className="flex justify-between">
            <h3 className="font-medium">Plan {index + 1}</h3>
            {!readOnly && (
              <button
                type="button"
                className="text-sm text-red-600"
                onClick={() => setPlans((prev) => prev.filter((_, i) => i !== index))}
              >
                Eliminar
              </button>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              className={field}
              placeholder="Nombre"
              disabled={readOnly}
              value={plan.name}
              onChange={(e) =>
                setPlans((prev) =>
                  prev.map((p, i) => (i === index ? { ...p, name: e.target.value } : p)),
                )
              }
            />
            <input
              type="number"
              min={1}
              className={field}
              placeholder="Duración (días)"
              disabled={readOnly}
              value={plan.durationDays}
              onChange={(e) =>
                setPlans((prev) =>
                  prev.map((p, i) =>
                    i === index ? { ...p, durationDays: Number(e.target.value) || 1 } : p,
                  ),
                )
              }
            />
            <input
              type="number"
              min={0}
              className={field}
              placeholder="Precio"
              disabled={readOnly}
              value={plan.price}
              onChange={(e) =>
                setPlans((prev) =>
                  prev.map((p, i) =>
                    i === index ? { ...p, price: Number(e.target.value) || 0 } : p,
                  ),
                )
              }
            />
            <input
              type="number"
              min={0}
              className={field}
              placeholder="Recordatorio (días antes)"
              disabled={readOnly}
              value={plan.reminderDaysBefore}
              onChange={(e) =>
                setPlans((prev) =>
                  prev.map((p, i) =>
                    i === index
                      ? { ...p, reminderDaysBefore: Number(e.target.value) || 0 }
                      : p,
                  ),
                )
              }
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                disabled={readOnly}
                checked={plan.isActive}
                onChange={(e) =>
                  setPlans((prev) =>
                    prev.map((p, i) =>
                      i === index ? { ...p, isActive: e.target.checked } : p,
                    ),
                  )
                }
              />
              Activo
            </label>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700">
              Beneficios (uno por línea)
            </label>
            <textarea
              className={field}
              rows={2}
              disabled={readOnly}
              value={(plan.benefits ?? []).join('\n')}
              onChange={(e) =>
                setPlans((prev) =>
                  prev.map((p, i) =>
                    i === index
                      ? {
                          ...p,
                          benefits: e.target.value
                            .split('\n')
                            .map((b) => b.trim())
                            .filter(Boolean),
                        }
                      : p,
                  ),
                )
              }
            />
          </div>
        </div>
      ))}

      {!readOnly && (
        <button
          type="button"
          className="w-full rounded-lg border border-dashed py-2 text-sm text-primary-700"
          onClick={() =>
            setPlans((prev) => [
              ...prev,
              {
                name: 'Nuevo plan',
                durationDays: 30,
                price: 0,
                benefits: [],
                reminderDaysBefore: 3,
                isActive: true,
              },
            ])
          }
        >
          + Agregar plan
        </button>
      )}

      {!readOnly && <SettingsFormActions isSaving={isSaving} onCancel={onCancel} />}
    </form>
  );
}
