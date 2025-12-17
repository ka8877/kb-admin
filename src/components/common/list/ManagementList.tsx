import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
  GridValidRowModel,
  GridRowId,
} from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import ListSearch from '../search/ListSearch';
import { SearchField } from '@/types/types';
import ListActions, { DeleteConfirmBar } from '../actions/ListActions';
import Section from '@/components/layout/Section';
import { useListState } from '@/hooks/useListState';
import { usePaginationRowSelection } from '@/hooks/usePaginationRowSelection';
import { exportGridToExcel } from '@/utils/excelUtils';
import type { SelectFieldOption } from '@/types/types';
import { createProcessedColumns } from '@/components/common/upload/utils/listUtils';
import { parseSearchParams } from '@/utils/apiUtils';

import { ALERT_MESSAGES } from '@/constants/message';

export type ManagementListProps<T extends GridValidRowModel = GridValidRowModel> = {
  columns: GridColDef<T>[];
  /** 데이터를 가져오는 함수 (페이지/검색 조건 변경 시 자동 호출) */
  fetcher?: (params: {
    page: number;
    pageSize: number;
    searchParams?: Record<string, string | number>;
  }) => Promise<T[]>;
  rows?: T[];
  rowIdGetter?: keyof T | ((row: T) => string | number);
  defaultPageSize?: number;
  onCreate?: () => void;
  onRequestApproval?: () => void;
  onDeleteConfirm?: (ids: (string | number)[]) => void;
  onExportAll?: (rows: T[]) => void;
  searchPlaceholder?: string;
  size?: 'small' | 'medium' | 'large';
  enableClientSearch?: boolean;
  onRowClick?: (params: { id: string | number; row: T }) => void;
  enableStatePreservation?: boolean; // URL 상태 저장 활성화 (기본: true)
  exportFileName?: string; // 다운로드 파일명 (확장자 제외)
  selectFields?: Record<string, SelectFieldOption[]>; // 셀렉트 박스로 표시할 필드와 옵션들
  dateFields?: string[]; // 날짜 필드 목록
  dateFormat?: string; // 날짜 저장 형식 (기본: YYYYMMDDHHmmss)
  searchFields?: SearchField[]; // 검색 필드 설정 (textGroup 지원)
  isLoading?: boolean; // 로딩 상태
  onSearchFieldChange?: (field: string, value: string | number) => void; // 검색 필드 변경 핸들러
};

const defaultGetRowId =
  <T extends GridValidRowModel>(getter: ManagementListProps<T>['rowIdGetter']) =>
  (row: T) => {
    if (!getter) {
      const rowObj = row as Record<string, unknown>;
      return (rowObj.id ?? rowObj.id_str ?? '') as string | number;
    }
    if (typeof getter === 'function') return getter(row);
    return row[getter as keyof T] as string | number;
  };

/**
 * 선택 모드 및 삭제 관련 로직을 관리하는 Hook
 */
const useGridSelection = (onDeleteConfirm?: (ids: (string | number)[]) => void) => {
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);

  const handleToggleSelectionMode = useCallback((next: boolean) => {
    setSelectionMode(next);
    if (!next) setSelectionModel([]);
  }, []);

  const handleDeleteConfirm = useCallback(
    (ids: (string | number)[]) => {
      if (onDeleteConfirm) onDeleteConfirm(ids);
      setSelectionModel([]);
      setSelectionMode(false);
    },
    [onDeleteConfirm],
  );

  const handleCancelSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectionModel([]);
  }, []);

  const resetSelection = useCallback(() => {
    if (selectionMode) {
      setSelectionMode(false);
      setSelectionModel([]);
    }
  }, [selectionMode]);

  return {
    selectionMode,
    selectionModel,
    setSelectionModel,
    handleToggleSelectionMode,
    handleDeleteConfirm,
    handleCancelSelection,
    resetSelection,
  };
};

/**
 * 데이터 페칭 및 필터링 로직을 관리하는 Hook
 */
