/** Etiquetas en español para valores de enumeración en reportes. */
export const REPORT_STATUS_LABELS: Record<string, string> = {
  open: 'Abierto',
  closed: 'Cerrado',
  cancelled: 'Anulado',
  active: 'Activo',
  inactive: 'Inactivo',
  expired: 'Vencido',
  completed: 'Completado',
  refunded: 'Reembolsado',
  pending_verification: 'Pendiente de verificación',
};

export const REPORT_PAYMENT_LABELS: Record<string, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  other: 'Otros',
  membership: 'Membresía',
};

export const REPORT_KIND_LABELS: Record<string, string> = {
  charge: 'Cobro',
  reversal: 'Reverso',
};

export const REPORT_MEMBER_TYPE_LABELS: Record<string, string> = {
  person: 'Persona',
  company: 'Empresa',
};

const ALL_VALUE_LABELS: Record<string, string> = {
  ...REPORT_STATUS_LABELS,
  ...REPORT_PAYMENT_LABELS,
  ...REPORT_KIND_LABELS,
  ...REPORT_MEMBER_TYPE_LABELS,
};

const LOCALIZED_KEYS = new Set([
  'status',
  'method',
  'kind',
  'memberType',
  'paymentMethod',
]);

export function localizeReportValue(key: string, value: unknown): unknown {
  if (typeof value !== 'string') return value;
  if (!LOCALIZED_KEYS.has(key)) return value;
  return ALL_VALUE_LABELS[value] ?? value;
}

export function formatReportCell(key: string, value: unknown): string {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';

  const localized = localizeReportValue(key, value);
  if (typeof localized === 'string' && localized !== value) return localized;
  if (typeof value === 'string' && ALL_VALUE_LABELS[value]) return ALL_VALUE_LABELS[value];

  if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value))) {
    return new Date(String(value)).toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  if (typeof value === 'number') {
    if (['total', 'amount', 'openingAmount', 'calculatedAmount', 'closingAmount', 'difference'].includes(key)) {
      return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
    }
    return value.toLocaleString('es-CO');
  }

  return String(localized);
}
