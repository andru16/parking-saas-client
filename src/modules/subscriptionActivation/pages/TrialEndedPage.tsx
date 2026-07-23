import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Lock, Mail, MessageCircle } from 'lucide-react';
import { fetchSupportContact } from '@/api/subscriptionActivation';
import { AppLogo } from '@/components/brand/AppLogo';

export function TrialEndedPage() {
  const supportQuery = useQuery({
    queryKey: ['activation', 'support'],
    queryFn: fetchSupportContact,
  });

  const support = supportQuery.data;
  const whatsappHref = support?.whatsapp
    ? `https://wa.me/${support.whatsapp.replace(/\D/g, '')}`
    : null;
  const mailHref = support?.email ? `mailto:${support.email}` : null;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0f172a] px-4 py-16 text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(251,191,36,0.18), transparent), radial-gradient(ellipse 40% 40% at 80% 100%, rgba(26,115,232,0.15), transparent)',
        }}
      />

      <div className="relative w-full max-w-lg text-center">
        <div className="mb-6 flex justify-center">
          <AppLogo size="lg" className="max-h-28" />
        </div>
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300 ring-1 ring-amber-400/30">
          <Lock className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Tu período de prueba ha finalizado
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-300">
          Para continuar utilizando Parking SaaS es necesario activar tu suscripción. Nuestro
          equipo te acompañará en la configuración.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/activar-suscripcion"
            className="inline-flex items-center justify-center rounded-xl bg-[#1a73e8] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:bg-[#1765cc]"
          >
            Solicitar activación nuevamente
          </Link>
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Contactar soporte
            </a>
          ) : mailHref ? (
            <a
              href={mailHref}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
            >
              <Mail className="h-4 w-4" aria-hidden />
              Contactar soporte
            </a>
          ) : null}
        </div>

        {support?.schedule && (
          <p className="mt-8 text-xs text-slate-500">Horario de atención: {support.schedule}</p>
        )}
      </div>
    </div>
  );
}
