import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  GridColDef,
  GridPaginationModel,
  GridValidRowModel,
  GridRowId,
  GridRowSelectionModel,
  GridEventListener,
} from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import ListSearch from '../search/ListSearch';
import { SearchField } from '@/types/types';
import DetailNavigationActions from '../actions/DetailNavigationActions';
import Section from '@/components/layout/Section';
import { useListState } from '@/hooks/useListState';
import { usePaginationRowSelection } from '@/hooks/usePaginationRowSelection';
import type { SelectFieldOption } from '@/types/types';
import { createProcessedColumns } from '@/components/common/upload/utils/listUtils';

import { ALERT_MESSAGES } from '@/constants/message';

export type SimpleListRenderProps = {
  selectionMode: boolean;
  selectedIds: GridRowSelectionModel;
  toggleSelectionMode: (next?: boolean) => void;
  onBack?: () => void;
};

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
  onCellClick?: GridEventListener<'cellClick'>;
  onBack?: () => void; // 목록으로 돌아가기 버튼
  /**
   * (선택) 목록 상단에 표시할 사용자 정의 액션 노드(컴포넌트)
   * ReactNode 또는 렌더 함수 전달 가능. 렌더 함수에는 selectionMode 제어 객체 제공
   * 제공하지 않으면 onBack이 있을 때 기본 DetailNavigationActions 렌더링
   */
  actionsNode?: React.ReactNode | ((props: SimpleListRenderProps) => React.ReactNode);
  enableStatePreservation?: boolean; // URL 상태 저장 활성화 (기본: true)
  /**
   * (선택) 체크박스 선택 모드 토글 시 호출
   * next: 활성화 여부 (true: 활성화, false: 비활성화)
   */
  onApproveSelect?: (next: boolean) => void;

  /**
   * (선택) 하단 컨펌 바(ApprovalConfirmBar 등) 커스텀 노드
   * DataGrid 하단에 렌더링됨
   */
  confirmBarNode?: React.ReactNode | ((props: SimpleListRenderProps) => React.ReactNode);
  searchFields?: SearchField[]; // 검색 필드 설정 (textGroup 지원)

  /**
   * (선택) 셀렉트/날짜 필드 설정 - ManagementList와 동일한 포맷터 적용용
   */
  selectFields?: Record<string, SelectFieldOption[]>; // 셀렉트 박스로 표시할 필드와 옵션들
  dateFields?: string[]; // 날짜 필드 목록
  dateFormat?: string; // 날짜 저장 형식 (기본: YYYYMMDDHHmmss)
  /**
   * (선택) 날짜 표시 형식 (기본: default)
   * 'dots'로 설정하면 YYYY.MM.DD.HH:mm:ss 형식으로 표시
   */
  dateDisplayFormat?: 'default' | 'dots';
  isLoading?: boolean; // 로딩 상태
  /**
   * (선택) 행 선택 가능 여부를 결정하는 함수
   * true를 반환하면 선택 가능, false를 반환하면 선택 불가
   */
  isRowSelectable?: (params: { row: T }) => boolean;
  /**
   * (선택) DataGrid의 자동 높이 조정 여부 (기본: false)
   * true로 설정하면 행 개수에 맞춰 높이가 자동 조정되어 세로 스크롤이 생기지 않음
   */
  autoHeight?: boolean;
};

const defaultGetRowId =
  <T extends GridValidRowModel>(getter: SimpleListProps<T>['rowIdGetter']) =>
  (row: T) => {
    if (!getter) {
      const rowObj = row as Record<string, unknown>;
      return (rowObj.id ?? rowObj.id_str ?? '') as string | number;
    }
    if (typeof getter === 'function') return getter(row);
    return row[getter as keyof T] as string | number;
  };

