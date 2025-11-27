import React, { useCallback, useMemo } from 'react';
import { Box } from '@mui/material';
import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import EditableList from '@/components/common/list/EditableList';
import type { ValidationResult } from '@/types/types';

export type ExcelListPreviewProps<T extends GridValidRowModel = GridValidRowModel> = {
  data: T[];
  columns: GridColDef<T>[];
  rowIdGetter?: keyof T | ((row: T) => string | number);
  readOnlyFields?: string[];
  selectFields?: Record<string, Array<{ label: string; value: string }>>;
  dateFields?: string[];
  dateFormat?: string;
  validator?: (data: T) => Record<string, ValidationResult>;
  getDynamicSelectOptions?: (row: T) => Array<{ label: string; value: string }>;
  dynamicSelectFields?: string[]; // 동적 셀렉트를 적용할 필드 목록
  onProcessRowUpdate?: (newRow: T, oldRow: T) => T;
  getRequiredFields?: (row: T) => string[];
  onDataChange?: (updatedData: T[]) => void;
  onAddRow?: () => void; // 행 추가 핸들러
};

const ExcelListPreview = <T extends GridValidRowModel = GridValidRowModel>({
  data,
  columns,
  rowIdGetter = 'no',
  readOnlyFields = ['no'],
  selectFields,
  dateFields,
  dateFormat = 'YYYYMMDDHHmmss',
  validator,
  getDynamicSelectOptions,
  dynamicSelectFields,
  onProcessRowUpdate,
  getRequiredFields,
  onDataChange,
  onAddRow,
}: ExcelListPreviewProps<T>): JSX.Element => {
  const handleSave = useCallback(
    (editedData: T[]) => {
      if (onDataChange) {
        onDataChange(editedData);
      }
    },
    [onDataChange],
  );

  // 데이터 변경 시 강제 리렌더링을 위한 key 생성
  const listKey = useMemo(() => JSON.stringify(data.map((row: any) => row.no || row.id)), [data]);

  if (data.length === 0) {
    return <></>;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <EditableList<T>
        key={listKey}
        columns={columns}
        rowIdGetter={rowIdGetter}
        isEditMode={true}
        onSave={handleSave}
        readOnlyFields={readOnlyFields}
        selectFields={selectFields}
        dateFields={dateFields}
        dateFormat={dateFormat}
        validator={validator}
        getDynamicSelectOptions={getDynamicSelectOptions}
        dynamicSelectFields={dynamicSelectFields}
        onProcessRowUpdate={onProcessRowUpdate}
        externalRows={data}
        getRequiredFields={getRequiredFields}
        showPagination={true}
        pageSizeOptions={[10, 20, 50, 100]}
        defaultPageSize={20}
        showExcelActions={true}
        onAddRow={onAddRow}
      />
    </Box>
  );
};

export default ExcelListPreview;
