import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { GeneralInfoData } from '@/api/setup';
import { LocationFields } from '@/modules/locations/LocationFields';
import { SettingsFormActions } from '@/modules/settings/components/SettingsSectionShell';
import { CURRENCIES, DATE_FORMATS, TIMEZONES } from '../../constants';
import { generalInfoSchema, pickAllowed, type GeneralInfoFormValues } from '../../schemas/setup.schemas';
import { FormField, SelectInput, TextInput } from '../FormField';
import type { SetupStepSubmit } from '../../types';

interface Props {
  initialData?: GeneralInfoData;
  onSave: (data: GeneralInfoFormValues) => Promise<void>;
  isSaving: boolean;
  /** Solo lectura (configuración). Por defecto editable. */
  readOnly?: boolean;
  /** Autosave con debounce (wizard). En configuración usar false. */
  autosave?: boolean;
  onCancel?: () => void;
  /** Registra validación+guardado al pulsar Siguiente en el wizard. */
  registerStepSubmit?: (fn: SetupStepSubmit) => () => void;
}

export function GeneralInfoStepForm({
  initialData,
  onSave,
  isSaving,
  readOnly = false,
  autosave = true,
  onCancel,
  registerStepSubmit,
}: Props) {
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<GeneralInfoFormValues>({
    resolver: zodResolver(generalInfoSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      commercialName: initialData?.commercialName ?? '',
      legalName: initialData?.legalName ?? '',
      taxId: initialData?.taxId ?? '',
      address: initialData?.address ?? '',
      city: initialData?.city ?? '',
      stateOrDepartment: initialData?.stateOrDepartment ?? '',
      country: initialData?.country || 'Colombia',
      phone: initialData?.phone ?? '',
      email: initialData?.email ?? '',
      timezone: pickAllowed(initialData?.timezone, TIMEZONES, 'America/Bogota'),
      currency: pickAllowed(initialData?.currency, CURRENCIES, 'COP'),
      dateFormat: pickAllowed(initialData?.dateFormat, DATE_FORMATS, 'DD/MM/YYYY'),
      timeFormat: (initialData?.timeFormat as '12h' | '24h') || '24h',
    },
  });

  const country = watch('country');
  const stateOrDepartment = watch('stateOrDepartment');
  const city = watch('city');

  useEffect(() => {
    if (!registerStepSubmit) return;
    return registerStepSubmit(async () => {
      let ok = false;
      await handleSubmit(async (data) => {
        await onSaveRef.current(data);
        ok = true;
      })();
      return ok;
    });
  }, [registerStepSubmit, handleSubmit]);

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
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Nombre comercial *" error={errors.commercialName?.message}>
            <TextInput {...register('commercialName')} />
          </FormField>
          <FormField label="Razón social" error={errors.legalName?.message}>
            <TextInput {...register('legalName')} />
          </FormField>
          <FormField label="NIT / Documento fiscal" error={errors.taxId?.message}>
            <TextInput {...register('taxId')} />
          </FormField>
          <FormField label="Teléfono *" error={errors.phone?.message}>
            <TextInput {...register('phone')} />
          </FormField>
          <FormField label="Correo electrónico *" error={errors.email?.message}>
            <TextInput type="email" {...register('email')} />
          </FormField>
          <FormField label="Dirección *" error={errors.address?.message}>
            <TextInput {...register('address')} />
          </FormField>
        </div>

        <LocationFields
          disabled={readOnly}
          value={{ country, stateOrDepartment, city }}
          onChange={(next) => {
            setValue('country', next.country, { shouldDirty: true, shouldValidate: true });
            setValue('stateOrDepartment', next.stateOrDepartment, {
              shouldDirty: true,
              shouldValidate: true,
            });
            setValue('city', next.city, { shouldDirty: true, shouldValidate: true });
          }}
          errors={{
            country: errors.country?.message,
            stateOrDepartment: errors.stateOrDepartment?.message,
            city: errors.city?.message,
          }}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Zona horaria *" error={errors.timezone?.message}>
            <SelectInput {...register('timezone')}>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Moneda *" error={errors.currency?.message}>
            <SelectInput {...register('currency')}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Formato de fecha *" error={errors.dateFormat?.message}>
            <SelectInput {...register('dateFormat')}>
              {DATE_FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Formato de hora *" error={errors.timeFormat?.message}>
            <SelectInput {...register('timeFormat')}>
              <option value="12h">12 horas</option>
              <option value="24h">24 horas</option>
            </SelectInput>
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
