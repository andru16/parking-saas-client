import api from '@/services/api';

export interface SignupAdminInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupOrganizationInput {
  name: string;
  city: string;
  stateOrDepartment?: string;
  country: string;
  phone?: string;
}

export interface SignupConsentsInput {
  privacyPolicyAccepted: boolean;
  /** Anuncios, ofertas y oportunidades de feedback (correo). */
  marketingOptIn: boolean;
}

export type SignupPlanCode = 'trial' | 'starter' | 'professional' | 'enterprise';

export interface SignupRequest {
  admin: SignupAdminInput;
  organization: SignupOrganizationInput;
  consents: SignupConsentsInput;
  planCode?: SignupPlanCode;
  /** Honeypot anti-bot — debe ir vacío. */
  website?: string;
  formStartedAt: number;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    requiresEmailVerification?: boolean;
    requiresPlanWelcome?: boolean;
    emailSent?: boolean;
    organization: {
      id: string;
      name: string;
      status: string;
    };
    admin: {
      id: string;
      email: string;
      status: string;
      emailVerified?: boolean;
    };
    subscription: {
      id: string;
      planCode: string;
      endDate: string;
    };
  };
}

export interface ApiValidationError {
  field?: string;
  message: string;
  code?: string;
  email?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: ApiValidationError[];
}

export async function registerOrganization(payload: SignupRequest): Promise<SignupResponse> {
  const { data } = await api.post<SignupResponse>('/signup/register', payload);
  return data;
}

export async function verifyEmailRequest(token: string) {
  const { data } = await api.post<{
    success: boolean;
    message: string;
    data: { email: string; alreadyVerified: boolean };
  }>('/signup/verify-email', { token });
  return data;
}

export async function resendVerificationRequest(email: string) {
  const { data } = await api.post<{ success: boolean; message: string }>(
    '/signup/resend-verification',
    { email },
  );
  return data;
}
