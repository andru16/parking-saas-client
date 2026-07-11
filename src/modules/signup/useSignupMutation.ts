import { useMutation } from '@tanstack/react-query';
import { registerOrganization, type SignupRequest } from '@/api/signup';

export function useSignupMutation() {
  return useMutation({
    mutationFn: (payload: SignupRequest) => registerOrganization(payload),
  });
}
