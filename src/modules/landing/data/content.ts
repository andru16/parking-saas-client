import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  CarFront,
  ChartColumn,
  CreditCard,
  Lock,
  Users,
} from 'lucide-react';

export const APP_NAME = 'Parking SaaS';
export const APP_TAGLINE =
  'Software y app para parqueaderos: administra tu estacionamiento de forma inteligente';
export const APP_HERO_SUPPORT =
  'Sistema para parqueaderos en la nube: ingresos, salidas, pagos, tickets, caja y reportes en una sola plataforma.';

export const NAV_LINKS = [
  { href: '#beneficios', label: 'Beneficios' },
  { href: '#como-funciona', label: 'Cómo funciona' },
  { href: '#caracteristicas', label: 'Características' },
  { href: '#planes', label: 'Planes' },
  { href: '#faq', label: 'FAQ' },
  { href: '#nosotros', label: 'Nosotros' },
] as const;

export interface BenefitItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export const BENEFITS: BenefitItem[] = [
  {
    icon: CarFront,
    title: 'Registro rápido de vehículos',
    description: 'Entradas y salidas en segundos con flujo pensado para el mostrador.',
  },
  {
    icon: CreditCard,
    title: 'Control de pagos',
    description: 'Cobra en efectivo, transferencia o métodos locales y cierra caja sin fricción.',
  },
  {
    icon: ChartColumn,
    title: 'Reportes en tiempo real',
    description: 'Ingresos, ocupación y operación visibles cuando las necesitas.',
  },
  {
    icon: Users,
    title: 'Gestión de empleados',
    description: 'Roles, permisos y auditoría para que cada persona vea solo lo que debe.',
  },
  {
    icon: Building2,
    title: 'Múltiples sedes',
    description: 'Escala de un parqueadero a una red completa desde la misma plataforma.',
  },
  {
    icon: Lock,
    title: 'Seguridad de la información',
    description: 'Acceso controlado, respaldos y buenas prácticas para proteger tu operación.',
  },
];

export const STEPS = [
  {
    step: '01',
    title: 'Crea tu cuenta',
    description: 'Regístrate en minutos y activa tu prueba sin instalar software.',
  },
  {
    step: '02',
    title: 'Configura tu estacionamiento',
    description: 'Define categorías, tarifas, cajas y preferencias de impresión.',
  },
  {
    step: '03',
    title: 'Registra vehículos',
    description: 'Opera ingresos y salidas con tickets claros y control de caja.',
  },
  {
    step: '04',
    title: 'Consulta reportes y ganancias',
    description: 'Mide el día a día y toma decisiones con datos confiables.',
  },
];

export const FEATURES = [
  'Gestión de entradas',
  'Gestión de salidas',
  'Clientes frecuentes',
  'Facturación',
  'Usuarios',
  'Roles',
  'Estadísticas',
  'Dashboard en tiempo real',
  'Configuración del negocio',
];

export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

/** @deprecated La landing consume `/public/plans`. Se mantiene por compatibilidad de tipos. */
export const PLANS: PricingPlan[] = [];

export const TESTIMONIALS = [
  {
    quote:
      'Pasamos de hojas de cálculo a un panel claro. El cierre de caja dejó de ser un dolor de cabeza.',
    name: 'Laura Méndez',
    role: 'Administradora',
    company: 'ParkCenter Bogotá',
    initials: 'LM',
  },
  {
    quote:
      'Mis cajeros aprendieron en un día. Los reportes nos ayudan a ver en qué horarios necesitamos más personal.',
    name: 'Carlos Ríos',
    role: 'Gerente de operaciones',
    company: 'Estacionamientos Andes',
    initials: 'CR',
  },
  {
    quote:
      'Con varias sedes necesitábamos un solo sistema. Parking SaaS nos dio control sin volvernos locos.',
    name: 'Ana Sofía Vargas',
    role: 'Directora comercial',
    company: 'Grupo Vial Sur',
    initials: 'AV',
  },
];

export const FAQ_ITEMS = [
  {
    question: '¿Qué es Parking SaaS?',
    answer:
      'Es un software y app para parqueaderos: un sistema de estacionamiento en la nube para controlar ingresos, salidas, cobros, caja y reportes sin instalar programas.',
  },
  {
    question: '¿Necesito instalar algo?',
    answer:
      'No. El sistema para parqueaderos funciona en el navegador. Solo necesitas internet y un dispositivo compatible (computador, tablet o celular).',
  },
  {
    question: '¿Funciona desde celular?',
    answer:
      'Sí. La aplicación para parqueaderos está pensada para escritorio y móviles, ideal para operación en mostrador o supervisión remota.',
  },
  {
    question: '¿Tiene prueba gratuita?',
    answer:
      'Sí. Puedes crear una cuenta gratis, configurar tu parqueadero y conocer el flujo completo antes de elegir un plan de pago.',
  },
  {
    question: '¿Cómo respaldo mi información?',
    answer:
      'Los planes Profesionales y Empresariales incluyen políticas de respaldo. Además puedes exportar reportes en Excel, PDF o CSV cuando lo necesites.',
  },
  {
    question: '¿Puedo gestionar varios parqueaderos?',
    answer:
      'Sí. Con el plan Profesional o Empresarial puedes operar múltiples sedes, usuarios y reportes desde una sola cuenta.',
  },
];

export const ABOUT_PILLARS = [
  {
    title: 'Innovación',
    description: 'Flujos pensados para la operación real de un estacionamiento, no formularios genéricos.',
  },
  {
    title: 'Seguridad',
    description: 'Roles, permisos y auditoría para proteger ingresos, datos de clientes y configuración.',
  },
  {
    title: 'Escalabilidad',
    description: 'Crece de un punto de cobro a múltiples sedes sin reinventar tu herramienta.',
  },
  {
    title: 'Tecnología moderna',
    description: 'Una plataforma web rápida, mantenible y lista para evolucionar con tu negocio.',
  },
];
