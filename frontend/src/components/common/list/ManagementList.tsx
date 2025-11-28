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
import { exportGridToExcel } from '@/utils/excelUtils';
import type { SelectFieldOption } from '@/types/types';
import { createProcessedColumns } from '@/components/common/upload/utils/listUtils';
import { parseSearchParams } from '@/utils/apiUtils';

export type ManagementListProps<T extends GridValidRowModel = GridValidRowModel> = {
  columns: GridColDef<T>[];
  /** 데이터를 가져오는 함수 (페이지/검색 조건 변경 시 자동 호출) */
  fetcher?: (params: { page: number; pageSize: number; searchParams?: Record<string, string | number> }) => Promise<T[]>;
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
}: ManagementListProps<T>): JSX.Element => {
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

  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);

  const getRowId = useMemo(() => defaultGetRowId<T>(rowIdGetter), [rowIdGetter]);

  // 검색 조건을 객체로 변환
  const searchParams = useMemo(() => {
    if (!enableStatePreservation || !listState.searchFieldsState) return undefined;
    const parsed = parseSearchParams(listState.searchFieldsState);
    return Object.keys(parsed).length > 0 ? parsed : undefined;
  }, [enableStatePreservation, listState.searchFieldsState]);

  // rows prop이 있으면 우선 사용, 없으면 fetcher 호출
  useEffect(() => {
    if (rows) {
      setData(rows);
      return;
    }
    if (fetcher) {
      let mounted = true;
      const currentPage = enableStatePreservation ? listState.page : localPaginationModel.page;
      const currentPageSize = enableStatePreservation ? listState.pageSize : localPaginationModel.pageSize;
      
      fetcher({
        page: currentPage,
        pageSize: currentPageSize,
        searchParams: searchParams,
      })
        .then((d) => mounted && setData(d))
        .catch(() => {});
      return () => {
        mounted = false;
      };
    }
  }, [
    fetcher,
    rows,
    enableStatePreservation,
    listState.page,
    listState.pageSize,
    localPaginationModel.page,
    localPaginationModel.pageSize,
    searchParams,
  ]);

  const filteredRows = useMemo(() => {
    if (!enableClientSearch) return data;

    // 다중 조건 검색: searchFieldsState가 있으면 각 필드별로 필터링
    if (enableStatePreservation && listState.searchFieldsState) {
      let searchFields: Record<string, string | number> = {};
      try {
        searchFields = JSON.parse(listState.searchFieldsState);
      } catch {}
      if (Object.keys(searchFields).length === 0) return data;
      return data.filter((row) => {
        const rowObj = row as Record<string, unknown>;
        return Object.entries(searchFields).every(([field, value]) => {
          // 빈 문자열이면 필터링 조건에서 제외 (즉, 무시)
          if (value === undefined || value === null || value === '') return true;
          const rowValue = rowObj[field];
          if (rowValue === undefined || rowValue === null) return false;
          // 문자열: 포함 여부, 그 외: 완전일치
          if (typeof value === 'string' && typeof rowValue === 'string') {
            return rowValue.toLowerCase().includes(value.toLowerCase());
          }
          return String(rowValue) === String(value);
        });
      });
    }

    // 기존 단일 조건 검색 (로컬 상태)
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => {
      if (!searchField) {
        return Object.values(row).some((v) =>
          v == null ? false : String(v).toLowerCase().includes(q),
        );
      }
      const rowObj = row as Record<string, unknown>;
      const value = rowObj[searchField];
      return value == null ? false : String(value).toLowerCase().includes(q);
    });
  }, [
    data,
    searchField,
    searchQuery,
    enableClientSearch,
    enableStatePreservation,
    listState.searchFieldsState,
  ]);

  const handleExportAll = useCallback(async () => {
    if (onExportAll) return onExportAll(filteredRows);
    await exportGridToExcel({
      rows: filteredRows,
      columns: createProcessedColumns<T>({
        columns,
        selectFields,
        dateFields,
        dateFormat,
      }),
      exportFileName,
    });
  }, [onExportAll, filteredRows, columns, selectFields, dateFields, dateFormat, exportFileName]);

  const handleDeleteConfirm = useCallback(
    (ids: (string | number)[]) => {
      if (onDeleteConfirm) onDeleteConfirm(ids);
      setSelectionModel([]);
      setSelectionMode(false);
    },
    [onDeleteConfirm],
  );

  const handleSearch = useCallback(
    (payload: Record<string, string | number>) => {
      // 검색 시 삭제 모드 해제
      if (selectionMode) {
        setSelectionMode(false);
        setSelectionModel([]);
      }

      const fields = Object.keys(payload);
      if (fields.length === 0) {
        // 검색 조건 초기화
        if (enableStatePreservation) {
          updateListState({
            searchField: undefined,
            searchQuery: '',
            searchFieldsState: undefined,
            page: 0,
          });
        } else {
          setLocalSearchField(undefined);
          setLocalSearchQuery('');
          setLocalPaginationModel((prev) => ({ ...prev, page: 0 }));
        }
        // 검색 조건이 초기화되면 fetcher가 자동으로 호출됨 (useEffect의 searchParams 의존성으로 인해)
        return;
      }

      // 다중 검색조건 전체를 JSON으로 저장
      // enableStatePreservation이 true면 URL 상태에 저장되고, useEffect의 searchParams 의존성이 변경되어 fetcher가 자동 호출됨
      // enableStatePreservation이 false면 로컬 상태만 업데이트하고, fetcher가 있으면 수동으로 호출해야 함
      if (enableStatePreservation) {
        updateListState({
          searchFieldsState: JSON.stringify(payload),
          page: 0, // 검색 시 첫 페이지로 이동
        });
      } else {
        // 로컬 상태만 쓸 경우(비 URL)
        setLocalSearchField(fields[0]);
        setLocalSearchQuery(String(payload[fields[0]]));
        setLocalPaginationModel((prev) => ({ ...prev, page: 0 }));
        
        // enableClientSearch가 false이고 fetcher가 있으면 즉시 API 호출
        if (!enableClientSearch && fetcher) {
          fetcher({
            page: 0,
            pageSize: localPaginationModel.pageSize,
            searchParams: payload,
          })
            .then((d) => setData(d))
            .catch(() => {});
        }
      }
    },
    [selectionMode, enableStatePreservation, updateListState, enableClientSearch, fetcher, localPaginationModel.pageSize],
  );

  const handlePaginationChange = useCallback(
    (model: GridPaginationModel) => {
      if (enableStatePreservation) {
        updateListState({
          page: model.page,
          pageSize: model.pageSize,
        });
      } else {
        setLocalPaginationModel(model);
      }
    },
    [enableStatePreservation, updateListState],
  );

  const handleToggleSelectionMode = useCallback((next: boolean) => {
    setSelectionMode(next);
    if (!next) setSelectionModel([]);
  }, []);

  const handleRowClick = useCallback(
    (params: { id: GridRowId; row: T }) => {
      if (onRowClick) {
        onRowClick({ id: params.id, row: params.row });
      }
    },
    [onRowClick],
  );

  const handleCancelSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectionModel([]);
  }, []);

  // 컬럼에 셀렉트 필드와 날짜 필드 적용 (DataGrid 표시용)
  const processedColumns = useMemo(
    () =>
      createProcessedColumns<T>({
        columns,
        selectFields,
        dateFields,
        dateFormat,
      }),
    [columns, selectFields, dateFields, dateFormat],
  );

  // searchFieldsState에서 초기값 파싱
  let initialValues: Record<string, string | number> = {};
  if (enableStatePreservation && listState.searchFieldsState) {
    try {
      initialValues = JSON.parse(listState.searchFieldsState);
    } catch {}
  }

  return (
    <Section>
      <ListSearch
        columns={columns}
        searchFields={searchFields}
        onSearch={handleSearch}
        placeholder={searchPlaceholder}
        size={size}
        initialValues={initialValues}
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
          onRowSelectionModelChange={setSelectionModel}
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
