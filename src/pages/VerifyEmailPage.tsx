import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { resendVerificationRequest, verifyEmailRequest } from '@/api/signup';
import { AuthLayout } from '@/layouts/AuthLayout';
import { emailSchema } from '@/lib/validation/contactFields';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token')?.trim() ?? '';
  const emailFromQuery = params.get('email')?.trim() ?? '';

  const [status, setStatus] = useState<'idle' | 'verifying' | 'ok' | 'error'>(
    token ? 'verifying' : 'idle',
  );
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState(emailFromQuery);
  const [resendInfo, setResendInfo] = useState<string | null>(null);

  const verifyMutation = useMutation({
    mutationFn: (t: string) => verifyEmailRequest(t),
    onSuccess: (res) => {
      setStatus('ok');
      setMessage(res.message);
    },
    onError: (err: unknown) => {
      setStatus('error');
      if (isAxiosError(err)) {
        setMessage(err.response?.data?.message ?? 'No se pudo verificar el correo.');
      } else {
        setMessage('No se pudo verificar el correo.');
      }
    },
  });

  const resendMutation = useMutation({
    mutationFn: (mail: string) => resendVerificationRequest(mail),
    onSuccess: (res) => {
      setResendInfo(res.message);
    },
    onError: (err: unknown) => {
      if (isAxiosError(err)) {
        setResendInfo(err.response?.data?.message ?? 'No se pudo reenviar el enlace.');
      } else {
        setResendInfo('No se pudo reenviar el enlace.');
      }
    },
  });

  useEffect(() => {
    if (!token) return;
    verifyMutation.mutate(token);
    // Solo al montar con token
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setResendInfo(null);
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setResendInfo(parsed.error.issues[0]?.message ?? 'Correo inválido');
      return;
    }
    resendMutation.mutate(parsed.data);
  }

  return (
    <AuthLayout
      title="Verificar correo"
      subtitle="Confirma tu cuenta para acceder al panel"
    >
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        {status === 'verifying' && (
          <p className="text-center text-sm text-gray-600">Verificando tu enlace…</p>
        )}

        {status === 'ok' && (
          <div className="space-y-4 text-center">
            <p className="text-base font-medium text-emerald-700">{message}</p>
            <Link
              to="/login"
              className="inline-flex rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
            >
              Iniciar sesión
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {message}
            </p>
          </div>
        )}

        {(status === 'idle' || status === 'error') && (
          <form onSubmit={handleResend} className="mt-6 space-y-4">
            <p className="text-sm text-gray-600">
              ¿No llegó el correo o el enlace expiró? Ingresa tu correo y te enviamos uno nuevo.
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Correo</label>
              <input
                type="email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            {resendInfo && <p className="text-sm text-gray-600">{resendInfo}</p>}
            <button
              type="submit"
              disabled={resendMutation.isPending}
              className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {resendMutation.isPending ? 'Enviando…' : 'Reenviar enlace'}
            </button>
          </form>
        )}

        {status === 'ok' && null}

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link to="/login" className="font-medium text-primary-600 hover:underline">
            Volver al login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
