import { useState } from 'react';
import type { CashPointConfig, CashPolicies, CashTerminal } from '@/api/settings';
import { SettingsFormActions, SettingsSectionShell } from '@/modules/settings/components/SettingsSectionShell';
import {
  useSaveSettingsSection,
  useSettingsSectionData,
} from '@/modules/settings/hooks/useSettingsSection';
import { usePlanEntitlements } from '@/modules/billing/usePlanEntitlements';

export function SettingsCashPage() {
  const query = useSettingsSectionData('cash');
  const save = useSaveSettingsSection('cash');
  const { limits, canAddMore, limitMessage } = usePlanEntitlements();

  if (query.isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-400">Cargando caja...</p>
      </div>
    );
  }

  const maxCash =
    (query.data?.data as { limits?: { maxCashRegisters?: number | null } } | undefined)?.limits
      ?.maxCashRegisters ?? limits.maxCashRegisters;

  return (
    <SettingsSectionShell
      title="Caja"
      description="Puntos de caja, terminales (estructura) y políticas de apertura/cierre."
    >
      {({ readOnly, formKey, finishEditing, cancelEditing }) => (
        <CashForm
          key={formKey}
          initialPoints={query.data?.data.cashPoints ?? []}
          initialPolicies={
            query.data?.data.policies ?? {
              suggestedOpeningFloat: 0,
              requireOpeningFloat: false,
              requireClosingCount: true,
              allowMultipleOpenSessions: false,
            }
          }
          initialTerminals={query.data?.data.terminals ?? []}
          maxCashRegisters={maxCash ?? null}
          canAddMore={canAddMore}
          limitMessage={limitMessage('maxCashRegisters')}
          readOnly={readOnly}
          isSaving={save.isPending}
          onCancel={cancelEditing}
          onSave={async (payload) => {
            await save.mutateAsync(payload);
            finishEditing();
          }}
        />
      )}
    </SettingsSectionShell>
  );
}

