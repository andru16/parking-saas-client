import { z } from 'zod';
import {
  addressSchema,
  businessNameSchema,
  emailSchema,
  isValidPlaceName,
  optionalTaxIdSchema,
  phoneSchema,
  placeNameSchema,
} from '@/lib/validation/contactFields';
import { CURRENCIES, DATE_FORMATS, TIMEZONES } from '../constants';

const timeHHmm = /^([01]\d|2[0-3]):[0-5]\d$/;

export type TimezoneOption = (typeof TIMEZONES)[number];
export type CurrencyOption = (typeof CURRENCIES)[number];
export type DateFormatOption = (typeof DATE_FORMATS)[number];

export function pickAllowed<T extends string>(
  value: string | undefined | null,
  allowed: readonly T[],
  fallback: T,
): T {
  return (allowed as readonly string[]).includes(value ?? '') ? (value as T) : fallback;
}

export const generalInfoSchema = z.object({
  commercialName: businessNameSchema('El nombre comercial', 150),
  legalName: z
    .string()
    .trim()
    .refine((v) => !v || (v.length >= 3 && !/^\d+$/.test(v)), {
      message: 'Razón social inválida',
    }),
  taxId: optionalTaxIdSchema,
  address: addressSchema('La dirección', 300),
  city: placeNameSchema('La ciudad', 100),
  stateOrDepartment: z
    .string()
    .trim()
    .refine((v) => !v || isValidPlaceName(v, { max: 100 }), {
      message: 'Departamento/estado inválido',
    }),
  country: placeNameSchema('El país', 100),
  phone: phoneSchema,
  email: emailSchema,
  timezone: z.enum(TIMEZONES, { message: 'Zona horaria inválida' }),
  currency: z.enum(CURRENCIES, { message: 'Moneda inválida' }),
  dateFormat: z.enum(DATE_FORMATS, { message: 'Formato de fecha inválido' }),
  timeFormat: z.enum(['12h', '24h'], { message: 'Formato de hora obligatorio' }),
});

export const operationalSchema = z
  .object({
    operate24Hours: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
    allowOvercapacity: z.boolean(),
    graceMinutes: z
      .number({ message: 'Tiempo de gracia inválido' })
      .int('Debe ser un número entero')
      .min(0, 'Tiempo de gracia >= 0')
      .max(240, 'Tiempo de gracia máximo 240 minutos'),
    maxCapacity: z
      .number({ message: 'Capacidad inválida' })
      .int()
      .min(1, 'Capacidad mínima 1')
      .max(100000, 'Capacidad demasiado alta')
      .nullable(),
  })
  .superRefine((data, ctx) => {
    if (!data.operate24Hours) {
      if (!data.openTime) {
        ctx.addIssue({
          code: 'custom',
          message: 'Hora de apertura obligatoria',
          path: ['openTime'],
        });
      } else if (!timeHHmm.test(data.openTime)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Hora de apertura inválida (HH:mm)',
          path: ['openTime'],
        });
      }

      if (!data.closeTime) {
        ctx.addIssue({
          code: 'custom',
          message: 'Hora de cierre obligatoria',
          path: ['closeTime'],
        });
      } else if (!timeHHmm.test(data.closeTime)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Hora de cierre inválida (HH:mm)',
          path: ['closeTime'],
        });
      }
    }
  });

export type GeneralInfoFormValues = z.infer<typeof generalInfoSchema>;
export type OperationalFormValues = z.infer<typeof operationalSchema>;
