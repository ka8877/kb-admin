import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  GridColDef,
  GridPaginationModel,
  GridValidRowModel,
  GridRenderEditCellParams,
} from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import DetailEditActions from '../actions/DetailEditActions';
import DetailNavigationActions from '../actions/DetailNavigationActions';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { formatDateForDisplay, formatDateForStorage } from '@/utils/dateUtils';

export type SelectFieldOption = {
  label: string;
  value: string;
};

export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

export type EditableListProps<T extends GridValidRowModel = GridValidRowModel> = {
  columns: GridColDef<T>[];
  fetcher?: () => Promise<T[]>;
  rows?: T[];
  rowIdGetter?: keyof T | ((row: T) => string | number);
  defaultPageSize?: number;
  pageSizeOptions?: number[]; // 페이지당 행 수 옵션
  showPagination?: boolean; // 페이지네이션 표시 여부
  size?: 'small' | 'medium';
  onRowClick?: (params: { id: string | number; row: T }) => void;
  onBack?: () => void; // 목록으로 버튼
  onEdit?: () => void; // 편집 버튼
  isEditMode?: boolean; // 편집 모드 상태
  onSave?: () => void; // 저장 버튼
  onCancel?: () => void; // 취소 버튼
  onDeleteConfirm?: (ids: (string | number)[]) => void; // 삭제 확인
  readOnlyFields?: string[]; // 편집 불가 필드들
  selectFields?: Record<string, SelectFieldOption[]>; // 셀렉트 박스로 표시할 필드와 옵션들
  dateFields?: string[]; // 날짜 필드 목록
  dateFormat?: string; // 날짜 저장 형식 (기본: YYYYMMDDHHmmss)
  validator?: (data: T) => Record<string, ValidationResult>; // validation 함수
  /**
   * (선택) 행별로 qst_ctgr 옵션을 동적으로 지정할 때 사용 (row: T) => 옵션 배열
   */
  getDynamicSelectOptions?: (row: T) => SelectFieldOption[];
  /**
   * (선택) 행 업데이트 직전에 newRow를 가공하거나 의존 필드를 초기화할 때 사용
   */
  onProcessRowUpdate?: (newRow: T, oldRow: T) => T;
  /**
   * (선택) 외부에서 데이터 변경을 감지하고 초기화하고 싶을 때 전달
   */
  externalRows?: T[];
};

const defaultGetRowId =
  <T extends GridValidRowModel>(getter: EditableListProps<T>['rowIdGetter']) =>
  (row: T) => {
    if (!getter) {
      const rowObj = row as Record<string, unknown>;
      return (rowObj.id ?? rowObj.id_str ?? '') as string | number;
    }
    if (typeof getter === 'function') return getter(row);
    return row[getter as keyof T] as string | number;
  };

