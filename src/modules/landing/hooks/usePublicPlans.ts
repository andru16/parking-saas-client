import { useQuery } from '@tanstack/react-query';
import { fetchPublicPlans } from '@/api/publicPlans';

export function usePublicPlans() {
  return useQuery({
    queryKey: ['public', 'plans'],
    queryFn: async () => {
      const res = await fetchPublicPlans();
      return res.data;
    },
    staleTime: 60_000,
  });
}
