import { TESTIMONIALS } from '@/modules/landing/data/content';
import { Reveal } from '@/modules/landing/components/Reveal';

export function LandingTestimonials() {
  return (
    <section className="bg-white py-20 sm:py-24" aria-labelledby="testimonios-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="max-w-2xl">
            <h2 id="testimonios-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Lo que dicen operadores como tú
            </h2>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              Historias inspiradas en la operación diaria de parqueaderos reales.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item, index) => (
            <Reveal key={item.name} delayMs={index * 70}>
              <figure className="flex h-full flex-col rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200/80">
                <blockquote className="flex-1 text-sm leading-relaxed text-slate-700">
                  “{item.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-slate-200/80 pt-5">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white"
                    aria-hidden
                  >
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-500">
                      {item.role} · {item.company}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
