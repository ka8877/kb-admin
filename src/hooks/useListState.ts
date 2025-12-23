import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo, useState } from 'react';
import { ApiMeta } from '@/utils/apiUtils';

export type ListState = {
  page: number;
  size: number;
  searchField?: string;
  searchQuery?: string;
  searchFieldsState?: string; // JSON 직렬화된 다중 검색조건
};

export const useListState = (defaultPageSize: number = 10) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [meta, setMeta] = useState<ApiMeta>({
    page: 1,
    size: defaultPageSize,
    totalElements: 0,
    totalPages: 0,
  });

  const listState = useMemo<ListState>(() => {
    return {
      page: parseInt(searchParams.get('page') || '0', 10),
      size: parseInt(searchParams.get('size') || String(defaultPageSize), 10),
      searchField: searchParams.get('searchField') || undefined,
      searchQuery: searchParams.get('searchQuery') || undefined,
      searchFieldsState: searchParams.get('searchFieldsState') || undefined,
    };
  }, [searchParams, defaultPageSize]);

  const updateListState = useCallback(
    (updates: Partial<ListState>) => {
      const newParams = new URLSearchParams(searchParams);

      if (updates.page !== undefined) {
        newParams.set('page', String(updates.page));
      }
      if (updates.size !== undefined) {
        newParams.set('size', String(updates.size));
      }
      if (updates.searchField !== undefined) {
        if (updates.searchField) {
          newParams.set('searchField', updates.searchField);
        } else {
          newParams.delete('searchField');
        }
      }
      if (updates.searchQuery !== undefined) {
        if (updates.searchQuery) {
          newParams.set('searchQuery', updates.searchQuery);
        } else {
          newParams.delete('searchQuery');
        }
      }
      if (updates.searchFieldsState !== undefined) {
        if (updates.searchFieldsState) {
          newParams.set('searchFieldsState', updates.searchFieldsState);
        } else {
          newParams.delete('searchFieldsState');
        }
      }

      setSearchParams(newParams);
    },
    [searchParams, setSearchParams],
  );

  return { listState, updateListState, meta, setMeta };
};
