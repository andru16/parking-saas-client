import { Link } from 'react-router-dom';
import { APP_NAME } from '@/modules/landing/data/content';
import { AppLogo } from '@/components/brand/AppLogo';

type FooterLink =
  | { label: string; href: string }
  | { label: string; to: string };

const FOOTER_LINKS: FooterLink[] = [
  { href: '#inicio', label: 'Inicio' },
  { href: '#planes', label: 'Planes' },
  { href: '#caracteristicas', label: 'Características' },
  { href: `mailto:${import.meta.env.VITE_SUPPORT_EMAIL?.trim() || 'soporte.parkingsaas@gmail.com'}`, label: 'Contacto' },
  { to: '/privacidad', label: 'Política de privacidad' },
  { to: '/terminos', label: 'Términos' },
];

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300" aria-label="Pie de página">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.2fr_1fr] lg:px-8">
        <div>
          <AppLogo size="md" className="max-h-16 brightness-110" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Software para administrar estacionamientos con claridad operativa, pagos y reportes en un solo lugar.
          </p>
          <div className="mt-6 flex gap-3" aria-label="Redes sociales">
            <SocialLink href="https://www.linkedin.com" label="LinkedIn">
              in
            </SocialLink>
            <SocialLink href="https://x.com" label="X (Twitter)">
              X
            </SocialLink>
            <SocialLink href="https://www.instagram.com" label="Instagram">
              Ig
            </SocialLink>
          </div>
        </div>

        <nav aria-label="Enlaces del pie">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Enlaces</p>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            {FOOTER_LINKS.map((link) => (
              <li key={link.label}>
                {'to' in link ? (
                  <Link
                    to={link.to}
                    className="rounded hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="rounded hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  >
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {year} {APP_NAME}. Todos los derechos reservados.
          </p>
          <p>Hecho para operadores de estacionamiento.</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-xs font-semibold text-slate-200 ring-1 ring-white/10 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
    >
      {children}
    </a>
  );
}
