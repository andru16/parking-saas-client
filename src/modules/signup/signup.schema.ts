import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, 'Debe incluir mayúsculas, minúsculas y números');

export const signupSchema = z
  .object({
    admin: z.object({
      firstName: z.string().trim().min(1, 'El nombre es obligatorio').max(80),
      lastName: z.string().trim().min(1, 'Los apellidos son obligatorios').max(80),
      email: z.string().trim().email('Formato de correo inválido'),
      password: passwordSchema,
      confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
    }),
    organization: z.object({
      name: z.string().trim().min(1, 'El nombre del parqueadero es obligatorio').max(150),
      city: z.string().trim().min(1, 'La ciudad es obligatoria').max(100),
      country: z.string().trim().min(1, 'El país es obligatorio').max(100),
      phone: z.string().trim().max(20).optional().or(z.literal('')),
    }),
  })
  .refine((data) => data.admin.password === data.admin.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['admin', 'confirmPassword'],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
