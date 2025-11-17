import React, { useEffect, useMemo, useState } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRowId,
  GridValidRowModel,
  GridCellParams,
  GridApiCommon,
} from '@mui/x-data-grid';

type CategoryRow = Record<string, unknown> & { id?: string | number };

type CategoryListProps<T extends GridValidRowModel = CategoryRow> = {
  rows: T[];
  setRows: (updater: T[] | ((prev: T[]) => T[])) => void;
  columns: GridColDef<T>[];
  // optional apiRef to control grid from parent (focus/start edit)
  apiRef?: React.MutableRefObject<GridApiCommon>;
  getRowId?: (row: T) => string | number;
  loading?: boolean;
  processRowUpdate?: (newRow: T, oldRow: T) => T | Promise<T>;
  onProcessRowUpdateError?: (err: Error) => void;
  selectionMode?: boolean;
  selectionModel?: (string | number)[];
  onSelectionModelChange?: (m: (string | number)[]) => void;
  defaultPageSize?: number;
  // called after a drop reorder; receives the new array of rows
  onDragOrderChange?: (newRows: T[]) => void;
  // optional renderer data for ghost label
  ghostLabelGetter?: (row: T) => { no?: number; title?: string; subtitle?: string };
  isCellEditable?: (params: GridCellParams<T>) => boolean;
};

const CategoryList = <T extends GridValidRowModel = CategoryRow>({
  rows,
  setRows,
  columns,
  getRowId,
  loading,
  processRowUpdate,
  onProcessRowUpdateError,
  selectionMode = false,
  selectionModel,
  onSelectionModelChange,
  defaultPageSize = 25,
  onDragOrderChange,
  apiRef,
  ghostLabelGetter,
  isCellEditable,
}: CategoryListProps<T>) => {
  const [draggingId, setDraggingId] = useState<GridRowId | null>(null);
  const [dragOverId, setDragOverId] = useState<GridRowId | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);

  // helper to resolve id value used in DOM data-id (DataGrid uses id as string/number)
  const resolveId = (id: GridRowId) => id as string | number;

  useEffect(() => {
    if (draggingId == null) return;

    const onMove = (e: MouseEvent) => {
      setDragPos({ x: e.clientX, y: e.clientY });
      const el = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest('[data-id]') as HTMLElement | null;
      if (!el) return;
      const idStr = el.getAttribute('data-id');
      if (!idStr) return;
      const id = isNaN(Number(idStr)) ? idStr : Number(idStr);
      setDragOverId(id as GridRowId);
    };

    const onUp = (e: MouseEvent) => {
      try {
        const el = document
          .elementFromPoint(e.clientX, e.clientY)
          ?.closest('[data-id]') as HTMLElement | null;
        let targetId: GridRowId | null = null;
        if (el) {
          const idStr = el.getAttribute('data-id');
          if (idStr) targetId = isNaN(Number(idStr)) ? idStr : Number(idStr);
        }

        const fromId = draggingId;
        if (fromId != null && targetId != null && fromId !== targetId) {
          setRows((prev) => {
            const copy = [...prev];
            const from = copy.findIndex(
              (r) => (getRowId ? getRowId(r) : (r as CategoryRow).id) === fromId,
            );
            const to = copy.findIndex(
              (r) => (getRowId ? getRowId(r) : (r as CategoryRow).id) === targetId,
            );
            if (from === -1) return prev;
            const resolvedTo = to === -1 ? copy.length : to;
            const [item] = copy.splice(from, 1);
            copy.splice(resolvedTo, 0, item);
            // notify parent
            if (onDragOrderChange) onDragOrderChange(copy);
            return copy;
          });
        }
      } catch (err) {
        // ignore
      } finally {
        setDraggingId(null);
        setDragPos(null);
        setDragOverId(null);
        try {
          document.body.style.userSelect = '';
        } catch (_err) {}
      }

      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      try {
        document.body.style.userSelect = '';
      } catch (_err) {}
    };
  }, [draggingId, getRowId, onDragOrderChange, setRows]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const handle = (e.target as HTMLElement).closest('[data-drag-handle]') as HTMLElement | null;
    if (!handle) return;
    const rowEl = (handle as HTMLElement).closest('[data-id]') as HTMLElement | null;
    if (!rowEl) return;
    const idStr = rowEl.getAttribute('data-id');
    if (!idStr) return;
    const id = isNaN(Number(idStr)) ? idStr : Number(idStr);
    setDraggingId(id as GridRowId);
    setDragOverId(id as GridRowId);
    setDragPos({ x: e.clientX, y: e.clientY });
    try {
      document.body.style.userSelect = 'none';
    } catch (_err) {}
  };

  const getGhostContent = useMemo<{ no?: number; title?: string; subtitle?: string } | null>(() => {
    if (!draggingId) return null;
    const r = rows.find(
      (row) => (getRowId ? getRowId(row) : (row as CategoryRow).id) === draggingId,
    );
    if (!r) return null;
    if (ghostLabelGetter) return ghostLabelGetter(r);
    const rowData = r as Record<string, unknown>;
    return {
      no: (rowData.no as number) ?? undefined,
      title: (rowData.category_nm as string) ?? '',
      subtitle: (rowData.service_cd as string) ?? '',
    };
  }, [draggingId, rows, getRowId, ghostLabelGetter]);

  return (
    <div style={{ height: 550, width: '100%' }} onMouseDown={handleMouseDown}>
      <DataGrid
        rows={rows}
        columns={columns}
        apiRef={apiRef}
        getRowId={(r) => (getRowId ? getRowId(r) : (r as CategoryRow).id) as GridRowId}
        loading={loading}
        isCellEditable={isCellEditable}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={onProcessRowUpdateError}
        disableRowSelectionOnClick
        density="standard"
        rowHeight={46}
        columnHeaderHeight={46}
        checkboxSelection={selectionMode}
        rowSelectionModel={selectionModel}
        onRowSelectionModelChange={onSelectionModelChange}
        getRowClassName={(params) => {
          if (params.id === dragOverId) return 'drag-over';
          if (params.id === draggingId) return 'dragging';
          return '';
        }}
        sx={{
          '& .drag-over': { bgcolor: 'action.selected' },
          '& .dragging': { opacity: 0.7 },
          '& .MuiDataGrid-footerContainer': {
            minHeight: '46px',
            maxHeight: '46px',
          },
        }}
        initialState={{ pagination: { paginationModel: { pageSize: defaultPageSize } } }}
      />

      {draggingId && dragPos && getGhostContent ? (
        <div
          style={{
            position: 'fixed',
            left: dragPos.x + 12,
            top: dragPos.y + 12,
            pointerEvents: 'none',
            background: 'white',
            border: '1px solid rgba(0,0,0,0.12)',
            padding: '6px 10px',
            borderRadius: 6,
            boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
            zIndex: 1400,
            minWidth: 200,
          }}
        >
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)' }}>No {getGhostContent.no}</div>
          <div style={{ fontWeight: 600 }}>{getGhostContent.title}</div>
          <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.6)' }}>{getGhostContent.subtitle}</div>
        </div>
      ) : null}
    </div>
  );
};