function CashForm({
  initialPoints,
  initialPolicies,
  initialTerminals,
  maxCashRegisters,
  canAddMore,
  limitMessage: cashLimitMessage,
  readOnly,
  isSaving,
  onCancel,
  onSave,
}: {
  initialPoints: CashPointConfig[];
  initialPolicies: CashPolicies;
  initialTerminals: CashTerminal[];
  maxCashRegisters: number | null;
  canAddMore: (current: number, key: 'maxCashRegisters') => boolean;
  limitMessage: string | null;
  readOnly: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (payload: {
    cashPoints: CashPointConfig[];
    policies: CashPolicies;
    terminals: CashTerminal[];
  }) => Promise<void>;
}) {
  const [cashPoints, setCashPoints] = useState(initialPoints);
  const [policies, setPolicies] = useState(initialPolicies);
  const [terminals, setTerminals] = useState(initialTerminals);
  const atCashLimit = !canAddMore(cashPoints.length, 'maxCashRegisters');

  return (
    <form
      className="space-y-8"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave({ cashPoints, policies, terminals });
      }}
    >
      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-medium text-gray-900">Puntos de caja</h3>
          {maxCashRegisters != null && (
            <p className="text-xs text-gray-500">
              Cupo del plan: {cashPoints.length} / {maxCashRegisters}
            </p>
          )}
        </div>
        {atCashLimit && cashLimitMessage && !readOnly && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {cashLimitMessage}
          </p>
        )}
        {cashPoints.map((point, index) => (
          <div key={point.id ?? `new-${index}`} className="grid gap-3 rounded-lg border p-4 md:grid-cols-3">
            <input
              className="rounded-lg border px-3 py-2 disabled:bg-gray-50"
              placeholder="Nombre"
              disabled={readOnly}
              value={point.name}
              onChange={(e) =>
                setCashPoints((prev) =>
                  prev.map((p, i) => (i === index ? { ...p, name: e.target.value } : p)),
                )
              }
            />
            <select
              className="rounded-lg border px-3 py-2 disabled:bg-gray-50"
              disabled={readOnly}
              value={point.status}
              onChange={(e) =>
                setCashPoints((prev) =>
                  prev.map((p, i) =>
                    i === index
                      ? { ...p, status: e.target.value as 'active' | 'inactive' }
                      : p,
                  ),
                )
              }
            >
              <option value="active">Activa</option>
              <option value="inactive">Inactiva</option>
            </select>
            {!readOnly && cashPoints.length > 1 && (
              <button
                type="button"
                className="text-sm text-red-600"
                onClick={() => setCashPoints((prev) => prev.filter((_, i) => i !== index))}
              >
                Eliminar
              </button>
            )}
          </div>
        ))}
        {!readOnly && (
          <button
            type="button"
            disabled={atCashLimit}
            title={atCashLimit ? (cashLimitMessage ?? undefined) : undefined}
            className="rounded-lg border border-dashed px-3 py-2 text-sm text-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() =>
              setCashPoints((prev) => [
                ...prev,
                { name: `Caja ${prev.length + 1}`, status: 'active', displayOrder: prev.length },
              ])
            }
          >
            + Agregar caja
          </button>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-gray-900">Políticas</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-gray-700">Fondo inicial sugerido</label>
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border px-3 py-2 disabled:bg-gray-50"
              disabled={readOnly}
              value={policies.suggestedOpeningFloat}
              onChange={(e) =>
                setPolicies((p) => ({
                  ...p,
                  suggestedOpeningFloat: Number(e.target.value) || 0,
                }))
              }
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {(
            [
              ['requireOpeningFloat', 'Exigir fondo al abrir'],
              ['requireClosingCount', 'Exigir conteo al cerrar'],
              ['allowMultipleOpenSessions', 'Permitir varias cajas abiertas'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                disabled={readOnly}
                checked={policies[key]}
                onChange={(e) => setPolicies((p) => ({ ...p, [key]: e.target.checked }))}
              />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="font-medium text-gray-900">Terminales (estructura preparada)</h3>
        <p className="text-xs text-gray-500">
          Reservado para dispositivos POS futuros. Puede registrar nombres y códigos.
        </p>
        {terminals.map((t, index) => (
          <div key={index} className="grid gap-3 rounded-lg border p-3 md:grid-cols-3">
            <input
              className="rounded-lg border px-3 py-2 disabled:bg-gray-50"
              placeholder="Nombre"
              disabled={readOnly}
              value={t.name}
              onChange={(e) =>
                setTerminals((prev) =>
                  prev.map((x, i) => (i === index ? { ...x, name: e.target.value } : x)),
                )
              }
            />
            <input
              className="rounded-lg border px-3 py-2 disabled:bg-gray-50"
              placeholder="Código"
              disabled={readOnly}
              value={t.code}
              onChange={(e) =>
                setTerminals((prev) =>
                  prev.map((x, i) => (i === index ? { ...x, code: e.target.value } : x)),
                )
              }
            />
            <select
              className="rounded-lg border px-3 py-2 disabled:bg-gray-50"
              disabled={readOnly}
              value={t.status}
              onChange={(e) =>
                setTerminals((prev) =>
                  prev.map((x, i) =>
                    i === index
                      ? { ...x, status: e.target.value as 'active' | 'inactive' }
                      : x,
                  ),
                )
              }
            >
              <option value="inactive">Inactivo</option>
              <option value="active">Activo</option>
            </select>
          </div>
        ))}
        {!readOnly && (
          <button
            type="button"
            className="rounded-lg border border-dashed px-3 py-2 text-sm text-primary-700"
            onClick={() =>
              setTerminals((prev) => [
                ...prev,
                { name: '', code: '', status: 'inactive' },
              ])
            }
          >
            + Agregar terminal
          </button>
        )}
      </section>

      {!readOnly && <SettingsFormActions isSaving={isSaving} onCancel={onCancel} />}
    </form>
  );
}
