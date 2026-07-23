import { useEffect } from 'react';

export function useLandingSeo(siteUrl: string) {
  useEffect(() => {
    const title = 'Parking SaaS | Software para administrar estacionamientos';
    const description =
      'Controla ingresos, salidas, pagos, clientes y reportes desde una sola plataforma. Crea tu cuenta gratis y digitaliza tu parqueadero.';
    const keywords =
      'software estacionamiento, parking saas, gestión parqueaderos, control de parqueadero, reportes parking, sistema de tickets parking Colombia';

    document.title = title;

    const setMeta = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords);
    setMeta('name', 'robots', 'index,follow');
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', siteUrl);
    setMeta('property', 'og:site_name', 'Parking SaaS');
    setMeta('property', 'og:locale', 'es_CO');
    setMeta('property', 'og:image', `${siteUrl}/assets/logos/FullLogo_Transparent.png`);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', `${siteUrl}/assets/logos/FullLogo_Transparent.png`);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = siteUrl;

    const schemaId = 'parking-saas-software-schema';
    let script = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = schemaId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Parking SaaS',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'COP',
      },
      description,
      url: siteUrl,
      image: `${siteUrl}/assets/logos/FullLogo_Transparent.png`,
      logo: `${siteUrl}/assets/logos/FullLogo_Transparent.png`,
      inLanguage: 'es-CO',
    });
  }, [siteUrl]);
}
