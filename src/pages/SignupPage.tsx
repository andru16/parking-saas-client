import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { signupSchema, type SignupFormValues } from '@/modules/signup/signup.schema';
import { useSignupMutation } from '@/modules/signup/useSignupMutation';
import type { ApiErrorResponse } from '@/api/signup';
import { HoneypotFields, useFormStartedAt } from '@/lib/validation/HoneypotFields';
import { LocationFields } from '@/modules/locations/LocationFields';

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20';

const PLAN_LABELS: Record<'trial' | 'starter' | 'professional' | 'enterprise', string> = {
  trial: 'Trial (prueba gratuita)',
  starter: 'Básico',
  professional: 'Profesional',
  enterprise: 'Enterprise',
};

const VALID_PLAN_CODES = new Set(Object.keys(PLAN_LABELS));

function resolvePlanFromSearchParam(plan: string | null) {
  if (plan && VALID_PLAN_CODES.has(plan)) {
    return plan as keyof typeof PLAN_LABELS;
  }
  return 'trial' as const;
}

export function SignupPage() {
  const [searchParams] = useSearchParams();
  const initialPlanCode = resolvePlanFromSearchParam(searchParams.get('plan'));
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formStartedAt = useFormStartedAt();

  const signupMutation = useSignupMutation();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      planCode: initialPlanCode,
      admin: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
      },
      organization: {
        name: '',
        city: '',
        stateOrDepartment: '',
        country: 'Colombia',
        phone: '',
      },
      consents: {
        privacyPolicyAccepted: false,
        marketingOptIn: false,
      },
      website: '',
      formStartedAt,
    },
  });

  const orgCountry = watch('organization.country');
  const orgDepartment = watch('organization.stateOrDepartment');
  const orgCity = watch('organization.city');
  const selectedPlanCode = watch('planCode');
  const privacyAccepted = watch('consents.privacyPolicyAccepted') === true;

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setFieldErrors({});
    setSuccessMessage(null);

    try {
      const response = await signupMutation.mutateAsync({
        planCode: values.planCode,
        admin: values.admin,
        organization: {
          ...values.organization,
          phone: values.organization.phone || undefined,
        },
        consents: {
          privacyPolicyAccepted: values.consents.privacyPolicyAccepted === true,
          marketingOptIn: Boolean(values.consents.marketingOptIn),
        },
        website: values.website || '',
        formStartedAt: values.formStartedAt,
      });

      setSuccessEmail(values.admin.email);
      setSuccessMessage(response.data?.message ?? response.message);
    } catch (error) {
      if (isAxiosError<ApiErrorResponse>(error) && error.response?.data) {
        const { message, errors: apiErrors } = error.response.data;
        setServerError(message);

        if (apiErrors?.length) {
          const mapped: Record<string, string> = {};
          for (const item of apiErrors) {
            if (item.field) {
              mapped[item.field] = item.message;
            }
          }
          setFieldErrors(mapped);
        }
        return;
      }

      setServerError('No se pudo completar el registro. Intenta de nuevo.');
    }
  });

  const isLoading = isSubmitting || signupMutation.isPending;

  if (successMessage && successEmail) {
    return (
      <div className="rounded-lg border border-teal-200 bg-teal-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
          <svg className="h-6 w-6 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Revisa tu correo</h2>
        <p className="mt-3 text-gray-600">{successMessage}</p>
        
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            to={`/verificar-email?email=${encodeURIComponent(successEmail)}`}
            className="inline-block rounded-lg border border-teal-300 bg-white px-5 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-50"
          >
            Reenviar enlace
          </Link>
          <Link
            to="/login"
            className="inline-block rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Ir a iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <form
        onSubmit={onSubmit}
        noValidate
        className="relative space-y-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <HoneypotFields websiteRegister={register('website')} />
        <input type="hidden" {...register('formStartedAt', { valueAsNumber: true })} />
        <input type="hidden" {...register('planCode')} />

        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        {selectedPlanCode && selectedPlanCode !== 'trial' && (
          <div className="rounded-lg border border-primary-100 bg-primary-50/70 px-4 py-3 text-sm text-primary-900">
            Plan seleccionado:{' '}
            <span className="font-semibold">{PLAN_LABELS[selectedPlanCode]}</span>
            .{' '}
            <Link to="/#planes" className="font-medium underline underline-offset-2">
              Cambiar
            </Link>
          </div>
        )}

        <section className="space-y-4">
          <h3 className="border-b border-gray-100 pb-2 text-lg font-semibold text-gray-900">
            Datos del administrador
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Nombre"
              error={errors.admin?.firstName?.message ?? fieldErrors['admin.firstName']}
            >
              <input
                {...register('admin.firstName')}
                type="text"
                className={inputClass}
                autoComplete="given-name"
              />
            </FormField>

            <FormField
              label="Apellidos"
              error={errors.admin?.lastName?.message ?? fieldErrors['admin.lastName']}
            >
              <input
                {...register('admin.lastName')}
                type="text"
                className={inputClass}
                autoComplete="family-name"
              />
            </FormField>
          </div>

          <FormField
            label="Correo electrónico"
            error={errors.admin?.email?.message ?? fieldErrors['admin.email']}
          >
            <input
              {...register('admin.email')}
              type="email"
              className={inputClass}
              autoComplete="email"
              placeholder="tunombre@empresa.com"
            />
            <p className="mt-1.5 text-xs leading-relaxed text-gray-500">
              Usa un correo real y al que tengas acceso. Te enviaremos un enlace de confirmación
              para activar tu cuenta; sin verificarlo no podrás iniciar sesión.
            </p>
          </FormField>

          <FormField
            label="Contraseña"
            error={errors.admin?.password?.message ?? fieldErrors['admin.password']}
          >
            <input
              {...register('admin.password')}
              type="password"
              className={inputClass}
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-gray-500">
              Mínimo 8 caracteres, con mayúsculas, minúsculas y números.
            </p>
          </FormField>

          <FormField
            label="Confirmar contraseña"
            error={errors.admin?.confirmPassword?.message ?? fieldErrors['admin.confirmPassword']}
          >
            <input
              {...register('admin.confirmPassword')}
              type="password"
              className={inputClass}
              autoComplete="new-password"
            />
          </FormField>
        </section>

        <section className="space-y-4">
          <h3 className="border-b border-gray-100 pb-2 text-lg font-semibold text-gray-900">
            Datos del parqueadero
          </h3>

          <FormField
            label="Nombre del parqueadero"
            error={errors.organization?.name?.message ?? fieldErrors['organization.name']}
          >
            <input {...register('organization.name')} type="text" className={inputClass} />
          </FormField>

          <LocationFields
            selectClassName={inputClass}
            value={{
              country: orgCountry,
              stateOrDepartment: orgDepartment,
              city: orgCity,
            }}
            onChange={(next) => {
              setValue('organization.country', next.country, {
                shouldDirty: true,
                shouldValidate: true,
              });
              setValue('organization.stateOrDepartment', next.stateOrDepartment, {
                shouldDirty: true,
                shouldValidate: true,
              });
              setValue('organization.city', next.city, {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
            errors={{
              country:
                errors.organization?.country?.message ?? fieldErrors['organization.country'],
              stateOrDepartment:
                errors.organization?.stateOrDepartment?.message ??
                fieldErrors['organization.stateOrDepartment'],
              city: errors.organization?.city?.message ?? fieldErrors['organization.city'],
            }}
          />

          <FormField
            label="Teléfono (opcional)"
            error={errors.organization?.phone?.message ?? fieldErrors['organization.phone']}
          >
            <input
              {...register('organization.phone')}
              type="tel"
              className={inputClass}
              autoComplete="tel"
            />
          </FormField>
        </section>

        <section className="space-y-3 rounded-lg border border-gray-100 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900">Privacidad y comunicaciones</h3>

          <label className="flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600"
              {...register('consents.privacyPolicyAccepted')}
            />
            <span>
              Acepto la{' '}
              <Link to="/privacidad" target="_blank" className="font-medium text-primary-700 hover:underline">
                política de privacidad
              </Link>{' '}
              y el tratamiento de mis datos personales. *
            </span>
          </label>
          {(errors.consents?.privacyPolicyAccepted?.message ||
            fieldErrors['consents.privacyPolicyAccepted']) && (
            <p className="text-sm text-red-600">
              {errors.consents?.privacyPolicyAccepted?.message ??
                fieldErrors['consents.privacyPolicyAccepted']}
            </p>
          )}
          {!privacyAccepted && !errors.consents?.privacyPolicyAccepted && (
            <p className="text-xs text-slate-500">
              Debes aceptar la política de privacidad para poder crear la cuenta.
            </p>
          )}

          <label className="flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600"
              {...register('consents.marketingOptIn')}
            />
            <span>
              Quiero recibir anuncios de funciones, sugerencias, ofertas y oportunidades para
              enviar comentarios.
            </span>
          </label>
        </section>

        <button
          type="submit"
          disabled={isLoading || !privacyAccepted}
          className="w-full rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p className="text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </form>
    </>
  );
}
