import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PLANS } from '@/modules/landing/data/content';
import { Reveal } from '@/modules/landing/components/Reveal';

export function LandingPricing() {
  return (
    <section id="planes" className="border-y border-slate-200/80 bg-slate-50 py-20 sm:py-24" aria-labelledby="planes-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="planes-heading" className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Planes claros para cada etapa
            </h2>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              Empieza gratis y escala cuando tu operación lo pida.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan, index) => (
            <Reveal key={plan.id} delayMs={index * 70}>
              <article
                className={`relative flex h-full flex-col rounded-2xl p-6 ring-1 transition ${
                  plan.highlighted
                    ? 'bg-slate-900 text-white ring-slate-900 shadow-xl shadow-slate-900/20'
                    : 'bg-white text-slate-900 ring-slate-200'
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-6 rounded-full bg-primary-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                    Recomendado
                  </span>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className={`mt-2 text-sm ${plan.highlighted ? 'text-slate-300' : 'text-slate-600'}`}>
                  {plan.description}
                </p>
                <p className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                  {plan.period && (
                    <span className={`text-sm ${plan.highlighted ? 'text-slate-400' : 'text-slate-500'}`}>
                      {plan.period}
                    </span>
                  )}
                </p>
                <ul className="mt-6 flex-1 space-y-3" role="list">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          plan.highlighted ? 'text-primary-400' : 'text-primary-600'
                        }`}
                        aria-hidden
                      />
                      <span className={plan.highlighted ? 'text-slate-200' : 'text-slate-700'}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/registro"
                  className={`mt-8 inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                    plan.highlighted
                      ? 'bg-primary-500 text-white hover:bg-primary-400'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
