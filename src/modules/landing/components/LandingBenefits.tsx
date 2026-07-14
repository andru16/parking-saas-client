import { BENEFITS } from '@/modules/landing/data/content';
import { Reveal } from '@/modules/landing/components/Reveal';

export function LandingBenefits() {
  return (
    <section id="beneficios" className="bg-white py-20 sm:py-24" aria-labelledby="beneficios-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <h2 id="beneficios-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Todo lo que necesitas para operar con confianza
            </h2>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              Una plataforma pensada para el mostrador, la caja y la gerencia.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delayMs={index * 60}>
                <article className="group">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-700 ring-1 ring-primary-100 transition group-hover:bg-primary-600 group-hover:text-white group-hover:ring-primary-600">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
