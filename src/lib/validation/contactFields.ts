import { z } from 'zod';

/** Letras (incl. acentos), espacios y separadores; sin dígitos. */
export const PERSON_NAME_REGEX =
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '\-.][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;

export const PLACE_NAME_REGEX =
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '\-.][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;

export const BUSINESS_NAME_REGEX =
  /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+(?:[ &'\-./+][A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+)*$/;

export const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export const TAX_ID_REGEX = /^[0-9]{5,15}(-[0-9])?$/;

export const PERSON_NAME_MESSAGE =
  'Solo puede contener letras, espacios y signos permitidos (sin números)';

export const PLACE_NAME_MESSAGE =
  'Solo puede contener letras y espacios (sin números ni símbolos raros)';

export const BUSINESS_NAME_MESSAGE =
  'Use un nombre real (mín. 3 caracteres con letras; no solo números ni texto basura)';

export const ADDRESS_MESSAGE =
  'Indique una dirección válida (mín. 5 caracteres, con letras)';

export const TAX_ID_MESSAGE = 'NIT/documento inválido (ej. 900123456-7)';

export const EMAIL_MESSAGE = 'Formato de correo inválido';

export const PHONE_MESSAGE =
  'Teléfono inválido. Use dígitos con opcional + y separadores; entre 7 y 15 dígitos';

export const BOT_REJECT_MESSAGE = 'No se pudo completar la solicitud. Intenta de nuevo.';

export const FORM_MIN_FILL_MS = 1500;

const SPAM_TOKENS =
  /^(asdf+|qwer+|qwerty|xxxxx+|aaaa+|bbbb+|test|testing|hola|abc+|xxx+|zzz+|asdfgh|123456|password)$/i;

function letterCount(value: string) {
  return (value.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length;
}

export function isLowQualityText(value: string, { minLetters = 3 } = {}): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  const compact = trimmed.replace(/\s+/g, '');
  if (compact.length < minLetters) return true;
  if (/^(.)\1+$/i.test(compact)) return true;
  if (SPAM_TOKENS.test(compact)) return true;
  if (letterCount(trimmed) < minLetters) return true;
  return false;
}

export function isValidPersonName(value: string, { min = 2, max = 150 } = {}): boolean {
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) return false;
  if (/\d/.test(trimmed)) return false;
  if (isLowQualityText(trimmed, { minLetters: Math.min(2, min) })) return false;
  return PERSON_NAME_REGEX.test(trimmed);
}

export function isValidPlaceName(value: string, { min = 2, max = 100 } = {}): boolean {
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) return false;
  if (/\d/.test(trimmed)) return false;
  if (isLowQualityText(trimmed, { minLetters: 2 })) return false;
  return PLACE_NAME_REGEX.test(trimmed);
}

export function isValidBusinessName(value: string, { min = 3, max = 150 } = {}): boolean {
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) return false;
  if (/^\d+$/.test(trimmed)) return false;
  if (isLowQualityText(trimmed, { minLetters: 3 })) return false;
  return BUSINESS_NAME_REGEX.test(trimmed);
}

export function isValidAddress(value: string, { min = 5, max = 300 } = {}): boolean {
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) return false;
  if (letterCount(trimmed) < 3) return false;
  if (isLowQualityText(trimmed, { minLetters: 3 })) return false;
  return true;
}

export function isValidTaxId(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return TAX_ID_REGEX.test(trimmed);
}

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 5 || trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}

export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('-')) return false;
  if (trimmed.includes('+') && !trimmed.startsWith('+')) return false;
  if (trimmed.startsWith('+') && !/^\+[0-9]/.test(trimmed)) return false;
  if (!/^\+?[0-9\s().-]+$/.test(trimmed)) return false;
  if (/--|-\s+-|\(\)/.test(trimmed)) return false;

  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export function personNameSchema(label = 'El nombre', max = 80) {
  return z
    .string()
    .trim()
    .min(1, `${label} es obligatorio`)
    .max(max, `${label} no puede superar ${max} caracteres`)
    .refine((v) => isValidPersonName(v, { min: 2, max }), `${label}: ${PERSON_NAME_MESSAGE}`);
}

