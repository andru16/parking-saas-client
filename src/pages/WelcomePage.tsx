import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { PartyPopper } from 'lucide-react';
import { useAuth } from '@/modules/auth/AuthProvider';
import { ConfettiBurst } from '@/modules/setup/components/ConfettiBurst';
import { claimSetupWelcomeAccess, clearSetupWelcome } from '@/modules/setup/setupWelcome';

const AUTO_REDIRECT_MS = 5500;

export function WelcomePage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [allowed] = useState(() => claimSetupWelcomeAccess());
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(AUTO_REDIRECT_MS / 1000));

  useEffect(() => {
    if (!allowed) return;

    const started = Date.now();
    const tick = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((AUTO_REDIRECT_MS - (Date.now() - started)) / 1000));
      setSecondsLeft(left);
    }, 250);

    const timer = window.setTimeout(() => {
      clearSetupWelcome();
      navigate('/dashboard', { replace: true });
    }, AUTO_REDIRECT_MS);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(tick);
    };
  }, [allowed, navigate]);

  function goDashboard() {
    clearSetupWelcome();
    navigate('/dashboard', { replace: true });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Cargando…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.organization && !user.organization.isSetupComplete) {
    return <Navigate to="/setup" replace />;
  }

  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  const orgName = user.organization?.name ?? 'su parqueadero';

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-slate-50 px-4">
      <ConfettiBurst />

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white/95 p-8 text-center shadow-xl shadow-slate-900/5 backdrop-blur">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/30">
          <PartyPopper className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
          ¡Bienvenido a Parking SaaS!
        </h1>
        <p className="mt-3 text-base leading-relaxed text-slate-600">
          <span className="font-semibold text-slate-800">{orgName}</span> ya está listo. La
          configuración inicial quedó aprobada y ya puede operar su estacionamiento.
        </p>
        <p className="mt-2 text-sm text-slate-500">Entrará al dashboard en {secondsLeft}s…</p>
        <button
          type="button"
          onClick={goDashboard}
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
        >
          Ir al dashboard ahora
        </button>
      </div>
    </div>
  );
}
