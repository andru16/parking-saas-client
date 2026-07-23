import { z } from 'zod';
import {
  businessNameSchema,
  emailSchema,
  optionalPhoneSchema,
  personNameSchema,
  placeNameSchema,
} from '@/lib/validation/contactFields';

const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'Debe incluir mayúsculas, minúsculas y números');

const planCodeSchema = z.enum(['trial', 'starter', 'professional', 'enterprise']);

export const signupSchema = z
  .object({
    planCode: planCodeSchema,
    admin: z.object({
      firstName: personNameSchema('El nombre', 80),
      lastName: personNameSchema('Los apellidos', 80),
      email: emailSchema,
      password: passwordSchema,
      confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
    }),
    organization: z.object({
      name: businessNameSchema('El nombre del parqueadero', 150),
      city: placeNameSchema('La ciudad', 100),
      stateOrDepartment: z
        .string()
        .trim()
        .min(1, 'El departamento es obligatorio')
        .max(100, 'El departamento no puede superar 100 caracteres'),
      country: placeNameSchema('El país', 100),
      phone: optionalPhoneSchema,
    }),
    consents: z.object({
      privacyPolicyAccepted: z.boolean().refine((v) => v === true, {
        message: 'Debe aceptar la política de privacidad y tratamiento de datos',
      }),
      /** Anuncios, sugerencias, ofertas y feedback (correo). */
      marketingOptIn: z.boolean(),
    }),
    /** Honeypot anti-bot: debe permanecer vacío. */
    website: z.literal('').or(z.string().max(0)),
    formStartedAt: z.number().int().positive(),
  })
  .refine((data) => data.admin.password === data.admin.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['admin', 'confirmPassword'],
  })
  .refine((data) => !data.website, {
    message: 'No se pudo completar la solicitud. Intenta de nuevo.',
    path: ['website'],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