const useGridData = <T extends GridValidRowModel>({
  rows,
  fetcher,
  enableClientSearch,
  paginationModel,
  searchParams,
}: {
  rows?: T[];
  fetcher?: ManagementListProps<T>['fetcher'];
  enableClientSearch: boolean;
  paginationModel: GridPaginationModel;
  searchParams?: Record<string, string | number>;
}) => {
  const [data, setData] = useState<T[]>(rows ?? []);

  // 데이터 페칭 Effect
  useEffect(() => {
    if (rows) {
      setData(rows);
      return;
    }

    if (fetcher) {
      let mounted = true;
      fetcher({
        page: paginationModel.page,
        pageSize: paginationModel.pageSize,
        searchParams,
      })
        .then((d) => mounted && setData(d))
        .catch(() => {});

      return () => {
        mounted = false;
      };
    }
  }, [fetcher, rows, paginationModel.page, paginationModel.pageSize, searchParams]);

  // 클라이언트 사이드 필터링
  const filteredRows = useMemo(() => {
    if (!enableClientSearch) return data;
    if (!searchParams || Object.keys(searchParams).length === 0) return data;

    return data.filter((row) => {
      const rowObj = row as Record<string, unknown>;
      return Object.entries(searchParams).every(([field, value]) => {
        if (value === undefined || value === null || value === '') return true;
        const rowValue = rowObj[field];
        if (rowValue === undefined || rowValue === null) return false;

        if (typeof value === 'string' && typeof rowValue === 'string') {
          return rowValue.toLowerCase().includes(value.toLowerCase());
        }
        return String(rowValue) === String(value);
      });
    });
  }, [data, enableClientSearch, searchParams]);

  return { data, filteredRows };
};

