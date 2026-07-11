import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { OperationalData } from '@/api/setup';
import { SettingsFormActions } from '@/modules/settings/components/SettingsSectionShell';
import { operationalSchema, type OperationalFormValues } from '../../schemas/setup.schemas';
import { CheckboxInput, FormField, TextInput } from '../FormField';

interface Props {
  initialData?: OperationalData;
  onSave: (data: OperationalFormValues) => Promise<void>;
  isSaving: boolean;
  readOnly?: boolean;
  autosave?: boolean;
  onCancel?: () => void;
}

export function OperationalStepForm({
  initialData,
  onSave,
  isSaving,
  readOnly = false,
  autosave = true,
  onCancel,
}: Props) {
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OperationalFormValues>({
    resolver: zodResolver(operationalSchema),
    defaultValues: {
      operate24Hours: initialData?.operate24Hours ?? false,
      openTime: initialData?.openTime || '',
      closeTime: initialData?.closeTime || '',
      allowOvercapacity: initialData?.allowOvercapacity ?? false,
      graceMinutes: initialData?.graceMinutes ?? 0,
      maxCapacity: initialData?.maxCapacity ?? null,
    },
  });

  const operate24Hours = watch('operate24Hours');

  useEffect(() => {
    if (!autosave || readOnly) return;

    let timer: ReturnType<typeof setTimeout>;
    const subscription = watch(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        void handleSubmit((data) => onSaveRef.current(data))();
      }, 2000);
    });
    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, [watch, handleSubmit, autosave, readOnly]);

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSaveRef.current(data);
      })}
      className="space-y-4"
    >
      <fieldset disabled={readOnly} className="min-w-0 space-y-4 border-0 p-0">
        <label className="flex items-center gap-2 text-sm">
          <CheckboxInput {...register('operate24Hours')} />
          Opera 24 horas
        </label>

        {!operate24Hours && (
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Hora de apertura *" error={errors.openTime?.message}>
              <TextInput type="time" {...register('openTime')} />
            </FormField>
            <FormField label="Hora de cierre *" error={errors.closeTime?.message}>
              <TextInput type="time" {...register('closeTime')} />
            </FormField>
          </div>
        )}

        <label className="flex items-center gap-2 text-sm">
          <CheckboxInput {...register('allowOvercapacity')} />
          Permitir sobrecupo
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Tiempo de gracia (minutos) *" error={errors.graceMinutes?.message}>
            <TextInput
              type="number"
              min={0}
              {...register('graceMinutes', { valueAsNumber: true })}
            />
          </FormField>
          <FormField label="Cantidad de plazas (opcional)" error={errors.maxCapacity?.message}>
            <TextInput
              type="number"
              min={1}
              {...register('maxCapacity', { valueAsNumber: true })}
            />
          </FormField>
        </div>
      </fieldset>

      {!autosave && !readOnly && onCancel && (
        <SettingsFormActions isSaving={isSaving} onCancel={onCancel} />
      )}
      {autosave && isSaving && <p className="text-sm text-primary-600">Guardando...</p>}
    </form>
  );
}
