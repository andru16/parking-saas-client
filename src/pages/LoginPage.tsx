import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { useAuth } from '@/modules/auth/AuthProvider';
import { resolveLoginRedirect } from '@/modules/auth/authRedirect';
import { AuthLayout } from '@/layouts/AuthLayout';
import { GuestRoute } from '@/routes/GuestRoute';

const loginSchema = z.object({
  email: z.string().email('Ingrese un correo válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
  rememberMe: z.boolean(),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const fromPath = (location.state as { from?: string } | null)?.from ?? null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const loggedInUser = await login(values.email, values.password, values.rememberMe);
      navigate(resolveLoginRedirect(loggedInUser, fromPath), { replace: true });
    } catch (err) {
      if (isAxiosError(err)) {
        const message = err.response?.data?.message;
        const errors = err.response?.data?.errors;
        if (typeof message === 'string') {
          setError(message);
        } else if (Array.isArray(errors) && errors.length > 0) {
          setError(errors.map((e: { message?: string }) => e.message).join('. '));
        } else {
          setError('No se pudo iniciar sesión. Verifique sus credenciales.');
        }
      } else {
        setError('No se pudo iniciar sesión. Intente nuevamente.');
      }
    }
  });

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Acceda al panel de su parqueadero">
      <div className="rounded-xl bg-white border border-gray-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@parqueadero.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                {...register('rememberMe')}
              />
              Recordarme
            </label>
            <Link to="/recuperar-contrasena" className="text-primary-600 hover:underline font-medium">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary-600 text-white font-semibold py-2.5 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿No tiene cuenta?{' '}
          <Link to="/registro" className="font-medium text-primary-600 hover:underline">
            Crear cuenta
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export function LoginPage() {
  return (
    <GuestRoute>
      <LoginFormContent />
    </GuestRoute>
  );
}
