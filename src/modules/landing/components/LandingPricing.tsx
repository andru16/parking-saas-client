import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Reveal } from '@/modules/landing/components/Reveal';
import { usePublicPlans } from '@/modules/landing/hooks/usePublicPlans';
import type { PublicPlan } from '@/api/publicPlans';

function formatMoney(value: number, currency = 'COP') {
  if (!Number.isFinite(value) || value <= 0) return 'Gratis';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function planPriceLabel(plan: PublicPlan) {
  if (plan.isTrialPlan || Number(plan.pricing?.monthly ?? 0) <= 0) {
    return { price: 'Gratis', period: '' };
  }
  return {
    price: formatMoney(plan.pricing.monthly, plan.currency || 'COP'),
    period: '/mes',
  };
}

export function LandingPricing() {
  const { data, isLoading, isError } = usePublicPlans();
  const plans = data?.plans ?? [];
  const startingFrom = data?.startingFrom ?? 69900;
  const currency = data?.currency ?? 'COP';

  return (
    <section
      id="planes"
      className="border-y border-slate-200/80 bg-slate-50 py-20 sm:py-24"
      aria-labelledby="planes-heading"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="planes-heading"
              className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              Planes claros para cada etapa
            </h2>
            <p className="mt-3 text-base text-slate-600 sm:text-lg">
              Empieza con prueba gratis. Planes de pago desde{' '}
              <span className="font-semibold text-slate-800">
                {formatMoney(startingFrom, currency)}
              </span>
              /mes.
            </p>
          </div>
        </Reveal>

        {isLoading && (
          <p className="mt-12 text-center text-sm text-slate-500">Cargando planes…</p>
        )}

        {isError && (
          <p className="mt-12 text-center text-sm text-rose-600">
            No se pudieron cargar los planes. Intente más tarde.
          </p>
        )}

        {!isLoading && !isError && plans.length > 0 && (
          <div
            className={`mt-12 grid gap-6 ${
              plans.length >= 4
                ? 'lg:grid-cols-4'
                : plans.length === 3
                  ? 'lg:grid-cols-3'
                  : 'lg:grid-cols-2'
            }`}
          >
            {plans.map((plan, index) => {
              const { price, period } = planPriceLabel(plan);
              const highlighted = Boolean(plan.isRecommended);
              return (
                <Reveal key={plan.id} delayMs={index * 70}>
                  <article
                    className={`relative flex h-full flex-col rounded-2xl p-6 ring-1 transition ${
                      highlighted
                        ? 'bg-slate-900 text-white ring-slate-900 shadow-xl shadow-slate-900/20'
                        : 'bg-white text-slate-900 ring-slate-200'
                    }`}
                  >
                    {highlighted && (
                      <span className="absolute -top-3 left-6 rounded-full bg-primary-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                        Recomendado
                      </span>
                    )}
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p
                      className={`mt-2 text-sm ${highlighted ? 'text-slate-300' : 'text-slate-600'}`}
                    >
                      {plan.description || 'Plan comercial de Parking SaaS.'}
                    </p>
                    <p className="mt-6 flex flex-wrap items-baseline gap-1">
                      <span className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                        {price}
                      </span>
                      {period && (
                        <span
                          className={`text-sm ${highlighted ? 'text-slate-400' : 'text-slate-500'}`}
                        >
                          {period}
                        </span>
                      )}
                    </p>
                    {!plan.isTrialPlan && plan.billingCycles?.length > 1 && (
                      <ul
                        className={`mt-2 space-y-0.5 text-xs ${
                          highlighted ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        {plan.billingCycles
                          .filter((c) => c.cycle !== 'monthly' && c.cycle !== 'trial' && c.price > 0)
                          .slice(0, 3)
                          .map((c) => (
                            <li key={c.cycle}>
                              {c.label}: {formatMoney(c.price, plan.currency)}
                            </li>
                          ))}
                      </ul>
                    )}
                    <ul className="mt-6 flex-1 space-y-3" role="list">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              highlighted ? 'text-primary-400' : 'text-primary-600'
                            }`}
                            aria-hidden
                          />
                          <span className={highlighted ? 'text-slate-200' : 'text-slate-700'}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={`/registro?plan=${encodeURIComponent(plan.code)}`}
                      className={`mt-8 inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${
                        highlighted
                          ? 'bg-primary-500 text-white hover:bg-primary-400'
                          : 'bg-primary-600 text-white hover:bg-primary-700'
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  </article>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
