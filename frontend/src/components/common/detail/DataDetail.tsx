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
import type { SelectFieldOption } from '@/types/types';
import type { ValidationResult } from '@/types/types';


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
  getRequiredFields?: (data: T | undefined) => string[]; // 필수 필드 목록을 반환하는 함수 (조건적 필수 포함)
};

// 날짜 필드 편집 셀 컴포넌트
const DateEditCell = React.memo(({ params, dateFormat }: { params: GridRenderEditCellParams; dateFormat: string }) => {
  const [open, setOpen] = React.useState(false);

  // 셀에 포커스가 오면 달력 자동 열기
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

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
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        format="YYYY-MM-DD HH:mm"
        slotProps={{
          textField: {
            size: 'small',
            fullWidth: true,
            onKeyDown: (e: React.KeyboardEvent) => {
              // Tab 키는 상위에서 처리하도록 전파
              if (e.key === 'Tab') {
                e.stopPropagation();
              }
              // Enter 키를 누르면 달력 열기
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
              }
            },
          },
        }}
      />
    </LocalizationProvider>
  );
});

DateEditCell.displayName = 'DateEditCell';

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
  getRequiredFields,
}: DataDetailProps<T>): JSX.Element => {
  const getRowId = useMemo(() => defaultGetRowId<T>(rowIdGetter), [rowIdGetter]);
  const { showConfirm } = useConfirmDialog();
  const { showAlert } = useAlertDialog();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedData, setEditedData] = useState<T | undefined>(data);
  const dataGridRef = useGridApiRef();
  const tabKeyPressedRef = React.useRef<{ field: string; rowId: string | number } | null>(null);
  const shouldMoveToNextCellRef = React.useRef(false); // 탭 키가 눌렸는지 추적

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
    // ref 초기화
    tabKeyPressedRef.current = null;
    shouldMoveToNextCellRef.current = false;
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
            toast.success(TOAST_MESSAGES.SAVE_SUCCESS);
            setIsEditMode(false);
            setHasInitialFocus(false);
            // ref 초기화
            tabKeyPressedRef.current = null;
            shouldMoveToNextCellRef.current = false;
          } catch (error) {
            toast.error(TOAST_MESSAGES.UPDATE_FAILED);
            console.error('저장 실패:', error);
          }
        }
      },
    });
  }, [validator, editedData, columns, showAlert, showConfirm, onSave]);

  // 필수 필드 목록 가져오기
  const requiredFields = useMemo(() => {
    return getRequiredFields ? getRequiredFields(editedData || data) : [];
  }, [getRequiredFields, editedData, data]);

  // 컬럼을 수정 모드에 맞게 변환
  const processedColumns = useMemo(
    () =>
      columns.map((col) => {
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
      requiredFields,
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

  // 다음 편집 가능한 셀 찾기
  const findNextEditableCell = useCallback(
    (currentField: string): { field: string; colIndex: number } | null => {
      const currentIndex = processedColumns.findIndex((col) => col.field === currentField);
      if (currentIndex === -1) return null;

      // 현재 셀 다음부터 마지막까지 순회
      for (let i = currentIndex + 1; i < processedColumns.length; i++) {
        const col = processedColumns[i];
        if (col.editable && !readOnlyFields.includes(col.field)) {
          return { field: col.field, colIndex: i };
        }
      }

      return null;
    },
    [processedColumns, readOnlyFields],
  );

  // 다음 셀로 이동하는 함수 (포커스만 이동, 편집 모드 진입 안 함)
  const moveToNextCell = useCallback(
    (rowId: string | number, currentField: string) => {
      const nextCell = findNextEditableCell(currentField);

      if (nextCell && dataGridRef.current) {
        // 다음 셀로 포커스만 이동
        setTimeout(() => {
          if (dataGridRef.current) {
            dataGridRef.current.setCellFocus(rowId, nextCell.field);

            // 셀이 보이도록 스크롤
            const cellElement = dataGridRef.current.getCellElement(rowId, nextCell.field);
            if (cellElement) {
              cellElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
            }
          }
        }, 50);
      } else {
        // 다음 편집 가능한 셀이 없으면 현재 셀에 포커스 유지 (DataGrid 밖으로 나가지 않도록)
        setTimeout(() => {
          if (dataGridRef.current) {
            dataGridRef.current.setCellFocus(rowId, currentField);
          }
        }, 50);
      }
    },
    [findNextEditableCell],
  );

  // 셀 편집 종료 핸들러 (selectbox에서 Tab 키 처리용)
  const handleCellEditStop = useCallback(
    (params: any, event?: any) => {
      if (!isEditMode) return;

      const currentField = params.field;
      const rowId = params.id;

      // 현재 셀이 selectbox인지 확인
      const currentColumn = processedColumns.find((col) => col.field === currentField);
      const isSelectField =
        currentColumn?.type === 'singleSelect' ||
        (selectFields && selectFields[currentField]) ||
        (dynamicSelectFields && dynamicSelectFields[currentField]);

      if (isSelectField) {
        // Tab 키가 눌린 경우에만 다음 셀로 포커스 이동 (편집 모드 진입 안 함)
        if (shouldMoveToNextCellRef.current && tabKeyPressedRef.current) {
          const { field, rowId: tabRowId } = tabKeyPressedRef.current;
          if (currentField === field && rowId === tabRowId) {
            tabKeyPressedRef.current = null;
            shouldMoveToNextCellRef.current = false;
            // 약간의 지연 후 다음 셀로 포커스만 이동
            setTimeout(() => {
              moveToNextCell(rowId, field);
            }, 50);
            return;
          }
        }
        
        // 탭 키가 아닌 경우 (엔터 등) 자동 이동 방지
        if (tabKeyPressedRef.current && tabKeyPressedRef.current.field === currentField && tabKeyPressedRef.current.rowId === rowId) {
          tabKeyPressedRef.current = null;
        }
        shouldMoveToNextCellRef.current = false;
        
        // DataGrid가 자동으로 다음 셀로 이동하려고 하는 것을 방지하기 위해
        // 현재 셀에 포커스를 다시 설정
        setTimeout(() => {
          if (dataGridRef.current) {
            // 포커스를 현재 셀로 다시 설정 (자동 이동 방지)
            dataGridRef.current.setCellFocus(rowId, currentField);
          }
        }, 10);
      }
    },
    [isEditMode, moveToNextCell, processedColumns, selectFields, dynamicSelectFields],
  );

  // 셀 키보드 이벤트 핸들러
  const handleCellKeyDown = useCallback(
    (params: any, event: React.KeyboardEvent) => {
      if (!isEditMode) return;

      // Tab 키 처리
      if (event.key === 'Tab' && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();

        const currentField = params.field;
        const rowId = params.id;

        // 현재 셀이 편집 중인지 확인
        const isEditing = params.cellMode === 'edit';
        
        // 현재 셀이 selectbox인지 확인
        const currentColumn = processedColumns.find((col) => col.field === currentField);
        const isSelectField =
          currentColumn?.type === 'singleSelect' ||
          (selectFields && selectFields[currentField]) ||
          (dynamicSelectFields && dynamicSelectFields[currentField]);

        if (isEditing) {
          // 편집 중인 경우 편집 모드를 종료하고 다음 셀로 이동
          if (isSelectField) {
            // selectbox인 경우 Tab 키를 기록하고 편집 종료를 기다림
            tabKeyPressedRef.current = { field: currentField, rowId };
            shouldMoveToNextCellRef.current = true;
            // 편집 모드 종료는 selectbox가 자동으로 처리함
          } else {
            // 일반 필드인 경우 즉시 처리
            shouldMoveToNextCellRef.current = true;
            if (dataGridRef.current) {
              dataGridRef.current.stopCellEditMode({
                id: rowId,
                field: currentField,
                ignoreModifications: false,
              });
            }
            // 약간의 지연 후 다음 셀로 포커스만 이동
            setTimeout(() => {
              moveToNextCell(rowId, currentField);
            }, 50);
          }
        } else {
          // 편집 중이 아닌 경우 (엔터 후 상태) 바로 다음 셀로 포커스만 이동
          moveToNextCell(rowId, currentField);
        }
      } else if (event.key === 'Enter') {
        // Enter 키 처리: selectbox에서 엔터를 눌렀을 때 자동 이동 방지
        const currentField = params.field;
        const rowId = params.id;
        const currentColumn = processedColumns.find((col) => col.field === currentField);
        const isSelectField =
          currentColumn?.type === 'singleSelect' ||
          (selectFields && selectFields[currentField]) ||
          (dynamicSelectFields && dynamicSelectFields[currentField]);

        if (isSelectField) {
          // selectbox인 경우 자동 이동 방지를 위해 ref 초기화
          shouldMoveToNextCellRef.current = false;
          if (tabKeyPressedRef.current && tabKeyPressedRef.current.field === currentField && tabKeyPressedRef.current.rowId === rowId) {
            tabKeyPressedRef.current = null;
          }
        }
      }
    },
    [isEditMode, processedColumns, selectFields, dynamicSelectFields, moveToNextCell],
  );

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

      <Box sx={{ width: '100%',}}>
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
          sx={{
            '& .MuiDataGrid-cell': {
              whiteSpace: 'normal',
              lineHeight: '1.3',
              py: 0.25,
              px: 0.75,
            },
            // 서비스명 ~ 연령대까지 셀 간격 더 줄이기
            '& .MuiDataGrid-cell[data-field="service_nm"], & .MuiDataGrid-cell[data-field="display_ctnt"], & .MuiDataGrid-cell[data-field="qst_ctgr"], & .MuiDataGrid-cell[data-field="qst_style"], & .MuiDataGrid-cell[data-field="parent_id"], & .MuiDataGrid-cell[data-field="parent_nm"], & .MuiDataGrid-cell[data-field="age_grp"]': {
              px: 0.5,
            },
            '& .MuiDataGrid-columnHeader[data-field="service_nm"], & .MuiDataGrid-columnHeader[data-field="display_ctnt"], & .MuiDataGrid-columnHeader[data-field="qst_ctgr"], & .MuiDataGrid-columnHeader[data-field="qst_style"], & .MuiDataGrid-columnHeader[data-field="parent_id"], & .MuiDataGrid-columnHeader[data-field="parent_nm"], & .MuiDataGrid-columnHeader[data-field="age_grp"]': {
              px: 0.5,
            },
            // 노출 시작일시 ~ 반영일시까지 셀 간격 더 줄이기
            '& .MuiDataGrid-cell[data-field="imp_start_date"], & .MuiDataGrid-cell[data-field="imp_end_date"], & .MuiDataGrid-cell[data-field="updatedAt"], & .MuiDataGrid-cell[data-field="registeredAt"], & .MuiDataGrid-cell[data-field="start_date"], & .MuiDataGrid-cell[data-field="end_date"]': {
              px: 0.5,
            },
            '& .MuiDataGrid-columnHeader[data-field="imp_start_date"], & .MuiDataGrid-columnHeader[data-field="imp_end_date"], & .MuiDataGrid-columnHeader[data-field="updatedAt"], & .MuiDataGrid-columnHeader[data-field="registeredAt"], & .MuiDataGrid-columnHeader[data-field="start_date"], & .MuiDataGrid-columnHeader[data-field="end_date"]': {
              px: 0.5,
            },
            '& .MuiDataGrid-columnHeader': {
              py: 0.5,
              px: 0.75,
            },
            '& .MuiDataGrid-columnHeaders': {
              minHeight: '36px !important',
              maxHeight: '36px !important',
            },
            '& .MuiDataGrid-row': {
              minHeight: '32px !important',
              maxHeight: 'none !important',
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