export default CategoryList;

// ManagedCategoryList: wrapper with common defaults used by management edit pages
export const ManagedCategoryList = (
  props: Omit<
    CategoryListProps,
    'isCellEditable' | 'defaultPageSize' | 'ghostLabelGetter' | 'onProcessRowUpdateError'
  >,
) => {
  const {
    rows,
    setRows,
    columns,
    getRowId,
    loading,
    processRowUpdate,
    selectionMode,
    selectionModel,
    onSelectionModelChange,
    onDragOrderChange,
    apiRef,
  } = props;

  const defaultIsCellEditable = (params: GridCellParams) =>
    params.field === 'service_cd' ||
    params.field === 'category_nm' ||
    params.field === 'status_code';

  const defaultGhost = (r: CategoryRow) => {
    const rowData = r as Record<string, unknown>;
    return {
      no: rowData.no as number,
      title: rowData.category_nm as string,
      subtitle: rowData.service_cd as string,
    };
  };

  return (
    <CategoryList
      apiRef={apiRef}
      rows={rows}
      setRows={setRows}
      getRowId={getRowId}
      columns={columns}
      loading={loading}
      processRowUpdate={processRowUpdate}
      onProcessRowUpdateError={(err) => console.error('Row update error', err)}
      isCellEditable={defaultIsCellEditable}
      selectionMode={selectionMode}
      selectionModel={selectionModel}
      onSelectionModelChange={onSelectionModelChange}
      defaultPageSize={25}
      onDragOrderChange={onDragOrderChange}
      ghostLabelGetter={defaultGhost}
    />
  );
};
