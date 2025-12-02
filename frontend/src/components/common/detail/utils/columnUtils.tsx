import React from 'react';
import type { GridColDef, GridRenderEditCellParams } from '@mui/x-data-grid';
import type { SelectFieldOption } from '@/types/types';
import { formatDateForDisplay } from '@/utils/dateUtils';
import DateEditCell from '@/components/common/grid/DateEditCell';

type ProcessColumnParams<T> = {
  col: GridColDef<T>;
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
 * 컬럼을 편집 모드에 맞게 변환
 */
export const processColumn = <T extends Record<string, unknown>>({
  col,
  isEditMode,
  readOnlyFields,
  selectFields,
  dynamicSelectFields,
  dateFields,
  dateFormat,
  editedData,
  requiredFields,
}: ProcessColumnParams<T>): GridColDef<T> => {
  const isSelectField = selectFields && selectFields[col.field];
  const isDynamicSelectField = dynamicSelectFields && dynamicSelectFields[col.field];
  const isDateField = dateFields && dateFields.includes(col.field);

  // 필수 필드인 경우 headerName에 * 추가
  const isRequired = requiredFields.includes(col.field);
  const headerName = isRequired && col.headerName ? `${col.headerName} *` : col.headerName;

  // 날짜 필드인 경우
  if (isDateField) {
    return {
      ...col,
      headerName,
      editable: isEditMode && !readOnlyFields.includes(col.field),
      valueFormatter: (params: { value: string }) => {
        return formatDateForDisplay(params.value, dateFormat);
      },
      renderEditCell: (params: GridRenderEditCellParams) => {
        return <DateEditCell params={params} dateFormat={dateFormat} />;
      },
    };
  }

  // service_nm 필드: 값 변경 시 qst_ctgr도 즉시 비움
  if (col.field === 'service_nm') {
    return {
      ...col,
      headerName,
      type: 'singleSelect',
      valueOptions:
        selectFields?.service_nm?.map((opt) => ({
          value: opt.value,
          label: opt.label,
        })) ?? [],
      editable: isEditMode && !readOnlyFields.includes(col.field),
    };
  }

  // 동적 셀렉트 필드인 경우 (데이터에 따라 옵션이 변경됨)
  if (isDynamicSelectField) {
    const dynamicOptions = isDynamicSelectField(editedData);
    return {
      ...col,
      headerName,
      type: 'singleSelect',
      valueOptions: dynamicOptions.map((opt) => ({
        value: opt.value,
        label: opt.label,
      })),
      editable: isEditMode && !readOnlyFields.includes(col.field),
    };
  }

  // 셀렉트 필드인 경우 (읽기/수정 모드 모두)
  if (isSelectField) {
    return {
      ...col,
      headerName,
      type: 'singleSelect',
      valueOptions: isSelectField.map((opt) => ({
        value: opt.value,
        label: opt.label,
      })),
      editable: isEditMode && !readOnlyFields.includes(col.field),
    };
  }

  // 일반 필드
  if (isEditMode && !readOnlyFields.includes(col.field)) {
    return {
      ...col,
      headerName,
      editable: true,
    };
  }

  return {
    ...col,
    headerName,
    editable: false,
  };
};

/**
 * 셀이 셀렉트 필드인지 확인
 */
export const isSelectField = <T extends Record<string, unknown>>(
  field: string,
  processedColumns: GridColDef<T>[],
  selectFields?: Record<string, SelectFieldOption[]>,
  dynamicSelectFields?: Record<string, (data: T | undefined) => SelectFieldOption[]>,
): boolean => {
  const currentColumn = processedColumns.find((col) => col.field === field);
  return (
    currentColumn?.type === 'singleSelect' ||
    (selectFields && selectFields[field]) !== undefined ||
    (dynamicSelectFields && dynamicSelectFields[field]) !== undefined
  );
};
