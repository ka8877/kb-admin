import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export type ListState = {
  page: number;
  pageSize: number;
  searchField?: string;
  searchQuery?: string;
  searchFieldsState?: string; // JSON 직렬화된 다중 검색조건
};

export const useListState = (defaultPageSize: number = 10) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const listState = useMemo<ListState>(() => {
    return {
      page: parseInt(searchParams.get('page') || '0', 10),
      pageSize: parseInt(searchParams.get('pageSize') || String(defaultPageSize), 10),
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
      if (updates.pageSize !== undefined) {
        newParams.set('pageSize', String(updates.pageSize));
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

  return { listState, updateListState };
};
