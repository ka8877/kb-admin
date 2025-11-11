// frontend/src/components/common/detail/DataDetail.tsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import type { GridColDef, GridValidRowModel, GridRenderEditCellParams } from '@mui/x-data-grid';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import DetailEditActions from '../actions/DetailEditActions';
import DataDetailActions from '../actions/DataDetailActions';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { useAlertDialog } from '../../../hooks/useAlertDialog';
import { toast } from 'react-toastify';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { formatDateForDisplay, formatDateForStorage } from '../../../utils/dateUtils';
import {
  CONFIRM_TITLES,
  CONFIRM_MESSAGES,
  TOAST_MESSAGES,
  ALERT_TITLES,
} from '../../../constants/message';

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
};

const defaultGetRowId =
  <T extends GridValidRowModel>(getter: DataDetailProps<T>['rowIdGetter']) =>
  (row: T) => {
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
  onSave,
  size = 'small',
  readOnlyFields = ['No', 'qst_id'], // 기본적으로 No, qst_id는 수정 불가
  selectFields,
  dateFields,
  dateFormat = 'YYYYMMDDHHmmss',
  validator,
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
        const isDateField = dateFields && dateFields.includes(col.field);

        // 날짜 필드인 경우
        if (isDateField) {
          return {
            ...col,
            editable: isEditMode && !readOnlyFields.includes(col.field),
            valueFormatter: (params: any) => {
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
    [columns, selectFields, dateFields, isEditMode, readOnlyFields, dateFormat],
  );

  // 행 업데이트 처리
  const processRowUpdate = useCallback((newRow: T, oldRow: T) => {
    setEditedData(newRow);
    return newRow;
  }, []);

  // DataGrid rows 메모이제이션
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
