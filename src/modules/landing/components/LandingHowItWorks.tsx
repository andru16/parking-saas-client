import { STEPS } from '@/modules/landing/data/content';
import { Reveal } from '@/modules/landing/components/Reveal';

export function LandingHowItWorks() {
  return (
    <section
      id="como-funciona"
      className="border-y border-slate-200/80 bg-slate-50 py-20 sm:py-24"
      aria-labelledby="como-funciona-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="como-funciona-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Cómo funciona
            </h2>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              De la cuenta al control financiero en cuatro pasos claros.
            </p>
          </div>
        </Reveal>

        <ol className="relative mt-14 grid gap-8 lg:grid-cols-4">
          <div
            className="pointer-events-none absolute left-[12%] right-[12%] top-8 hidden h-px bg-gradient-to-r from-transparent via-primary-300 to-transparent lg:block"
            aria-hidden
          />
          {STEPS.map((step, index) => (
            <Reveal key={step.step} delayMs={index * 80}>
              <li className="relative text-center lg:text-left">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-lg font-bold text-primary-700 shadow-sm ring-1 ring-slate-200 lg:mx-0">
                  {step.step}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