const SimpleList = <T extends GridValidRowModel = GridValidRowModel>({
  columns,
  fetcher,
  rows,
  rowIdGetter,
  defaultPageSize = 20,
  searchPlaceholder = '검색어를 입력하세요',
  size = 'small',
  enableClientSearch = true,
  onRowClick,
  onCellClick,
  onBack,
  actionsNode,
  enableStatePreservation = true,
  onApproveSelect,
  confirmBarNode,
  searchFields,
  selectFields,
  dateFields,
  dateFormat = 'YYYYMMDDHHmmss',
  dateDisplayFormat = 'default',
  isLoading = false,
  isRowSelectable,
  autoHeight = false,
}: SimpleListProps<T>): JSX.Element => {
  const { listState, updateListState } = useListState(defaultPageSize);
  const [data, setData] = useState<T[]>(rows ?? []);
  // 체크박스 동적화 상태 추가
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);

  // URL 상태를 사용하거나 로컬 상태 사용
  const [localPaginationModel, setLocalPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: defaultPageSize,
  });
  const [localSearchField, setLocalSearchField] = useState<string | undefined>(undefined);
  const [localSearchQuery, setLocalSearchQuery] = useState<string>('');

  const paginationModel = useMemo(
    () =>
      enableStatePreservation
        ? { page: listState.page, pageSize: listState.pageSize }
        : localPaginationModel,
    [enableStatePreservation, listState.page, listState.pageSize, localPaginationModel],
  );
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
      const rowObj = row as Record<string, unknown>;
      const value = rowObj[searchField];
      return value == null ? false : String(value).toLowerCase().includes(q);
    });
  }, [data, searchField, searchQuery, enableClientSearch]);

  // 페이지네이션을 고려한 행 선택 관리
  const { handleRowSelectionModelChange } = usePaginationRowSelection({
    rows: filteredRows,
    paginationModel,
    getRowId,
    selectionModel,
    setSelectionModel,
  });

  const toggleSelectionMode = useCallback(
    (next?: boolean) => {
      setSelectionMode((prev) => {
        const target = typeof next === 'boolean' ? next : !prev;
        if (!target) {
          setSelectionModel([]);
        }
        if (typeof onApproveSelect === 'function') {
          onApproveSelect(target);
        }
        return target;
      });
    },
    [onApproveSelect],
  );

  const handleSearch = useCallback(
    (payload: Record<string, string | number>) => {
      if (selectionMode) {
        toggleSelectionMode(false);
      }

      const fields = Object.keys(payload);
      if (fields.length === 0) {
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
        return;
      }

      // 다중 검색조건 전체를 JSON으로 저장
      if (enableStatePreservation) {
        updateListState({
          searchFieldsState: JSON.stringify(payload),
          page: 0,
        });
      } else {
        setLocalSearchField(fields[0]);
        setLocalSearchQuery(String(payload[fields[0]]));
        setLocalPaginationModel((prev) => ({ ...prev, page: 0 }));
      }
    },
    [selectionMode, toggleSelectionMode, enableStatePreservation, updateListState],
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

  const handleRowClick = useCallback(
    (params: { id: GridRowId; row: T }) => {
      if (onRowClick) {
        onRowClick({ id: params.id, row: params.row });
      }
    },
    [onRowClick],
  );

  // actionsNode가 없고 onBack이 있으면 기본 액션 노드 제공
  const resolvedActionsNode = useMemo(() => {
    if (typeof actionsNode === 'function') {
      return actionsNode({
        selectionMode,
        selectedIds: selectionModel,
        toggleSelectionMode,
        onBack,
      });
    }
    if (actionsNode) return actionsNode;
    if (onBack) return <DetailNavigationActions onBack={onBack} />;
    return null;
  }, [actionsNode, selectionMode, selectionModel, toggleSelectionMode, onBack]);

  const resolvedConfirmBarNode = useMemo(() => {
    if (typeof confirmBarNode === 'function') {
      return confirmBarNode({
        selectionMode,
        selectedIds: selectionModel,
        toggleSelectionMode,
        onBack,
      });
    }
    return confirmBarNode ?? null;
  }, [confirmBarNode, selectionMode, selectionModel, toggleSelectionMode, onBack]);

  // searchFieldsState에서 초기값 파싱
  let initialValues: Record<string, string | number> = {};
  if (enableStatePreservation && listState.searchFieldsState) {
    try {
      initialValues = JSON.parse(listState.searchFieldsState);
    } catch {
      // ignore
    }
  }

  // 컬럼에 셀렉트 필드와 날짜 필드 적용 (DataGrid 표시용)
  const processedColumns = useMemo(() => {
    const processed = createProcessedColumns<T>({
      columns,
      selectFields,
      dateFields,
      dateFormat,
      dateDisplayFormat,
    });

    // No 필드를 페이지네이션을 고려하여 동적으로 계산
    return processed.map((col) => {
      if (col.field === 'no') {
        return {
          ...col,
          valueGetter: (params: { row: T }) => {
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
  }, [
    columns,
    selectFields,
    dateFields,
    dateFormat,
    dateDisplayFormat,
    filteredRows,
    paginationModel,
    getRowId,
  ]);

  const hasSearchFields = Array.isArray(searchFields) && searchFields.length > 0;

  return (
    <Section>
      <Box sx={SIMPLE_LIST_HEADER_WRAPPER_SX}>
        {hasSearchFields && (
          <ListSearch
            columns={columns}
            searchFields={searchFields}
            onSearch={handleSearch}
            placeholder={searchPlaceholder}
            size={size}
            initialValues={initialValues}
          />
        )}

        {resolvedActionsNode}
      </Box>

      <Box sx={SIMPLE_LIST_GRID_WRAPPER_SX}>
        <DataGrid<T>
          rows={filteredRows}
          columns={processedColumns}
          getRowId={(r) => getRowId(r) as GridRowId}
          checkboxSelection={selectionMode}
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={
            selectionMode ? handleRowSelectionModelChange : setSelectionModel
          }
          isRowSelectable={isRowSelectable}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[5, 10, 20, 50]}
          disableRowSelectionOnClick
          density="standard"
          rowHeight={46}
          columnHeaderHeight={46}
          autoHeight={autoHeight}
          onRowClick={onRowClick ? handleRowClick : undefined}
          onCellClick={onCellClick}
          loading={isLoading}
          localeText={{ noRowsLabel: ALERT_MESSAGES.NO_DATA }}
          sx={SIMPLE_LIST_GRID_SX}
        />
      </Box>

      {/* 컨펌 바가 있으면 DataGrid 하단에 렌더링 */}
      {resolvedConfirmBarNode}
    </Section>
  );
};

export default SimpleList;

const SIMPLE_LIST_HEADER_WRAPPER_SX = {
  mb: 2,
} as const;

const SIMPLE_LIST_GRID_WRAPPER_SX = {
  height: 545,
  width: '100%',
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#1976d2 !important',
  },
  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
    outline: '2px solid #1976d2',
    outlineOffset: '-2px',
  },
} as const;

const SIMPLE_LIST_GRID_SX = {
  '& .MuiDataGrid-footerContainer': {
    minHeight: '42px',
    maxHeight: '42px',
  },
} as const;
