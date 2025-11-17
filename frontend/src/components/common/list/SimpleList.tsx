import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  GridColDef,
  GridPaginationModel,
  GridValidRowModel,
  GridRowId,
  GridRowSelectionModel,
} from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import ListSearch from '../search/ListSearch';
import DetailNavigationActions from '../actions/DetailNavigationActions';
import Section from '@/components/layout/Section';
import { useListState } from '@/hooks/useListState';

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
  defaultPageSize = 10,
  searchPlaceholder = '검색어를 입력하세요',
  size = 'small',
  enableClientSearch = true,
  onRowClick,
  onBack,
  actionsNode,
  enableStatePreservation = true,
  onApproveSelect,
  confirmBarNode,
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
      const rowObj = row as Record<string, unknown>;
      const value = rowObj[searchField];
      return value == null ? false : String(value).toLowerCase().includes(q);
    });
  }, [data, searchField, searchQuery, enableClientSearch]);

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
    (p: { field?: string; query: string }) => {
      if (selectionMode) {
        toggleSelectionMode(false);
      }

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

  return (
    <Section>
      <Box sx={{ mb: 2 }}>
        <ListSearch
          columns={columns}
          onSearch={handleSearch}
          placeholder={searchPlaceholder}
          defaultField={searchField || 'all'}
          defaultQuery={searchQuery}
          size={size}
        />

        <DetailNavigationActions onBack={onBack} />
      </Box>

      <Box
        sx={{
          height: 420,
          width: '100%',
          '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#1976d2 !important',
          },
          '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
            outline: '2px solid #1976d2',
            outlineOffset: '-2px',
          },
        }}
      >
        <DataGrid<T>
          rows={filteredRows}
          columns={columns}
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
          autoHeight={false}
          onRowClick={onRowClick ? handleRowClick : undefined}
        />
      </Box>

      {/* 컨펌 바가 있으면 DataGrid 하단에 렌더링 */}
      {resolvedConfirmBarNode}
    </Box>
    </Section>
  );
};

export default SimpleList;
