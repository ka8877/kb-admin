import { useQuery } from '@tanstack/react-query';
import { userLoginKeys } from '@/constants/queryKey';
import { fetchUserLogins, FetchUserLoginsParams } from './api';

export const useUserLogins = (params?: FetchUserLoginsParams) => {
  return useQuery({
    queryKey: userLoginKeys.list(params),
    queryFn: () => fetchUserLogins(params),
  });
};
