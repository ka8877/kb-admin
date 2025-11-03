// frontend/src/components/common/detail/DataDetail.tsx
import React from 'react';
import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export type DataDetailProps<T extends GridValidRowModel = GridValidRowModel> = {
  data?: T;
  columns: GridColDef<T>[];
  isLoading?: boolean;
  rowIdGetter?: keyof T | ((row: T) => string | number);
  onEdit?: () => void;
  onDelete?: () => void;
  onBack?: () => void;
  size?: 'small' | 'medium';
};

const defaultGetRowId = <T extends GridValidRowModel,>(getter: DataDetailProps<T>['rowIdGetter']) => (row: T) => {
  if (!getter) return (row as any).id ?? (row as any).id_str ?? '';
  if (typeof getter === 'function') return getter(row);
  return (row as any)[getter as string];
};

const DataDetail = <T extends GridValidRowModel = GridValidRowModel>({
  data,
  columns,
  isLoading,
  rowIdGetter,
  onEdit,
  onDelete,
  onBack,
  size = 'small',
}: DataDetailProps<T>): JSX.Element => {
  const getRowId = defaultGetRowId<T>(rowIdGetter);

  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Button variant="outlined" size={size} onClick={onBack}>
          목록으로
        </Button>
        {onEdit && (
          <Button variant="contained" size={size} onClick={onEdit}>
            수정
          </Button>
        )}
        {onDelete && (
          <Button variant="outlined" color="error" size={size} onClick={onDelete}>
            삭제
          </Button>
        )}
      </Stack>

      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={data ? [data] : []}
          columns={columns}
          getRowId={getRowId}
          hideFooter
          disableRowSelectionOnClick
          density="comfortable"
          autoHeight
          loading={isLoading}
          sx={{
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal',
              lineHeight: '1.5',
              py: 1,
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default DataDetail;