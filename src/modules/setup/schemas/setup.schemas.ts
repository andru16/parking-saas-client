import { z } from 'zod';

export const generalInfoSchema = z.object({
  commercialName: z.string().min(1, 'Nombre comercial obligatorio'),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
  address: z.string().min(1, 'Dirección obligatoria'),
  city: z.string().min(1, 'Ciudad obligatoria'),
  stateOrDepartment: z.string().optional(),
  country: z.string().min(1, 'País obligatorio'),
  phone: z.string().min(1, 'Teléfono obligatorio'),
  email: z.string().email('Correo inválido'),
  timezone: z.string().min(1, 'Zona horaria obligatoria'),
  currency: z.string().length(3, 'Moneda de 3 caracteres'),
  dateFormat: z.string().min(1, 'Formato de fecha obligatorio'),
  timeFormat: z.enum(['12h', '24h'], { message: 'Formato de hora obligatorio' }),
});

export const operationalSchema = z
  .object({
    operate24Hours: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
    allowOvercapacity: z.boolean(),
    graceMinutes: z.number().min(0, 'Tiempo de gracia >= 0'),
    maxCapacity: z.number().min(1).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.operate24Hours) {
      if (!data.openTime) {
        ctx.addIssue({
          code: 'custom',
          message: 'Hora de apertura obligatoria',
          path: ['openTime'],
        });
      }
      if (!data.closeTime) {
        ctx.addIssue({
          code: 'custom',
          message: 'Hora de cierre obligatoria',
          path: ['closeTime'],
        });
      }
    }
  });

export type GeneralInfoFormValues = z.infer<typeof generalInfoSchema>;
export type OperationalFormValues = z.infer<typeof operationalSchema>;
