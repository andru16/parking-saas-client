import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '@/modules/landing/data/content';

interface LegalPageProps {
  title: string;
  children: ReactNode;
}

function LegalShell({ title, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="text-lg font-bold text-primary-700">
            {APP_NAME}
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Volver al inicio
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <div className="prose prose-slate mt-8 max-w-none space-y-4 text-sm leading-relaxed text-slate-600">
          {children}
        </div>
      </main>
    </div>
  );
}

export function PrivacyPage() {
  return (
    <LegalShell title="Política de privacidad">
      <p>
        En {APP_NAME} tratamos los datos personales de forma responsable. Esta política describe qué información
        recolectamos, para qué la usamos y cómo puedes ejercer tus derechos.
      </p>
      <p>
        Recopilamos datos de cuenta (nombre, correo, organización), datos operativos del parqueadero y registros
        técnicos necesarios para seguridad y mejora del servicio.
      </p>
      <p>
        No vendemos información personal. Solo compartimos datos con proveedores esenciales del servicio o cuando la
        ley lo exige.
      </p>
      <p>
        Para solicitudes de privacidad escribe a{' '}
        <a className="font-medium text-primary-700 hover:underline" href="mailto:hola@parkingsaas.co">
          hola@parkingsaas.co
        </a>
        .
      </p>
    </LegalShell>
  );
}

export function TermsPage() {
  return (
    <LegalShell title="Términos de uso">
      <p>
        Al usar {APP_NAME} aceptas estos términos. El servicio se ofrece “tal cual” para digitalizar la operación de
        estacionamientos: tickets, pagos, usuarios, reportes y configuración.
      </p>
      <p>
        Eres responsable de la exactitud de la información que ingresas, del uso adecuado de roles y de cumplir la
        normativa aplicable a tu negocio.
      </p>
      <p>
        Podemos actualizar funciones, planes y estos términos. El uso continuado después de un cambio implica
        aceptación de la versión vigente.
      </p>
      <p>
        Dudas comerciales o legales:{' '}
        <a className="font-medium text-primary-700 hover:underline" href="mailto:hola@parkingsaas.co">
          hola@parkingsaas.co
        </a>
        .
      </p>
    </LegalShell>
  );
}