const EditableList = <T extends GridValidRowModel = GridValidRowModel>({
  columns,
  fetcher,
  rows,
  rowIdGetter,
  defaultPageSize = 20,
  pageSizeOptions = [5, 10, 20, 50],
  showPagination = true,
  size = 'small',
  onRowClick,
  onBack,
  onEdit,
  isEditMode = false,
  onSave,
  onCancel,
  onDeleteConfirm,
  readOnlyFields = ['no', 'id'],
  selectFields,
  dateFields,
  dateFormat = 'YYYYMMDDHHmmss',
  validator,
  getDynamicSelectOptions,
  onProcessRowUpdate,
  externalRows,
}: EditableListProps<T>): JSX.Element => {
  const [data, setData] = useState<T[]>(rows ?? []);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: defaultPageSize,
  });
  const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);
  const { showAlert } = useAlertDialog();

  const getRowId = useMemo(() => defaultGetRowId<T>(rowIdGetter), [rowIdGetter]);

  // 편집 모드에 따라 컬럼 처리 (selectFields, dateFields 포함)
  const processedColumns = useMemo(() => {
    return columns.map((col) => {
      const isSelectField = selectFields && selectFields[col.field];
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

      // qst_ctgr 필드: 편집 모드에서 행별로 옵션 다르게 (getDynamicSelectOptions 사용)
      if (col.field === 'qst_ctgr' && isEditMode && typeof getDynamicSelectOptions === 'function') {
        return {
          ...col,
          type: 'singleSelect',
          valueOptions: (params: GridRenderEditCellParams) => {
            const row = data.find((r) => getRowId(r) === params.id);
            return row ? getDynamicSelectOptions(row) : [];
          },
          editable: isEditMode && !readOnlyFields.includes(col.field),
        };
      }

      // 셀렉트 필드인 경우
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
      return {
        ...col,
        editable: isEditMode && !readOnlyFields.includes(col.field),
      };
    });
  }, [
    columns,
    isEditMode,
    readOnlyFields,
    selectFields,
    dateFields,
    dateFormat,
    getDynamicSelectOptions,
    data,
  ]);

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

  useEffect(() => {
    if (Array.isArray(externalRows)) {
      setData(externalRows);
    }
  }, [externalRows]);

  useEffect(() => {
    if (!isEditMode) {
      if (Array.isArray(externalRows)) {
        setData(externalRows);
        return;
      }
      if (rows) {
        setData(rows);
      }
    }
  }, [isEditMode, externalRows, rows]);

  const handlePaginationChange = useCallback((model: GridPaginationModel) => {
    setPaginationModel(model);
  }, []);

  // 행 업데이트 처리 (셀 편집 시)
  const handleProcessRowUpdate = useCallback(
    (newRow: T, oldRow: T) => {
      const processedRow = onProcessRowUpdate ? onProcessRowUpdate(newRow, oldRow) : newRow;
      const updatedData = data.map((row) =>
        getRowId(row) === getRowId(processedRow) ? processedRow : row,
      );
      setData(updatedData);
      return processedRow;
    },
    [data, getRowId, onProcessRowUpdate],
  );

  // Validation을 포함한 저장 처리
  const handleSaveClick = useCallback(() => {
    console.log('🔍 handleSaveClick 호출됨');
    console.log('🔍 validator 존재:', !!validator);
    console.log('🔍 data.length:', data.length);

    // Validation 체크 (각 행을 순서대로 검증)
    if (validator && data.length > 0) {
      console.log('🔍 validation 시작');
      for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
        const row = data[rowIndex];
        console.log(`🔍 ${rowIndex + 1}행 검증 중:`, row);
        const validationResults = validator(row);
        console.log(`🔍 ${rowIndex + 1}행 validation 결과:`, validationResults);

        // 컬럼 순서대로 validation 체크
        for (const col of columns) {
          const fieldName = col.field;
          const result = validationResults[fieldName];

          if (result && !result.isValid) {
            // 첫 번째 에러 발견 시 즉시 alert 표시하고 return
            const rowNumber = rowIndex + 1;
            const errorMessage = `${rowNumber}행: ${result.message}`;
            console.log('🔍 validation 실패:', errorMessage);
            showAlert({
              title: '입력값 확인',
              message: errorMessage,
              severity: 'error',
            });
            return;
          }
        }
      }
      console.log('🔍 모든 validation 통과');
    }

    // Validation 통과 시 저장 실행
    if (onSave) {
      console.log('🔍 onSave 호출');
      onSave();
    }
  }, [validator, data, columns, showAlert, onSave]);

  const handleRowClick = useCallback(
    (params: { id: string | number; row: T }) => {
      if (onRowClick) {
        onRowClick({ id: params.id, row: params.row });
      }
    },
    [onRowClick],
  );

  const handleDeleteClick = useCallback(() => {
    if (onDeleteConfirm && selectionModel.length > 0) {
      onDeleteConfirm(selectionModel);
      setSelectionModel([]);
    }
  }, [onDeleteConfirm, selectionModel]);

  // selectedRowNumbers 계산 (useMemo로 최적화)
  const selectedRowNumbers = useMemo(
    () =>
      selectionModel
        .map((id) => {
          const row = data.find((r) => getRowId(r) === id);
          if (!row) return null;
          const rowObj = row as Record<string, unknown>;
          return typeof rowObj.no === 'number' ? rowObj.no : null;
        })
        .filter((num): num is number => num !== null),
    [selectionModel, data, getRowId],
  );

  return (
    <Box>
      {/* 상단 버튼들 - 일반 모드일 때만 */}
      {!isEditMode && <DetailNavigationActions onBack={onBack} onEdit={onEdit} />}

      <Box sx={{ height: 420, width: '100%' }}>
        <DataGrid
          key={JSON.stringify(data)}
          rows={data}
          columns={processedColumns}
          getRowId={getRowId}
          checkboxSelection={isEditMode}
          rowSelectionModel={isEditMode ? selectionModel : []}
          onRowSelectionModelChange={isEditMode ? setSelectionModel : undefined}
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={pageSizeOptions}
          hideFooterPagination={!showPagination}
          disableRowSelectionOnClick
          density="standard"
          autoHeight={false}
          processRowUpdate={handleProcessRowUpdate}
          onRowClick={onRowClick ? handleRowClick : undefined}
        />
      </Box>

      {/* 편집 모드일 때 하단 액션 버튼들 */}
      {isEditMode && onSave && onCancel && (
        <DetailEditActions
          open={isEditMode}
          onSave={handleSaveClick}
          onCancel={onCancel}
          size={size}
          isLoading={false}
          showDelete={!!onDeleteConfirm}
          selectedCount={selectionModel.length}
          selectedRowNumbers={selectedRowNumbers}
          onDelete={handleDeleteClick}
        />
      )}
    </Box>
  );
};

export default EditableList;
