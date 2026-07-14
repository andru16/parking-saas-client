import { Check } from 'lucide-react';
import { FEATURES } from '@/modules/landing/data/content';
import { DashboardMockup } from '@/modules/landing/components/DashboardMockup';
import { Reveal } from '@/modules/landing/components/Reveal';

export function LandingFeatures() {
  return (
    <section
      id="caracteristicas"
      className="bg-white py-20 sm:py-24"
      aria-labelledby="caracteristicas-heading"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <Reveal className="order-2 lg:order-1">
          <DashboardMockup className="landing-float-slow" />
        </Reveal>

        <Reveal delayMs={80} className="order-1 lg:order-2">
          <div>
            <h2
              id="caracteristicas-heading"
              className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              Características pensadas para tu operación
            </h2>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              Desde el ticket de entrada hasta el reporte de cierre, todo está conectado.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2" role="list">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
