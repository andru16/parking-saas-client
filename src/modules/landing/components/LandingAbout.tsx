import { ABOUT_PILLARS, APP_NAME } from '@/modules/landing/data/content';
import { Reveal } from '@/modules/landing/components/Reveal';

export function LandingAbout() {
  return (
    <section id="nosotros" className="bg-white py-20 sm:py-24" aria-labelledby="nosotros-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <Reveal>
            <div>
              <h2 id="nosotros-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Sobre {APP_NAME}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                Nacimos para digitalizar estacionamientos y facilitar la administración diaria: menos papeles,
                menos errores y más visibilidad sobre lo que realmente genera ingresos.
              </p>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                Construimos una plataforma moderna para que dueños, administradores y cajeros trabajen con la misma
                verdad operativa — desde el primer ticket hasta el reporte del mes.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {ABOUT_PILLARS.map((pillar, index) => (
              <Reveal key={pillar.title} delayMs={index * 50}>
                <article className="rounded-2xl bg-slate-50 p-5 ring-1 ring-slate-200/80">
                  <h3 className="text-base font-semibold text-primary-800">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{pillar.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
