import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { signupSchema, type SignupFormValues } from '@/modules/signup/signup.schema';
import { useSignupMutation } from '@/modules/signup/useSignupMutation';
import type { ApiErrorResponse } from '@/api/signup';

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
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20';

export function SignupPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const signupMutation = useSignupMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
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
        country: '',
        phone: '',
      },
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    setFieldErrors({});
    setSuccessMessage(null);

    try {
      const response = await signupMutation.mutateAsync({
        admin: values.admin,
        organization: {
          ...values.organization,
          phone: values.organization.phone || undefined,
        },
      });

      setSuccessMessage(response.message);
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

  if (successMessage) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">¡Registro exitoso!</h2>
          <p className="mt-3 text-gray-600">{successMessage}</p>
          <Link
            to="/login"
            className="mt-6 inline-block rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Ir a iniciar sesión
          </Link>
        </div>
    );
  }

  return (
    <>
      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-8 rounded-xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm"
      >
        {serverError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
            Datos del administrador
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            />
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
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
            Datos del parqueadero
          </h3>

          <FormField
            label="Nombre del parqueadero"
            error={errors.organization?.name?.message ?? fieldErrors['organization.name']}
          >
            <input {...register('organization.name')} type="text" className={inputClass} />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Ciudad"
              error={errors.organization?.city?.message ?? fieldErrors['organization.city']}
            >
              <input {...register('organization.city')} type="text" className={inputClass} />
            </FormField>

            <FormField
              label="País"
              error={errors.organization?.country?.message ?? fieldErrors['organization.country']}
            >
              <input {...register('organization.country')} type="text" className={inputClass} />
            </FormField>
          </div>

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

        <button
          type="submit"
          disabled={isLoading}
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
