import { LandingNav } from '@/modules/landing/components/LandingNav';
import { LandingHero } from '@/modules/landing/components/LandingHero';
import { LandingBenefits } from '@/modules/landing/components/LandingBenefits';
import { LandingHowItWorks } from '@/modules/landing/components/LandingHowItWorks';
import { LandingFeatures } from '@/modules/landing/components/LandingFeatures';
import { LandingPricing } from '@/modules/landing/components/LandingPricing';
import { LandingTestimonials } from '@/modules/landing/components/LandingTestimonials';
import { LandingFaq } from '@/modules/landing/components/LandingFaq';
import { LandingAbout } from '@/modules/landing/components/LandingAbout';
import { LandingCta } from '@/modules/landing/components/LandingCta';
import { LandingFooter } from '@/modules/landing/components/LandingFooter';
import { useLandingSeo } from '@/modules/landing/hooks/useLandingSeo';
import '@/modules/landing/styles/landing.css';

function resolveSiteUrl() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return import.meta.env.VITE_APP_URL || 'https://parkingsaas.co';
}

export function LandingPage() {
  useLandingSeo(resolveSiteUrl());

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <a
        href="#contenido-principal"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:inline-flex focus:h-auto focus:w-auto focus:overflow-visible focus:rounded-lg focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:opacity-100 focus:outline-none"
      >
        Saltar al contenido
      </a>
      <LandingNav />
      <main id="contenido-principal">
        <LandingHero />
        <LandingBenefits />
        <LandingHowItWorks />
        <LandingFeatures />
        <LandingPricing />
        <LandingTestimonials />
        <LandingFaq />
        <LandingAbout />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
