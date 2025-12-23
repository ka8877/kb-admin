import { useQuery } from '@tanstack/react-query';
import { getDataChanges } from './api';
import { FetchListParams } from '@/types/types';

export const useDataChanges = (params: FetchListParams) => {
  return useQuery({
    queryKey: ['dataChanges', params],
    queryFn: () => getDataChanges(params),
  });
};
