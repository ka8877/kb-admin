import { useQuery } from '@tanstack/react-query';
import { userLoginKeys } from '@/constants/queryKey';
import { fetchUserLogins } from './api';
import { FetchListParams } from '@/types/types';

export const useUserLogins = (params?: FetchListParams) => {
  return useQuery({
    queryKey: userLoginKeys.list(params),
    queryFn: () => fetchUserLogins(params),
  });
};
