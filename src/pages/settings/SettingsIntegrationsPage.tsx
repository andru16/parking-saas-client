import { useState } from 'react';
import type { IntegrationsConfig } from '@/api/settings';
import { SettingsFormActions, SettingsSectionShell } from '@/modules/settings/components/SettingsSectionShell';
import {
  useSaveSettingsSection,
  useSettingsSectionData,
} from '@/modules/settings/hooks/useSettingsSection';

const LABELS: Record<keyof IntegrationsConfig, string> = {
  whatsapp: 'WhatsApp',
  email: 'Correo',
  qr: 'Código QR',
  plateReaders: 'Lectores de placas',
  barriers: 'Barreras automáticas',
  api: 'API / Webhooks',
};

export function SettingsIntegrationsPage() {
  const query = useSettingsSectionData('integrations');
  const save = useSaveSettingsSection('integrations');

  if (query.isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-400">Cargando integraciones...</p>
      </div>
    );
  }

  return (
    <SettingsSectionShell
      title="Integraciones"
      description="Placeholders para conexiones futuras. Puede activar flags y guardar notas."
    >
      {({ readOnly, formKey, finishEditing, cancelEditing }) => (
        <IntegrationsForm
          key={formKey}
          initial={query.data?.data.integrations}
          readOnly={readOnly}
          isSaving={save.isPending}
          onCancel={cancelEditing}
          onSave={async (integrations) => {
            await save.mutateAsync({ integrations });
            finishEditing();
          }}
        />
      )}
    </SettingsSectionShell>
  );
}

function IntegrationsForm({
  initial,
  readOnly,
  isSaving,
  onCancel,
  onSave,
}: {
  initial?: IntegrationsConfig;
  readOnly: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (integrations: IntegrationsConfig) => Promise<void>;
}) {
  const [integrations, setIntegrations] = useState<IntegrationsConfig>(
    initial ?? {
      whatsapp: { enabled: false, phoneNumber: null, notes: '' },
      email: { enabled: false, fromAddress: null },
      qr: { enabled: false },
      plateReaders: { enabled: false, provider: null },
      barriers: { enabled: false, provider: null },
      api: { enabled: false, webhookUrl: null },
    },
  );

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave(integrations);
      }}
    >
      {(Object.keys(LABELS) as (keyof IntegrationsConfig)[]).map((key) => {
        const item = integrations[key] as { enabled: boolean } & Record<string, unknown>;
        return (
          <div key={key} className="rounded-lg border p-4">
            <label className="flex items-center justify-between gap-3">
              <span className="font-medium text-gray-900">{LABELS[key]}</span>
              <span className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  disabled={readOnly}
                  checked={Boolean(item.enabled)}
                  onChange={(e) =>
                    setIntegrations((prev) => ({
                      ...prev,
                      [key]: { ...prev[key], enabled: e.target.checked },
                    }))
                  }
                />
                Habilitado
              </span>
            </label>
            <p className="mt-2 text-xs text-gray-500">
              Integración preparada — la conexión real se implementará en una fase posterior.
            </p>
            {key === 'whatsapp' && (
              <input
                className="mt-3 w-full rounded-lg border px-3 py-2 disabled:bg-gray-50"
                placeholder="Teléfono / notas"
                disabled={readOnly}
                value={(integrations.whatsapp.phoneNumber as string) ?? ''}
                onChange={(e) =>
                  setIntegrations((prev) => ({
                    ...prev,
                    whatsapp: { ...prev.whatsapp, phoneNumber: e.target.value || null },
                  }))
                }
              />
            )}
            {key === 'api' && (
              <input
                className="mt-3 w-full rounded-lg border px-3 py-2 disabled:bg-gray-50"
                placeholder="Webhook URL"
                disabled={readOnly}
                value={integrations.api.webhookUrl ?? ''}
                onChange={(e) =>
                  setIntegrations((prev) => ({
                    ...prev,
                    api: { ...prev.api, webhookUrl: e.target.value || null },
                  }))
                }
              />
            )}
          </div>
        );
      })}

      {!readOnly && <SettingsFormActions isSaving={isSaving} onCancel={onCancel} />}
    </form>
  );
}