const ManagementList = <T extends GridValidRowModel = GridValidRowModel>({
  columns,
  fetcher,
  rows,
  rowIdGetter,
  defaultPageSize = 20,
  onCreate,
  onRequestApproval,
  onDeleteConfirm,
  onExportAll,
  searchPlaceholder = '검색어를 입력하세요',
  size = 'medium',
  enableClientSearch = true,
  onRowClick,
  enableStatePreservation = true,
  exportFileName = '목록',
  selectFields,
  dateFields,
  dateFormat = 'YYYYMMDDHHmmss',
  searchFields,
  isLoading = false,
  onSearchFieldChange,
}: ManagementListProps<T>): JSX.Element => {
  // 1. 상태 관리 (URL vs Local)
  const { listState, updateListState } = useListState(defaultPageSize);
  const [localPaginationModel, setLocalPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: defaultPageSize,
  });
  const [localSearchParams, setLocalSearchParams] = useState<
    Record<string, string | number> | undefined
  >(undefined);

  // 통합된 상태 도출
  const paginationModel = useMemo(
    () =>
      enableStatePreservation
        ? { page: listState.page, pageSize: listState.pageSize }
        : localPaginationModel,
    [enableStatePreservation, listState.page, listState.pageSize, localPaginationModel],
  );

  const searchParams = useMemo(() => {
    if (enableStatePreservation) {
      return listState.searchFieldsState
        ? parseSearchParams(listState.searchFieldsState)
        : undefined;
    }
    return localSearchParams;
  }, [enableStatePreservation, listState.searchFieldsState, localSearchParams]);

  // 2. 선택 모드 관리 Hook
  const {
    selectionMode,
    selectionModel,
    setSelectionModel,
    handleToggleSelectionMode,
    handleDeleteConfirm,
    handleCancelSelection,
    resetSelection,
  } = useGridSelection(onDeleteConfirm);

  // 3. 데이터 관리 Hook
  const { filteredRows } = useGridData({
    rows,
    fetcher,
    enableClientSearch,
    paginationModel,
    searchParams,
  });

  // 4. 이벤트 핸들러
  const handleSearch = useCallback(
    (payload: Record<string, string | number>) => {
      resetSelection();

      const isEmpty = Object.keys(payload).length === 0;

      if (enableStatePreservation) {
        updateListState({
          searchFieldsState: isEmpty ? undefined : JSON.stringify(payload),
          page: 0,
        });
      } else {
        setLocalSearchParams(isEmpty ? undefined : payload);
        setLocalPaginationModel((prev) => ({ ...prev, page: 0 }));
      }
    },
    [enableStatePreservation, updateListState, resetSelection],
  );

  const handlePaginationChange = useCallback(
    (model: GridPaginationModel) => {
      if (enableStatePreservation) {
        updateListState({ page: model.page, pageSize: model.pageSize });
      } else {
        setLocalPaginationModel(model);
      }
    },
    [enableStatePreservation, updateListState],
  );

  const handleExportAll = useCallback(async () => {
    if (onExportAll) return onExportAll(filteredRows);
    await exportGridToExcel({
      rows: filteredRows,
      columns: createProcessedColumns<T>({ columns, selectFields, dateFields, dateFormat }),
      exportFileName,
    });
  }, [onExportAll, filteredRows, columns, selectFields, dateFields, dateFormat, exportFileName]);

  const handleRowClick = useCallback(
    (params: { id: GridRowId; row: T }) => {
      if (onRowClick) onRowClick({ id: params.id, row: params.row });
    },
    [onRowClick],
  );

  // 5. 렌더링 준비
  const getRowId = useMemo(() => defaultGetRowId<T>(rowIdGetter), [rowIdGetter]);

  // 페이지네이션을 고려한 행 선택 관리
  const { handleRowSelectionModelChange } = usePaginationRowSelection({
    rows: filteredRows,
    paginationModel,
    getRowId,
    selectionModel,
    setSelectionModel,
  });

  const processedColumns = useMemo(() => {
    const processed = createProcessedColumns<T>({ columns, selectFields, dateFields, dateFormat });

    // No 필드를 페이지네이션을 고려하여 동적으로 계산
    return processed.map((col) => {
      if (col.field === 'no') {
        return {
          ...col,
          valueGetter: (params: { value: any; row: T }) => {
            const { row } = params;

            // row가 없으면 기본값 반환
            if (!row) {
              return '';
            }

            try {
              // 페이지 번호와 페이지 크기를 고려하여 전체 목록에서의 순번 계산
              const currentRowId = getRowId(row);
              const rowIndex = filteredRows.findIndex((r) => {
                try {
                  const rowId = getRowId(r);
                  return rowId === currentRowId;
                } catch {
                  return false;
                }
              });

              // findIndex가 -1을 반환하면 (찾지 못한 경우) 기본값 반환
              if (rowIndex === -1) {
                return '';
              }

              // 숫자로 명확히 반환
              const no = paginationModel.page * paginationModel.pageSize + rowIndex + 1;
              return Number(no);
            } catch (error) {
              console.warn('No 필드 계산 중 오류:', error);
              return '';
            }
          },
        };
      }
      return col;
    });
  }, [columns, selectFields, dateFields, dateFormat, filteredRows, paginationModel, getRowId]);

  const initialSearchValues = useMemo(() => {
    if (enableStatePreservation && listState.searchFieldsState) {
      try {
        return JSON.parse(listState.searchFieldsState);
      } catch {
        return {};
      }
    }
    return localSearchParams || {};
  }, [enableStatePreservation, listState.searchFieldsState, localSearchParams]);

  return (
    <Section>
      <ListSearch
        columns={columns}
        searchFields={searchFields}
        onSearch={handleSearch}
        placeholder={searchPlaceholder}
        size={size}
        initialValues={initialSearchValues}
        onFieldChange={onSearchFieldChange}
      />

      <ListActions
        selectionMode={selectionMode}
        onToggleSelectionMode={handleToggleSelectionMode}
        selectedIds={
          Array.isArray(selectionModel) ? selectionModel : selectionModel ? [selectionModel] : []
        }
        onCreate={onCreate}
        onRequestApproval={onRequestApproval}
        onDownloadAll={handleExportAll}
      />

      <Box sx={MANAGEMENT_LIST_GRID_WRAPPER_SX}>
        <DataGrid<T>
          rows={filteredRows}
          columns={processedColumns}
          getRowId={(r) => getRowId(r) as GridRowId}
          checkboxSelection={selectionMode}
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={
            selectionMode ? handleRowSelectionModelChange : setSelectionModel
          }
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[5, 10, 20, 50]}
          disableRowSelectionOnClick
          density="standard"
          rowHeight={46}
          columnHeaderHeight={46}
          autoHeight={false}
          onRowClick={onRowClick ? handleRowClick : undefined}
          loading={isLoading}
          localeText={{ noRowsLabel: ALERT_MESSAGES.NO_DATA }}
          sx={MANAGEMENT_LIST_GRID_SX}
        />
      </Box>

      <DeleteConfirmBar
        open={selectionMode}
        selectedIds={
          Array.isArray(selectionModel) ? selectionModel : selectionModel ? selectionModel : []
        }
        onConfirm={handleDeleteConfirm}
        onCancel={handleCancelSelection}
        size={size}
      />
    </Section>
  );
};

export default ManagementList;

const MANAGEMENT_LIST_GRID_WRAPPER_SX = {
  height: 545,
  width: '100%',
} as const;

const MANAGEMENT_LIST_GRID_SX = {
  '& .MuiDataGrid-footerContainer': {
    minHeight: '42px',
    maxHeight: '42px',
  },
} as const;
