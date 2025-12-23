import { useQuery } from '@tanstack/react-query';
import { userRoleChangeKeys } from '@/constants/queryKey';
import { fetchUserRoleChanges } from './api';
import { FetchListParams } from '@/types/types';

export const useUserRoleChanges = (params?: FetchListParams) => {
  return useQuery({
    queryKey: userRoleChangeKeys.list(params),
    queryFn: () => fetchUserRoleChanges(params),
  });
};
