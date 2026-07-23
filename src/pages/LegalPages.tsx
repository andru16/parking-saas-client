import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '@/modules/landing/data/content';
import { AppLogo } from '@/components/brand/AppLogo';

/** Contacto legal: usa correo real (Gmail vale mientras no tengas dominio). */
const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL?.trim() || 'soporte.parkingsaas@gmail.com';

/** URL pública del sitio en la política (no usar localhost). */
const PUBLIC_SITE_URL =
  import.meta.env.VITE_APP_URL?.trim() ||
  'https://parking-saas-client.vercel.app';

const POLICY_UPDATED_AT = '16 de julio de 2026';

interface LegalPageProps {
  title: string;
  children: ReactNode;
}

function LegalShell({ title, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link
            to="/"
            className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            <AppLogo size="sm" className="max-h-10" />
          </Link>
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            ← Volver al inicio
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <div className="prose prose-slate mt-8 max-w-none space-y-4 text-sm leading-relaxed text-slate-600 [&_h2]:mt-10 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-slate-900 [&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-slate-800 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
          {children}
        </div>
      </main>
    </div>
  );
}

function Mailto({ email }: { email: string }) {
  return (
    <a className="font-medium text-primary-700 hover:underline" href={`mailto:${email}`}>
      {email}
    </a>
  );
}

