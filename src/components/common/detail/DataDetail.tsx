// frontend/src/components/common/detail/DataDetail.tsx
import React, { useMemo, useCallback } from 'react';
import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import DetailEditActions from '../actions/DetailEditActions';
import DataDetailActions from '../actions/DataDetailActions';
import type { SelectFieldOption } from '@/types/types';
import type { ValidationResult } from '@/types/types';
import { useDataDetailState } from './hooks/useDataDetailState';
import { useDataDetailColumns } from './hooks/useDataDetailColumns';
import { useDataDetailKeyboard } from './hooks/useDataDetailKeyboard';
import { useDataDetailValidation } from './hooks/useDataDetailValidation';
import { dataGridStyles } from './utils/dataGridStyles';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { CONFIRM_TITLES, CONFIRM_MESSAGES } from '@/constants/message';

export type DataDetailProps<T extends GridValidRowModel = GridValidRowModel> = {
  data?: T;
  columns: GridColDef<T>[];
  isLoading?: boolean;
  rowIdGetter?: keyof T | ((row: T) => string | number);
  onEdit?: () => void;
  onDelete?: () => Promise<void> | void;
  onBack?: () => void;
  onSave?: (updatedData: T) => Promise<void> | void;
  size?: 'small' | 'medium';
  readOnlyFields?: string[]; // No, qst_id 같은 수정 불가 필드들
  selectFields?: Record<string, SelectFieldOption[]>; // 셀렉트 박스로 표시할 필드와 옵션들
  dateFields?: string[]; // 날짜 필드 목록
  dateFormat?: string; // 날짜 저장 형식 (기본: YYYYMMDDHHmmss)
  validator?: (data: T) => Record<string, ValidationResult>; // validation 함수
  dynamicSelectFields?: Record<string, (data: T | undefined) => SelectFieldOption[]>; // 동적 셀렉트 필드 (데이터에 따라 옵션이 변경됨)
  dynamicSelectFieldDependencies?: Record<string, string[]>; // 동적 셀렉트 필드가 의존하는 필드들 (예: { qst_ctgr: ['service_nm'] })
  getRequiredFields?: (data: T | undefined) => string[]; // 필수 필드 목록을 반환하는 함수 (조건적 필수 포함)
  checkChangesBeforeSave?: boolean; // 저장 전 변경사항 체크 여부 (기본: false)
  excludeFieldsFromChangeCheck?: string[]; // 변경사항 체크에서 제외할 필드 목록
  canEdit?: boolean; // 편집 가능 여부 (기본: true, false면 편집 버튼 숨김)
};

const defaultGetRowId =
  <T extends GridValidRowModel>(getter: DataDetailProps<T>['rowIdGetter']) =>
  (row: T) => {
    if (!getter) {
      const rowObj = row as Record<string, unknown>;
      return (rowObj.id ?? rowObj.id_str ?? '') as string | number;
    }
    if (typeof getter === 'function') return getter(row);
    return row[getter as keyof T] as string | number;
  };

