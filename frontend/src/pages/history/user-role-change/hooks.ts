import { useQuery } from '@tanstack/react-query';
import { userRoleChangeKeys } from '@/constants/queryKey';
import { fetchUserRoleChanges, FetchUserRoleChangesParams } from './api';

export const useUserRoleChanges = (params?: FetchUserRoleChangesParams) => {
  return useQuery({
    queryKey: userRoleChangeKeys.list(params),
    queryFn: () => fetchUserRoleChanges(params),
  });
};
