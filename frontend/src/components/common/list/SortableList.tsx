import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  GridColDef,
  GridValidRowModel,
  GridRowId,
  GridPaginationModel,
} from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

export type SortableListProps<T extends GridValidRowModel = GridValidRowModel> = {
  columns: GridColDef<T>[];
  rows: T[];
  rowIdGetter?: keyof T | ((row: T) => string | number);
  onRowClick?: (params: { id: string | number; row: T }) => void;
  isLoading?: boolean;
  autoHeight?: boolean;
  defaultPageSize?: number;
  pageSizeOptions?: number[];
  showPagination?: boolean;
  // 순서 변경 모드
  isSortMode?: boolean;
  onSortChange?: (newRows: T[]) => void;
  // 선택 모드
  isSelectionMode?: boolean;
  onSelectionChange?: (ids: (string | number)[]) => void;
  // 스타일
  sx?: Record<string, any>;
  getRowClassName?: (params: { id: GridRowId; row: T }) => string;
};

const defaultGetRowId =
  <T extends GridValidRowModel>(getter: SortableListProps<T>['rowIdGetter']) =>
  (row: T) => {
    if (!getter) {
      const rowObj = row as Record<string, unknown>;
      return (rowObj.id ?? rowObj.id_str ?? '') as string | number;
    }
    if (typeof getter === 'function') return getter(row);
    return row[getter as keyof T] as string | number;
  };

const SortableList = <T extends GridValidRowModel = GridValidRowModel>({
  columns,
  rows,
  rowIdGetter,
  onRowClick,
  isLoading = false,
  autoHeight = false,
  defaultPageSize = 20,
  pageSizeOptions = [5, 10, 20, 50],
  showPagination = true,
  isSortMode = false,
  onSortChange,
  isSelectionMode = false,
  onSelectionChange,
  sx,
  getRowClassName,
}: SortableListProps<T>): JSX.Element => {
  const [draggingId, setDraggingId] = useState<GridRowId | null>(null);
  const [dragOverId, setDragOverId] = useState<GridRowId | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: defaultPageSize,
  });
  const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);

  const getRowId = useMemo(() => defaultGetRowId<T>(rowIdGetter), [rowIdGetter]);

  // 페이지네이션 변경 핸들러
  const handlePaginationChange = useCallback((model: GridPaginationModel) => {
    setPaginationModel(model);
  }, []);

  // 선택 변경 핸들러
  const handleSelectionChange = useCallback(
    (newSelection: (string | number)[]) => {
      setSelectionModel(newSelection);
      if (onSelectionChange) {
        onSelectionChange(newSelection);
      }
    },
    [onSelectionChange],
  );

  // 드래그 시작
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isSortMode) return;

      const target = e.target as HTMLElement;
      const dragHandle = target.closest('[data-drag-handle]');
      if (!dragHandle) return;

      const row = dragHandle.closest('[data-id]') as HTMLElement;
      if (!row) return;

      const idStr = row.getAttribute('data-id');
      if (!idStr) return;

      setDraggingId(idStr as GridRowId);
      e.preventDefault();
    },
    [isSortMode],
  );

  // 드래그 중 이동
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingId || !isSortMode) return;

      const el = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest('[data-id]') as HTMLElement | null;
      if (!el) return;

      const idStr = el.getAttribute('data-id');
      if (!idStr) return;

      setDragOverId(idStr as GridRowId);
    },
    [draggingId, isSortMode],
  );

  // 드래그 종료
  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!draggingId || !isSortMode || !dragOverId) {
        setDraggingId(null);
        setDragOverId(null);
        return;
      }

      if (draggingId === dragOverId) {
        setDraggingId(null);
        setDragOverId(null);
        return;
      }

      // 순서 변경
      const fromIndex = rows.findIndex((r) => getRowId(r) === draggingId);
      const toIndex = rows.findIndex((r) => getRowId(r) === dragOverId);

      if (fromIndex === -1 || toIndex === -1) {
        setDraggingId(null);
        setDragOverId(null);
        return;
      }

      const newRows = [...rows];
      const [removed] = newRows.splice(fromIndex, 1);
      newRows.splice(toIndex, 0, removed);

      if (onSortChange) {
        onSortChange(newRows);
      }

      setDraggingId(null);
      setDragOverId(null);
    },
    [draggingId, dragOverId, rows, getRowId, onSortChange, isSortMode],
  );

  // 드래그 이벤트 등록
  useEffect(() => {
    if (!draggingId || !isSortMode) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, handleMouseMove, handleMouseUp, isSortMode]);

  // 행 클릭 핸들러
  const handleRowClick = useCallback(
    (params: { id: string | number; row: T }) => {
      if (onRowClick && !isSortMode && !isSelectionMode) {
        onRowClick({ id: params.id, row: params.row });
      }
    },
    [onRowClick, isSortMode, isSelectionMode],
  );

  // 순서 변경 모드일 때 드래그 핸들 컬럼 추가
  const processedColumns: GridColDef<T>[] = useMemo(() => {
    if (!isSortMode) return columns;

    return [
      {
        field: 'drag',
        headerName: '',
        width: 50,
        sortable: false,
        disableColumnMenu: true,
        renderCell: () => (
          <div
            data-drag-handle
            style={{
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
            }}
          >
            <DragIndicatorIcon sx={{ color: 'action.active' }} />
          </div>
        ),
      },
      ...columns,
    ];
  }, [isSortMode, columns]);

  // 행 클래스명
  const handleGetRowClassName = useCallback(
    (params: { id: GridRowId; row: T }) => {
      let className = '';

      if (isSortMode) {
        if (params.id === dragOverId) className += ' drag-over';
        if (params.id === draggingId) className += ' dragging';
      }

      if (getRowClassName) {
        className += ' ' + getRowClassName(params);
      }

      return className.trim();
    },
    [isSortMode, dragOverId, draggingId, getRowClassName],
  );

  return (
    <Box
      sx={{
        width: '100%',
        height: autoHeight ? 'auto' : 545,
        '& .drag-over': { bgcolor: 'action.selected' },
        '& .dragging': { opacity: 0.7 },
        ...(isSortMode && {
          '& [data-drag-handle]': { cursor: 'grab' },
          '& [data-drag-handle]:active': { cursor: 'grabbing' },
        }),
        ...sx,
      }}
      onMouseDown={handleMouseDown}
    >
      <DataGrid
        rows={rows}
        columns={processedColumns}
        getRowId={getRowId}
        loading={isLoading}
        autoHeight={autoHeight}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationChange}
        pageSizeOptions={pageSizeOptions}
        hideFooterPagination={!showPagination}
        disableRowSelectionOnClick
        checkboxSelection={isSelectionMode}
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={
          isSelectionMode
            ? (newSelection) => handleSelectionChange(newSelection as (string | number)[])
            : undefined
        }
        onRowClick={handleRowClick}
        getRowClassName={handleGetRowClassName}
        density="standard"
        rowHeight={46}
        columnHeaderHeight={46}
        sx={SORTABLE_LIST_GRID_SX}
      />
    </Box>
  );
};

export default SortableList;

const SORTABLE_LIST_GRID_SX = {
  '& .MuiDataGrid-footerContainer': {
    minHeight: '42px',
    maxHeight: '42px',
  },
} as const;
