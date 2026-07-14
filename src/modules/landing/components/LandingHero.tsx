import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/modules/landing/data/content';
import { DashboardMockup } from '@/modules/landing/components/DashboardMockup';

export function LandingHero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden border-b border-slate-200/60"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary-100)_0%,_transparent_55%),radial-gradient(ellipse_at_bottom_left,_#e2e8f0_0%,_transparent_50%),linear-gradient(180deg,#f8fafc_0%,#f0fdfa_48%,#ffffff_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(15,118,110,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(15,118,110,0.06)_1px,transparent_1px)] [background-size:48px_48px]"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:py-24">
        <div className="landing-hero-copy max-w-xl">
          <p className="text-4xl font-extrabold tracking-tight text-primary-800 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
            {APP_NAME}
          </p>
          <h1
            id="hero-heading"
            className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl"
          >
            {APP_TAGLINE}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Controla ingresos, salidas, pagos, clientes y reportes desde una sola plataforma.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/registro"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/25 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            >
              Crear cuenta gratis
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a
              href="#caracteristicas"
              className="inline-flex items-center rounded-xl border border-slate-300 bg-white/80 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
            >
              Ver demo
            </a>
          </div>
          <p className="mt-5 text-xs text-slate-500">
            Sin instalación · Prueba gratis · Listo para operación diaria
          </p>
        </div>

        <div className="landing-hero-visual relative">
          <div
            className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-primary-500/20 via-transparent to-slate-400/10 blur-2xl"
            aria-hidden
          />
          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
