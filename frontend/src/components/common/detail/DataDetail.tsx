// frontend/src/components/common/detail/DataDetail.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { GridColDef, GridValidRowModel, GridRenderEditCellParams } from '@mui/x-data-grid';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import DetailEditActions from '../actions/DetailEditActions';
import DataDetailActions from '../actions/DataDetailActions';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { formatDateForDisplay, formatDateForStorage } from '@/utils/dateUtils';
import {
  CONFIRM_TITLES,
  CONFIRM_MESSAGES,
  TOAST_MESSAGES,
  ALERT_TITLES,
} from '@/constants/message';

export type SelectFieldOption = {
  label: string;
  value: string;
};

export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

export type DataDetailProps<T extends GridValidRowModel = GridValidRowModel> = {
  data?: T;
  columns: GridColDef<T>[];
  isLoading?: boolean;
  rowIdGetter?: keyof T | ((row: T) => string | number);
  onEdit?: () => void;
  onDelete?: () => void;
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
  readOnlyFields = ['No', 'qst_id'], // 기본적으로 No, qst_id는 수정 불가
  selectFields,
  dateFields,
  dateFormat = 'YYYYMMDDHHmmss',
  validator,
  dynamicSelectFields,
  dynamicSelectFieldDependencies,
}: DataDetailProps<T>): JSX.Element => {
  const getRowId = useMemo(() => defaultGetRowId<T>(rowIdGetter), [rowIdGetter]);
  const { showConfirm } = useConfirmDialog();
  const { showAlert } = useAlertDialog();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<T | undefined>(data);
  const dataGridRef = useGridApiRef();

  // 수정 모드로 전환
  const handleEditClick = useCallback(() => {
    setIsEditMode(true);
    setEditedData(data);
    // onEdit는 화면 이동용이므로 호출하지 않음
  }, [data]);

  // 수정 모드 진입 시에만 첫 번째 편집 가능한 셀에 포커싱 및 편집 모드 진입
  const [hasInitialFocus, setHasInitialFocus] = useState(false);

  useEffect(() => {
    if (isEditMode && !hasInitialFocus && dataGridRef.current && editedData) {
      // 약간의 지연 후 포커싱 (DataGrid 렌더링 완료 후)
      setTimeout(() => {
        const firstEditableColumn = columns.find((col) => !readOnlyFields.includes(col.field));

        if (firstEditableColumn && dataGridRef.current) {
          const rowId = getRowId(editedData);
          try {
            // 셀에 포커스를 주고 바로 편집 모드로 진입
            dataGridRef.current.setCellFocus(rowId, firstEditableColumn.field);
            // 약간의 추가 지연 후 편집 모드 시작 (포커싱 후)
            setTimeout(() => {
              if (dataGridRef.current) {
                dataGridRef.current.startCellEditMode({
                  id: rowId,
                  field: firstEditableColumn.field,
                });
              }
            }, 50);
            setHasInitialFocus(true);
          } catch (error) {
            console.warn('포커싱/편집 모드 진입 실패:', error);
          }
        }
      }, 100);
    } else if (!isEditMode) {
      // 수정 모드를 벗어나면 초기 포커스 상태를 리셋
      setHasInitialFocus(false);
    }
  }, [isEditMode, hasInitialFocus, editedData, columns, readOnlyFields, getRowId]);

  // 수정 취소
  const handleCancelEdit = useCallback(() => {
    setIsEditMode(false);
    setEditedData(data);
    setHasInitialFocus(false);
  }, [data]);

  // 저장 확인
  const handleSaveClick = useCallback(() => {
    // Validation 체크 (컬럼 순서대로 검증, 첫 번째 에러에서 중단)
    if (validator && editedData) {
      const validationResults = validator(editedData);

      // 컬럼 순서대로 validation 체크
      for (const col of columns) {
        const fieldName = col.field;
        const result = validationResults[fieldName];

        if (result && !result.isValid) {
          // 첫 번째 에러 발견 시 즉시 alert 표시하고 return
          const errorMessage = `1행: ${result.message}`;
          showAlert({
            title: ALERT_TITLES.VALIDATION_CHECK,
            message: errorMessage,
            severity: 'error',
          });
          return;
        }
      }
    }

    showConfirm({
      title: CONFIRM_TITLES.SAVE,
      message: CONFIRM_MESSAGES.SAVE_CHANGES,
      onConfirm: async () => {
        if (editedData && onSave) {
          try {
            await onSave(editedData);
            toast.success(TOAST_MESSAGES.UPDATE_REQUESTED);
            setIsEditMode(false);
            setHasInitialFocus(false);
          } catch (error) {
            toast.error(TOAST_MESSAGES.UPDATE_FAILED);
            console.error('저장 실패:', error);
          }
        }
      },
    });
  }, [validator, editedData, columns, showAlert, showConfirm, onSave]);

  // 컬럼을 수정 모드에 맞게 변환
  const processedColumns = useMemo(
    () =>
      columns.map((col) => {
        const isSelectField = selectFields && selectFields[col.field];
        const isDynamicSelectField = dynamicSelectFields && dynamicSelectFields[col.field];
        const isDateField = dateFields && dateFields.includes(col.field);

        // 날짜 필드인 경우
        if (isDateField) {
          return {
            ...col,
            editable: isEditMode && !readOnlyFields.includes(col.field),
            valueFormatter: (params: { value: string }) => {
              return formatDateForDisplay(params.value, dateFormat);
            },
            renderEditCell: (params: GridRenderEditCellParams) => {
              const handleDateChange = (newValue: dayjs.Dayjs | null) => {
                const dateObj = newValue ? newValue.toDate() : null;
                const formattedValue = formatDateForStorage(dateObj, dateFormat);
                params.api.setEditCellValue({
                  id: params.id,
                  field: params.field,
                  value: formattedValue,
                });
              };

              const currentValue = params.value ? dayjs(params.value, dateFormat) : null;

              return (
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    value={currentValue}
                    onChange={handleDateChange}
                    format="YYYY-MM-DD HH:mm"
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                      },
                    }}
                  />
                </LocalizationProvider>
              );
            },
          };
        }

        // service_nm 필드: 값 변경 시 qst_ctgr도 즉시 비움
        if (col.field === 'service_nm') {
          return {
            ...col,
            type: 'singleSelect',
            valueOptions:
              selectFields?.service_nm?.map((opt) => ({
                value: opt.value,
                label: opt.label,
              })) ?? [],
            editable: isEditMode && !readOnlyFields.includes(col.field),
            // renderEditCell 완전히 제거 (DataGrid 기본 렌더 사용)
          };
        }

        // 동적 셀렉트 필드인 경우 (데이터에 따라 옵션이 변경됨)
        if (isDynamicSelectField) {
          const dynamicOptions = isDynamicSelectField(editedData);
          return {
            ...col,
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
            editable: true,
          };
        }

        return {
          ...col,
          editable: false,
        };
      }),
    [
      columns,
      selectFields,
      dynamicSelectFields,
      dateFields,
      isEditMode,
      readOnlyFields,
      dateFormat,
      editedData,
    ],
  );

  // 행 업데이트 처리 (셀 값 변경 시 즉시 호출됨)
  const processRowUpdate = useCallback(
    (newRow: T, oldRow: T) => {
      console.log('=== processRowUpdate ===');
      console.log('oldRow:', oldRow);
      console.log('newRow:', newRow);

      const updatedRow = { ...newRow };

      // dynamicSelectFields와 의존성이 정의된 경우
      if (dynamicSelectFields && dynamicSelectFieldDependencies) {
        console.log('Has dynamic config');

        // 각 동적 필드에 대해 체크
        Object.keys(dynamicSelectFieldDependencies).forEach((dynamicField) => {
          const dependencies = dynamicSelectFieldDependencies[dynamicField];
          console.log(`Dynamic field: ${dynamicField}, dependencies:`, dependencies);

          if (dependencies && dependencies.length > 0) {
            // 의존 필드 중 하나라도 변경되었는지 확인
            const dependencyChanged = dependencies.some((depField) => {
              const oldVal = (oldRow as Record<string, unknown>)[depField];
              const newVal = (newRow as Record<string, unknown>)[depField];
              const changed = oldVal !== newVal;
              console.log(`  ${depField}: "${oldVal}" -> "${newVal}" (changed: ${changed})`);
              return changed;
            });

            if (dependencyChanged) {
              console.log(`  ✓ Clearing ${dynamicField}`);
              // 의존 필드가 변경되었으면 동적 필드 값을 초기화
              (updatedRow as Record<string, unknown>)[dynamicField] = '';
            }
          }
        });
      }

      console.log('updatedRow:', updatedRow);
      setEditedData(updatedRow);
      return updatedRow;
    },
    [dynamicSelectFields, dynamicSelectFieldDependencies],
  ); // DataGrid rows 메모이제이션
  const rows = useMemo(() => (editedData ? [editedData] : data ? [data] : []), [editedData, data]);

  // 에러 핸들러 메모이제이션
  const handleProcessRowUpdateError = useCallback((error: Error) => {
    console.error('Row update error:', error);
  }, []);

  return (
    <Box>
      {/* 일반 모드 액션 버튼들 */}
      {!isEditMode && (
        <DataDetailActions
          onBack={onBack}
          onEdit={onSave ? handleEditClick : undefined}
          onDelete={onDelete}
          showEdit={!!onSave}
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
          density="comfortable"
          autoHeight
          loading={isLoading}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          sx={{
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal',
              lineHeight: '1.5',
              py: 1,
            },
            // 셀렉트 박스 UI 깨짐 방지
            '& .MuiInputBase-root, & .MuiSelect-root': {
              minWidth: 120,
              boxSizing: 'border-box',
              width: '100%',
              maxWidth: '100%',
            },
            '& .MuiSelect-select': {
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            },
          }}
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
