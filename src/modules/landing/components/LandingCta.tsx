import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/modules/landing/components/Reveal';

export function LandingCta() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-24" aria-labelledby="cta-heading">
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-slate-900"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(20,184,166,0.35),transparent_35%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <Reveal>
          <h2 id="cta-heading" className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Empieza a digitalizar tu parqueadero
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-primary-100 sm:text-lg">
            Crea tu cuenta gratis, configura tu sistema de estacionamiento y controla ingresos, salidas
            y caja en minutos.
          </p>
          <Link
            to="/registro"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-primary-800 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary-700"
          >
            Crear cuenta gratis
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
