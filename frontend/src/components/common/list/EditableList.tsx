import React, { useEffect, useMemo, useState } from 'react';
import type { GridColDef, GridPaginationModel, GridValidRowModel } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import DetailEditActions from '../actions/DetailEditActions';

export type EditableListProps<T extends GridValidRowModel = GridValidRowModel> = {
  columns: GridColDef<T>[];
  fetcher?: () => Promise<T[]>;
  rows?: T[];
  rowIdGetter?: keyof T | ((row: T) => string | number);
  defaultPageSize?: number;
  size?: 'small' | 'medium';
  onRowClick?: (params: { id: string | number; row: T }) => void;
  onBack?: () => void; // 목록으로 버튼
  onEdit?: () => void; // 편집 버튼
  isEditMode?: boolean; // 편집 모드 상태
  onSave?: () => void; // 저장 버튼
  onCancel?: () => void; // 취소 버튼
  onDeleteConfirm?: (ids: (string | number)[]) => void; // 삭제 확인
  readOnlyFields?: string[]; // 편집 불가 필드들
};

const defaultGetRowId =
  <T extends GridValidRowModel>(getter: EditableListProps<T>['rowIdGetter']) =>
  (row: T) => {
    if (!getter) return (row as any).id ?? (row as any).id_str ?? '';
    if (typeof getter === 'function') return getter(row);
    return (row as any)[getter as string];
  };

const EditableList = <T extends GridValidRowModel = GridValidRowModel>({
  columns,
  fetcher,
  rows,
  rowIdGetter,
  defaultPageSize = 10,
  size = 'small',
  onRowClick,
  onBack,
  onEdit,
  isEditMode = false,
  onSave,
  onCancel,
  onDeleteConfirm,
  readOnlyFields = ['no', 'id'],
}: EditableListProps<T>): JSX.Element => {
  const [data, setData] = useState<T[]>(rows ?? []);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: defaultPageSize,
  });
  const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);

  const getRowId = useMemo(() => defaultGetRowId<T>(rowIdGetter), [rowIdGetter]);

  // 편집 모드에 따라 컬럼 처리
  const processedColumns = useMemo(() => {
    return columns.map((col) => ({
      ...col,
      editable: isEditMode && !readOnlyFields.includes(col.field),
    }));
  }, [columns, isEditMode, readOnlyFields]);

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

  const handlePaginationChange = (model: GridPaginationModel) => {
    setPaginationModel(model);
  };

  return (
    <Box>
      {/* 상단 버튼들 - 일반 모드일 때만 */}
      {!isEditMode && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {onBack && (
            <Button variant="outlined" size={size} onClick={onBack}>
              목록으로
            </Button>
          )}
          {onEdit && (
            <Button variant="contained" size={size} onClick={onEdit}>
              편집
            </Button>
          )}
        </Stack>
      )}

      <Box sx={{ height: 420, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={processedColumns as any}
          getRowId={(r) => getRowId(r) as any}
          checkboxSelection={isEditMode}
          rowSelectionModel={isEditMode ? selectionModel : []}
          onRowSelectionModelChange={isEditMode ? setSelectionModel : undefined}
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

      {/* 편집 모드일 때 하단 액션 버튼들 */}
      {isEditMode && onSave && onCancel && (
        <DetailEditActions
          open={isEditMode}
          onSave={onSave}
          onCancel={onCancel}
          size={size}
          isLoading={false}
          showDelete={!!onDeleteConfirm}
          selectedCount={selectionModel.length}
          onDelete={() => {
            if (onDeleteConfirm && selectionModel.length > 0) {
              onDeleteConfirm(selectionModel);
              setSelectionModel([]);
            }
          }}
        />
      )}
    </Box>
  );
};

export default EditableList;