const DataDetail = <T extends GridValidRowModel = GridValidRowModel>({
  data,
  columns,
  isLoading,
  rowIdGetter,
  onEdit,
  onDelete,
  onBack,
  onSave,
  size = 'small',
  readOnlyFields = ['No', 'qst_id'],
  selectFields,
  dateFields,
  dateFormat = 'YYYYMMDDHHmmss',
  validator,
  dynamicSelectFields,
  dynamicSelectFieldDependencies,
  getRequiredFields,
  checkChangesBeforeSave = false,
  excludeFieldsFromChangeCheck = ['updatedAt', 'createdAt', 'no'],
  canEdit = true,
}: DataDetailProps<T>): JSX.Element => {
  const getRowId = useMemo(() => defaultGetRowId<T>(rowIdGetter), [rowIdGetter]);
  const dataGridRef = useGridApiRef();
  const { showConfirm } = useConfirmDialog();

  // 상태 관리
  const {
    isEditMode,
    editedData,
    hasInitialFocus,
    tabKeyPressedRef,
    shouldMoveToNextCellRef,
    setIsEditMode,
    setEditedData,
    setHasInitialFocus,
    handleEditClick,
    handleCancelEdit,
  } = useDataDetailState({
    data,
    columns,
    readOnlyFields,
    getRowId,
    dataGridRef,
  });

  // 필수 필드 목록
  const requiredFields = useMemo(() => {
    return getRequiredFields ? getRequiredFields(editedData || data) : [];
  }, [getRequiredFields, editedData, data]);

  // 컬럼 처리
  const processedColumns = useDataDetailColumns({
    columns,
    isEditMode,
    readOnlyFields,
    selectFields,
    dynamicSelectFields,
    dateFields,
    dateFormat,
    editedData,
    requiredFields,
  });

  // 키보드 이벤트 처리
  const { handleCellKeyDown, handleCellEditStop } = useDataDetailKeyboard({
    isEditMode,
    processedColumns,
    readOnlyFields,
    selectFields,
    dynamicSelectFields,
    dataGridRef,
    tabKeyPressedRef,
    shouldMoveToNextCellRef,
  });

  // 검증 및 저장 처리
  const { handleSaveClick } = useDataDetailValidation({
    data,
    editedData,
    columns,
    validator,
    checkChangesBeforeSave,
    excludeFieldsFromChangeCheck,
    onSave,
    setIsEditMode,
    setHasInitialFocus,
    tabKeyPressedRef,
    shouldMoveToNextCellRef,
  });

  // 행 업데이트 처리
  const processRowUpdate = useCallback(
    (newRow: T, oldRow: T) => {
      const updatedRow = { ...newRow };

      if (dynamicSelectFields && dynamicSelectFieldDependencies) {
        Object.keys(dynamicSelectFieldDependencies).forEach((dynamicField) => {
          const dependencies = dynamicSelectFieldDependencies[dynamicField];
          if (dependencies && dependencies.length > 0) {
            const dependencyChanged = dependencies.some((depField) => {
              const oldVal = (oldRow as Record<string, unknown>)[depField];
              const newVal = (newRow as Record<string, unknown>)[depField];
              return oldVal !== newVal;
            });

            if (dependencyChanged) {
              (updatedRow as Record<string, unknown>)[dynamicField] = '';
            }
          }
        });
      }

      setEditedData(updatedRow);
      return updatedRow;
    },
    [dynamicSelectFields, dynamicSelectFieldDependencies, setEditedData],
  );

  // DataGrid rows
  const rows = useMemo(() => (editedData ? [editedData] : data ? [data] : []), [editedData, data]);

  // 에러 핸들러
  const handleProcessRowUpdateError = useCallback((error: Error) => {
    console.error('Row update error:', error);
  }, []);

  const handleDeleteClick = useCallback(() => {
    if (!onDelete) return;

    showConfirm({
      title: CONFIRM_TITLES.DELETE,
      message: CONFIRM_MESSAGES.DELETE,
      confirmText: '삭제',
      cancelText: '취소',
      severity: 'error',
      onConfirm: () => {
        const executeDelete = async () => {
          await onDelete();
        };
        executeDelete();
      },
    });
  }, [onDelete, showConfirm]);

  return (
    <Box>
      {/* 일반 모드 액션 버튼들 */}
      {!isEditMode && (
        <DataDetailActions
          onBack={onBack}
          onEdit={canEdit && onSave ? handleEditClick : undefined}
          onDelete={onDelete ? handleDeleteClick : undefined}
          showEdit={canEdit && !!onSave}
          showDelete={!!onDelete}
        />
      )}

      <Box sx={{ width: '100%' }}>
        <DataGrid
          apiRef={dataGridRef}
          rows={rows}
          columns={processedColumns}
          getRowId={getRowId}
          hideFooter
          disableRowSelectionOnClick
          density="compact"
          autoHeight
          loading={isLoading}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          onCellKeyDown={handleCellKeyDown}
          onCellEditStop={handleCellEditStop}
          sx={dataGridStyles}
        />
      </Box>

      {/* 수정 모드 액션 버튼들 */}
      <DetailEditActions
        open={isEditMode}
        onSave={handleSaveClick}
        onCancel={handleCancelEdit}
        size={size}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default DataDetail;