export function PrivacyPage() {
  return (
    <LegalShell title="Política de Tratamiento de Datos Personales">
      <p className="text-slate-500">
        <strong className="text-slate-700">{APP_NAME}</strong>
        <br />
        Última actualización: {POLICY_UPDATED_AT}
      </p>

      <h2>1. Introducción</h2>
      <p>
        En <strong>{APP_NAME}</strong> estamos comprometidos con la protección de la información
        personal de nuestros usuarios, clientes y terceros. Esta Política de Tratamiento de Datos
        Personales establece la forma en que recopilamos, utilizamos, almacenamos, compartimos y
        protegemos los datos personales suministrados a través de nuestra plataforma.
      </p>
      <p>
        Esta política se desarrolla conforme a la <strong>Ley 1581 de 2012</strong>, el{' '}
        <strong>Decreto 1377 de 2013</strong>, el <strong>Decreto 1074 de 2015</strong> y demás normas
        que regulan la protección de datos personales en Colombia.
      </p>

      <h2>2. Responsable del tratamiento</h2>
      <ul>
        <li>
          <strong>Nombre comercial:</strong> {APP_NAME}
        </li>
        <li>
          <strong>Correo electrónico de contacto:</strong> <Mailto email={SUPPORT_EMAIL} />
        </li>
        <li>
          <strong>Sitio web:</strong>{' '}
          <a
            className="font-medium text-primary-700 hover:underline"
            href={PUBLIC_SITE_URL}
            target="_blank"
            rel="noreferrer"
          >
            {PUBLIC_SITE_URL}
          </a>
        </li>
      </ul>

      <h2>3. Datos que recopilamos</h2>
      <p>Durante el uso de la plataforma podremos recopilar información como:</p>

      <h3>Datos de identificación</h3>
      <ul>
        <li>Nombre y apellidos</li>
        <li>Número de identificación (si aplica)</li>
        <li>Correo electrónico</li>
        <li>Número telefónico</li>
      </ul>

      <h3>Información empresarial</h3>
      <ul>
        <li>Nombre del parqueadero</li>
        <li>Dirección</li>
        <li>Ciudad / departamento / país</li>
        <li>Información tributaria (cuando sea necesaria)</li>
      </ul>

      <h3>Información de acceso</h3>
      <ul>
        <li>Usuario</li>
        <li>Contraseña cifrada</li>
        <li>Dirección IP</li>
        <li>Navegador y sistema operativo</li>
        <li>Fecha y hora de acceso</li>
      </ul>

      <h3>Información operativa</h3>
      <ul>
        <li>Registros de ingreso y salida de vehículos</li>
        <li>Placas y categoría del vehículo</li>
        <li>Tarifas aplicadas e historial de operaciones</li>
        <li>Auditorías del sistema</li>
      </ul>

      <h3>Información financiera</h3>
      <p>Cuando aplique:</p>
      <ul>
        <li>Historial de pagos</li>
        <li>Estado de suscripciones</li>
        <li>Facturación</li>
      </ul>
      <p>
        <strong>{APP_NAME} no almacena directamente información de tarjetas de crédito o débito.</strong>{' '}
        Los pagos son procesados mediante proveedores especializados.
      </p>

      <h2>4. Finalidad del tratamiento</h2>
      <p>Los datos personales serán utilizados para:</p>
      <ul>
        <li>Crear cuentas de usuario y verificar el correo electrónico.</li>
        <li>Administrar el acceso a la plataforma.</li>
        <li>Gestionar la operación del parqueadero.</li>
        <li>Procesar pagos y suscripciones.</li>
        <li>Emitir facturas cuando aplique.</li>
        <li>Enviar notificaciones operativas importantes.</li>
        <li>
          Enviar comunicaciones comerciales o campañas solo si el usuario otorgó consentimiento
          expreso.
        </li>
        <li>Recuperar contraseñas y verificar identidad.</li>
        <li>Mejorar la seguridad del sistema y detectar actividades fraudulentas.</li>
        <li>Cumplir obligaciones legales y generar estadísticas internas.</li>
      </ul>

      <h2>5. Tratamiento de la información</h2>
      <p>
        {APP_NAME} podrá recolectar, almacenar, consultar, actualizar, organizar, modificar, utilizar,
        suprimir y compartir la información cuando exista autorización legal o contractual.
      </p>

      <h2>6. Derechos del titular</h2>
      <p>Los titulares de los datos personales podrán:</p>
      <ul>
        <li>Conocer la información almacenada.</li>
        <li>Solicitar actualización o corrección.</li>
        <li>Solicitar eliminación cuando sea procedente.</li>
        <li>Revocar la autorización otorgada.</li>
        <li>Presentar consultas y reclamos.</li>
        <li>Solicitar prueba de la autorización.</li>
        <li>Acceder gratuitamente a sus datos personales.</li>
      </ul>
      <p>
        Para ejercer estos derechos escribe a <Mailto email={SUPPORT_EMAIL} />.
      </p>

      <h2>7. Seguridad de la información</h2>
      <p>
        {APP_NAME} implementa medidas técnicas, administrativas y organizacionales para proteger la
        información, incluyendo:
      </p>
      <ul>
        <li>Cifrado de contraseñas.</li>
        <li>Uso de HTTPS.</li>
        <li>Tokens de autenticación.</li>
        <li>Control de acceso por roles.</li>
        <li>Registro de auditoría.</li>
        <li>Copias de seguridad.</li>
        <li>Monitoreo de eventos de seguridad.</li>
      </ul>
      <p>
        Aunque aplicamos medidas razonables para proteger la información, ningún sistema es
        completamente invulnerable.
      </p>

      <h2>8. Compartición de información</h2>
      <p>La información únicamente podrá compartirse con:</p>
      <ul>
        <li>Proveedores de infraestructura tecnológica.</li>
        <li>Proveedores de correo electrónico.</li>
        <li>Pasarelas de pago.</li>
        <li>Autoridades competentes cuando exista obligación legal.</li>
      </ul>
      <p>{APP_NAME} no comercializa los datos personales de sus usuarios.</p>

      <h2>9. Conservación de la información</h2>
      <p>Los datos serán conservados durante el tiempo necesario para:</p>
      <ul>
        <li>Prestar el servicio.</li>
        <li>Cumplir obligaciones legales.</li>
        <li>Atender requerimientos judiciales o administrativos.</li>
        <li>Resolver controversias.</li>
        <li>Mantener registros contables y tributarios.</li>
      </ul>
      <p>
        Cuando la información deje de ser necesaria será eliminada o anonimizada conforme a la
        legislación aplicable.
      </p>

      <h2>10. Cookies</h2>
      <p>La plataforma podrá utilizar cookies para:</p>
      <ul>
        <li>Mantener la sesión iniciada.</li>
        <li>Recordar preferencias.</li>
        <li>Mejorar la experiencia del usuario.</li>
        <li>Obtener estadísticas de uso.</li>
      </ul>
      <p>
        El usuario puede configurar su navegador para rechazar el uso de cookies, aunque algunas
        funcionalidades podrían verse afectadas.
      </p>

      <h2>11. Transferencia internacional de datos</h2>
      <p>
        Algunos proveedores tecnológicos utilizados por {APP_NAME} pueden almacenar información fuera
        de Colombia. En estos casos se adoptarán las medidas necesarias para garantizar un nivel
        adecuado de protección conforme a la legislación aplicable.
      </p>

      <h2>12. Menores de edad</h2>
      <p>
        {APP_NAME} no está dirigido a menores de edad y no recopila intencionalmente información
        personal de ellos.
      </p>

      <h2>13. Modificaciones de la política</h2>
      <p>
        {APP_NAME} podrá actualizar esta política cuando sea necesario por cambios legales, técnicos
        o de funcionamiento de la plataforma. Las modificaciones serán publicadas en el sitio web y
        entrarán en vigor desde su publicación.
      </p>

      <h2>14. Contacto</h2>
      <p>
        Para consultas relacionadas con el tratamiento de datos personales puede comunicarse a:
      </p>
      <ul>
        <li>
          <strong>{APP_NAME}</strong>
        </li>
        <li>
          Correo: <Mailto email={SUPPORT_EMAIL} />
        </li>
        <li>
          Sitio web:{' '}
          <a
            className="font-medium text-primary-700 hover:underline"
            href={PUBLIC_SITE_URL}
            target="_blank"
            rel="noreferrer"
          >
            {PUBLIC_SITE_URL}
          </a>
        </li>
      </ul>

      <h2>Autorización</h2>
      <p>
        Al registrarse y utilizar {APP_NAME}, el usuario manifiesta haber leído, comprendido y
        aceptado la presente Política de Tratamiento de Datos Personales, autorizando el tratamiento
        de sus datos conforme a las finalidades aquí descritas.
      </p>
    </LegalShell>
  );
}

export function TermsPage() {
  return (
    <LegalShell title="Términos de uso">
      <p>
        Al usar {APP_NAME} aceptas estos términos. El servicio se ofrece para digitalizar la
        operación de estacionamientos: tickets, pagos, usuarios, reportes y configuración.
      </p>
      <p>
        Eres responsable de la exactitud de la información que ingresas, del uso adecuado de roles y
        de cumplir la normativa aplicable a tu negocio.
      </p>
      <p>
        Podemos actualizar funciones, planes y estos términos. El uso continuado después de un cambio
        implica aceptación de la versión vigente.
      </p>
      <p>
        El tratamiento de datos personales se rige por nuestra{' '}
        <Link to="/privacidad" className="font-medium text-primary-700 hover:underline">
          Política de Tratamiento de Datos Personales
        </Link>
        .
      </p>
      <p>
        Dudas:{' '}
        <Mailto email={SUPPORT_EMAIL} />.
      </p>
    </LegalShell>
  );
}