export function placeNameSchema(label: string, max = 100) {
  return z
    .string()
    .trim()
    .min(1, `${label} es obligatorio`)
    .max(max, `${label} no puede superar ${max} caracteres`)
    .refine((v) => isValidPlaceName(v, { max }), `${label}: ${PLACE_NAME_MESSAGE}`);
}

export function businessNameSchema(label: string, max = 150) {
  return z
    .string()
    .trim()
    .min(1, `${label} es obligatorio`)
    .max(max, `${label} no puede superar ${max} caracteres`)
    .refine((v) => isValidBusinessName(v, { max }), `${label}: ${BUSINESS_NAME_MESSAGE}`);
}

export function addressSchema(label = 'La dirección', max = 300) {
  return z
    .string()
    .trim()
    .min(1, `${label} es obligatoria`)
    .max(max, `${label} no puede superar ${max} caracteres`)
    .refine((v) => isValidAddress(v, { max }), ADDRESS_MESSAGE);
}

export const optionalTaxIdSchema = z
  .string()
  .trim()
  .refine((v) => !v || isValidTaxId(v), TAX_ID_MESSAGE);

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'El correo es obligatorio')
  .refine(isValidEmail, EMAIL_MESSAGE);

export const optionalEmailSchema = z
  .string()
  .trim()
  .refine((v) => !v || isValidEmail(v), EMAIL_MESSAGE);

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'El teléfono es obligatorio')
  .refine(isValidPhone, PHONE_MESSAGE);

export const optionalPhoneSchema = z
  .string()
  .trim()
  .refine((v) => !v || isValidPhone(v), PHONE_MESSAGE);

/** Campos anti-bot (honeypot + marca de tiempo). */
export const botGuardSchema = z.object({
  website: z.string().max(0, BOT_REJECT_MESSAGE).optional().or(z.literal('')),
  formStartedAt: z.number().int().positive(),
});

export type BotGuardPayload = {
  website: string;
  formStartedAt: number;
};

export function createBotGuardPayload(formStartedAt: number, website = ''): BotGuardPayload {
  return { website, formStartedAt };
}

export function validatePersonContactFields(input: {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  requireEmail?: boolean;
  requirePhone?: boolean;
  nameLabel?: string;
  allowBusinessName?: boolean;
}): string | null {
  const nameLabel = input.nameLabel ?? 'El nombre';

  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) return `${nameLabel} es obligatorio`;
    if (input.allowBusinessName) {
      if (!isValidBusinessName(name)) return `${nameLabel}: ${BUSINESS_NAME_MESSAGE}`;
    } else if (!isValidPersonName(name)) {
      return `${nameLabel}: ${PERSON_NAME_MESSAGE}`;
    }
  }

  if (input.firstName !== undefined) {
    const firstName = input.firstName.trim();
    if (!firstName) return 'El nombre es obligatorio';
    if (!isValidPersonName(firstName, { max: 80 })) {
      return `El nombre: ${PERSON_NAME_MESSAGE}`;
    }
  }

  if (input.lastName !== undefined) {
    const lastName = input.lastName.trim();
    if (!lastName) return 'Los apellidos son obligatorios';
    if (!isValidPersonName(lastName, { max: 80 })) {
      return `Los apellidos: ${PERSON_NAME_MESSAGE}`;
    }
  }

  const email = input.email?.trim() ?? '';
  if (input.requireEmail || email) {
    if (!email) return 'El correo es obligatorio';
    if (!isValidEmail(email)) return EMAIL_MESSAGE;
  }

  const phone = input.phone?.trim() ?? '';
  if (input.requirePhone || phone) {
    if (!phone) return 'El teléfono es obligatorio';
    if (!isValidPhone(phone)) return PHONE_MESSAGE;
  }

  return null;
}
