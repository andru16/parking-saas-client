export const SETUP_STEPS = [
  { key: 'general_info', label: 'Información general' },
  { key: 'operational', label: 'Configuración operativa' },
  { key: 'vehicle_categories', label: 'Categorías de vehículos' },
  { key: 'rates', label: 'Tarifas' },
  { key: 'summary', label: 'Resumen' },
] as const;

export type SetupStepKey = (typeof SETUP_STEPS)[number]['key'];

export const BILLING_MODES = [
  {
    value: 'fixed',
    label: 'Precio fijo',
    hint: 'Un solo valor por estadía, sin importar cuántas horas permanezca (ej. $4.000).',
    priceLabel: 'Precio fijo *',
  },
  {
    value: 'per_hour',
    label: 'Por hora',
    hint: 'Se cobra por cada hora o fracción de hora.',
    priceLabel: 'Precio por hora *',
  },
  {
    value: 'per_minute',
    label: 'Por minuto',
    hint: 'Se cobra por cada minuto de permanencia.',
    priceLabel: 'Precio por minuto *',
  },
  {
    value: 'hour_fraction',
    label: 'Por fracción',
    hint: 'Se cobra por bloques (ej. cada 15 o 30 minutos).',
    priceLabel: 'Precio por fracción *',
  },
  {
    value: 'daily',
    label: 'Por día',
    hint: 'Se cobra por cada día o fracción de día.',
    priceLabel: 'Precio por día *',
  },
] as const;

export const TIMEZONES = [
  'America/Bogota',
  'America/Mexico_City',
  'America/Lima',
  'America/Santiago',
  'America/Buenos_Aires',
  'UTC',
] as const;

export const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] as const;

export const CURRENCIES = ['COP', 'USD', 'MXN', 'PEN', 'CLP', 'ARS'] as const;
