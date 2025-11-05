import React, { useEffect, useMemo, useState } from 'react';
import type { GridColDef, GridPaginationModel, GridValidRowModel } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ListSearch from '../search/ListSearch';
import { useListState } from '../../../hooks/useListState';

export type SimpleListProps<T extends GridValidRowModel = GridValidRowModel> = {
  columns: GridColDef<T>[];
  fetcher?: () => Promise<T[]>;
  rows?: T[];
  rowIdGetter?: keyof T | ((row: T) => string | number);
  defaultPageSize?: number;
  searchPlaceholder?: string;
  size?: 'small' | 'medium';
  enableClientSearch?: boolean;
  onRowClick?: (params: { id: string | number; row: T }) => void;
  onBack?: () => void; // 목록으로 돌아가기 버튼
  enableStatePreservation?: boolean; // URL 상태 저장 활성화 (기본: true)
};

const defaultGetRowId =
  <T extends GridValidRowModel>(getter: SimpleListProps<T>['rowIdGetter']) =>
  (row: T) => {
    if (!getter) return (row as any).id ?? (row as any).id_str ?? '';
    if (typeof getter === 'function') return getter(row);
    return (row as any)[getter as string];
  };

const SimpleList = <T extends GridValidRowModel = GridValidRowModel>({
  columns,
  fetcher,
  rows,
  rowIdGetter,
  defaultPageSize = 10,
  searchPlaceholder = '검색어를 입력하세요',
  size = 'small',
  enableClientSearch = true,
  onRowClick,
  onBack,
  enableStatePreservation = true,
}: SimpleListProps<T>): JSX.Element => {
  const { listState, updateListState } = useListState(defaultPageSize);
  const [data, setData] = useState<T[]>(rows ?? []);

  // URL 상태를 사용하거나 로컬 상태 사용
  const [localPaginationModel, setLocalPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: defaultPageSize,
  });
  const [localSearchField, setLocalSearchField] = useState<string | undefined>(undefined);
  const [localSearchQuery, setLocalSearchQuery] = useState<string>('');

  const paginationModel = enableStatePreservation
    ? { page: listState.page, pageSize: listState.pageSize }
    : localPaginationModel;
  const searchField = enableStatePreservation ? listState.searchField : localSearchField;
  const searchQuery = enableStatePreservation ? listState.searchQuery || '' : localSearchQuery;

  const getRowId = useMemo(() => defaultGetRowId<T>(rowIdGetter), [rowIdGetter]);

  useEffect(() => {
    if (rows) {
      setData(rows);
      return;
    }
    if (fetcher) {
      let mounted = true;
      fetcher()
        .then((d) => mounted && setData(d))
        .catch(() => {});
      return () => {
        mounted = false;
      };
    }
  }, [fetcher, rows]);

  const filteredRows = useMemo(() => {
    if (!enableClientSearch) return data;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => {
      if (!searchField) {
        return Object.values(row).some((v) =>
          v == null ? false : String(v).toLowerCase().includes(q),
        );
      }
      const value = (row as any)[searchField];
      return value == null ? false : String(value).toLowerCase().includes(q);
    });
  }, [data, searchField, searchQuery, enableClientSearch]);

  const handleSearch = (p: { field?: string; query: string }) => {
    if (enableStatePreservation) {
      updateListState({
        searchField: p.field,
        searchQuery: p.query,
        page: 0, // 검색 시 첫 페이지로
      });
    } else {
      setLocalSearchField(p.field);
      setLocalSearchQuery(p.query);
      setLocalPaginationModel((prev) => ({ ...prev, page: 0 }));
    }
  };

  const handlePaginationChange = (model: GridPaginationModel) => {
    if (enableStatePreservation) {
      updateListState({
        page: model.page,
        pageSize: model.pageSize,
      });
    } else {
      setLocalPaginationModel(model);
    }
  };

  return (
    <Box>
      <ListSearch
        columns={columns}
        onSearch={handleSearch}
        placeholder={searchPlaceholder}
        defaultField={searchField || 'all'}
        defaultQuery={searchQuery}
        size={size}
      />

      {onBack && (
        <Box sx={{ mb: 1, mt: 1 }}>
          <Button variant="outlined" size={size} onClick={onBack}>
            목록으로
          </Button>
        </Box>
      )}

      <Box sx={{ height: 420, width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns as any}
          getRowId={(r) => getRowId(r) as any}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[5, 10, 20, 50]}
          disableRowSelectionOnClick
          density="standard"
          autoHeight={false}
          onRowClick={
            onRowClick ? (params) => onRowClick({ id: params.id, row: params.row }) : undefined
          }
        />
      </Box>
    </Box>
  );
};

export default SimpleList;
