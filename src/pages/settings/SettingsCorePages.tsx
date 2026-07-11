import { SettingsSectionShell } from '@/modules/settings/components/SettingsSectionShell';
import {
  useSaveSettingsSection,
  useSettingsSectionData,
} from '@/modules/settings/hooks/useSettingsSection';
import { GeneralInfoStepForm } from '@/modules/setup/components/steps/GeneralInfoStepForm';
import { OperationalStepForm } from '@/modules/setup/components/steps/OperationalStepForm';
import { RatesStepForm } from '@/modules/setup/components/steps/RatesStepForm';
import { VehicleCategoriesStepForm } from '@/modules/setup/components/steps/VehicleCategoriesStepForm';
import type {
  GeneralInfoFormValues,
  OperationalFormValues,
} from '@/modules/setup/schemas/setup.schemas';

function LoadingPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 mb-6 text-sm text-gray-600">{description}</p>
      <p className="text-sm text-gray-400">Cargando configuración...</p>
    </div>
  );
}

export function SettingsGeneralPage() {
  const query = useSettingsSectionData('general');
  const save = useSaveSettingsSection('general');

  if (query.isLoading) {
    return (
      <LoadingPanel title="Información general" description="Datos comerciales del parqueadero." />
    );
  }

  return (
    <SettingsSectionShell
      title="Información general"
      description="Datos comerciales, contacto, zona horaria y moneda."
    >
      {({ readOnly, formKey, finishEditing, cancelEditing }) => (
        <GeneralInfoStepForm
          key={formKey}
          initialData={query.data?.data}
          isSaving={save.isPending}
          readOnly={readOnly}
          autosave={false}
          onCancel={cancelEditing}
          onSave={async (data: GeneralInfoFormValues) => {
            await save.mutateAsync(data);
            finishEditing();
          }}
        />
      )}
    </SettingsSectionShell>
  );
}

export function SettingsOperationalPage() {
  const query = useSettingsSectionData('operational');
  const save = useSaveSettingsSection('operational');

  if (query.isLoading) {
    return <LoadingPanel title="Operación" description="Horarios y capacidad." />;
  }

  return (
    <SettingsSectionShell title="Operación" description="Horarios, capacidad y reglas operativas.">
      {({ readOnly, formKey, finishEditing, cancelEditing }) => (
        <OperationalStepForm
          key={formKey}
          initialData={query.data?.data}
          isSaving={save.isPending}
          readOnly={readOnly}
          autosave={false}
          onCancel={cancelEditing}
          onSave={async (data: OperationalFormValues) => {
            await save.mutateAsync(data);
            finishEditing();
          }}
        />
      )}
    </SettingsSectionShell>
  );
}

export function SettingsCategoriesPage() {
  const query = useSettingsSectionData('vehicle_categories');
  const save = useSaveSettingsSection('vehicle_categories');

  if (query.isLoading) {
    return (
      <LoadingPanel title="Categorías de vehículos" description="Tipos operativos." />
    );
  }

  return (
    <SettingsSectionShell
      title="Categorías de vehículos"
      description="Crear, editar, activar y reordenar. No se puede eliminar una categoría en uso."
    >
      {({ readOnly, formKey, finishEditing, cancelEditing }) => (
        <VehicleCategoriesStepForm
          key={formKey}
          initialCategories={query.data?.data.categories ?? []}
          isSaving={save.isPending}
          readOnly={readOnly}
          autosave={false}
          onCancel={cancelEditing}
          showExtendedRequirements
          onSave={async (categories) => {
            const response = await save.mutateAsync({ categories });
            finishEditing();
            return response.data.data.categories;
          }}
        />
      )}
    </SettingsSectionShell>
  );
}

export function SettingsRatesPage() {
  const query = useSettingsSectionData('rates');
  const save = useSaveSettingsSection('rates');

  if (query.isLoading) {
    return <LoadingPanel title="Motor de tarifas" description="Precios por categoría." />;
  }

  return (
    <SettingsSectionShell
      title="Motor de tarifas"
      description="Tarifas por categoría, modalidad, ventanas y topes."
    >
      {({ readOnly, formKey, finishEditing, cancelEditing }) => (
        <RatesStepForm
          key={formKey}
          initialRates={query.data?.data.rates ?? []}
          categories={query.data?.data.categories ?? []}
          isSaving={save.isPending}
          readOnly={readOnly}
          autosave={false}
          advanced
          onCancel={cancelEditing}
          onSave={async (rates) => {
            const response = await save.mutateAsync({ rates });
            finishEditing();
            return response.data.data.rates;
          }}
        />
      )}
    </SettingsSectionShell>
  );
}
