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
  country: string;
  phone?: string;
}

export interface SignupRequest {
  admin: SignupAdminInput;
  organization: SignupOrganizationInput;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data: {
    message: string;
    organization: {
      id: string;
      name: string;
      status: string;
    };
    admin: {
      id: string;
      email: string;
      status: string;
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
