import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isAxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSuperAdminAuth } from '@/modules/superAdmin/SuperAdminAuthProvider';
import { SuperAdminGuestRoute } from '@/modules/superAdmin/SuperAdminGuards';
import { emailSchema } from '@/lib/validation/contactFields';
import { HoneypotFields, useFormStartedAt } from '@/lib/validation/HoneypotFields';

const schema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Contraseña obligatoria'),
  rememberMe: z.boolean(),
  website: z.string().max(0).optional().or(z.literal('')),
  formStartedAt: z.number().int().positive(),
});

type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const { login } = useSuperAdminAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const formStartedAt = useFormStartedAt();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
      website: '',
      formStartedAt,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await login(values.email, values.password, values.rememberMe, {
        website: values.website || '',
        formStartedAt: values.formStartedAt,
      });
      navigate('/admin', { replace: true });
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message ?? 'No se pudo iniciar sesión');
      } else {
        setError('No se pudo iniciar sesión');
      }
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-black/40">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-400">
          Parking SaaS
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Super Admin</h1>
        <p className="mt-1 text-sm text-slate-400">
          Acceso exclusivo al backoffice de la plataforma. No es el login del parqueadero.
        </p>

        <form onSubmit={onSubmit} className="relative mt-8 space-y-4">
          <HoneypotFields websiteRegister={register('website')} />
          <input type="hidden" {...register('formStartedAt', { valueAsNumber: true })} />

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Correo</label>
            <input
              type="email"
              autoComplete="username"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-teal-500"
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-300">Contraseña</label>
            <input
              type="password"
              autoComplete="current-password"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-teal-500"
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input type="checkbox" className="rounded border-slate-600" {...register('rememberMe')} />
            Recordarme en este dispositivo
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-teal-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-teal-400 disabled:opacity-60"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar al backoffice'}
          </button>
        </form>
      </div>
    </div>
  );
}

export function SuperAdminLoginPage() {
  return (
    <SuperAdminGuestRoute>
      <LoginForm />
    </SuperAdminGuestRoute>
  );
}
