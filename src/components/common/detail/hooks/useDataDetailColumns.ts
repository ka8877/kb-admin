import { useMemo } from 'react';
import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import type { SelectFieldOption } from '@/types/types';
import { processColumn } from '../utils/columnUtils';

type UseDataDetailColumnsParams<T extends GridValidRowModel> = {
  columns: GridColDef<T>[];
  isEditMode: boolean;
  readOnlyFields: string[];
  selectFields?: Record<string, SelectFieldOption[]>;
  dynamicSelectFields?: Record<string, (data: T | undefined) => SelectFieldOption[]>;
  dateFields?: string[];
  dateFormat: string;
  editedData: T | undefined;
  requiredFields: string[];
};

/**
 * DataDetail 컴포넌트의 컬럼 처리 훅
 */
export const useDataDetailColumns = <T extends GridValidRowModel>({
  columns,
  isEditMode,
  readOnlyFields,
  selectFields,
  dynamicSelectFields,
  dateFields,
  dateFormat,
  editedData,
  requiredFields,
}: UseDataDetailColumnsParams<T>) => {
  const processedColumns = useMemo(
    () =>
      columns.map((col) =>
        processColumn({
          col,
          isEditMode,
          readOnlyFields,
          selectFields,
          dynamicSelectFields,
          dateFields,
          dateFormat,
          editedData,
          requiredFields,
        }),
      ),
    [
      columns,
      isEditMode,
      readOnlyFields,
      selectFields,
      dynamicSelectFields,
      dateFields,
      dateFormat,
      editedData,
      requiredFields,
    ],
  );

  return processedColumns;
};
