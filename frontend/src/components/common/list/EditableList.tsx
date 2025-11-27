import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  GridColDef,
  GridPaginationModel,
  GridValidRowModel,
  GridRenderEditCellParams,
} from '@mui/x-data-grid';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import type { SelectChangeEvent } from '@mui/material/Select';
import DetailEditActions from '../actions/DetailEditActions';
import DetailNavigationActions from '../actions/DetailNavigationActions';
import ApprovalListActions from '../actions/ApprovalListActions';
import { ApprovalConfirmActions } from '../actions/ApprovalConfirmActions';
import ExcelEditActions from '../actions/ExcelEditActions';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { createProcessedColumns } from '@/components/common/upload/utils/listUtils';
import type { SelectFieldOption } from '@/types/types';
import type { ValidationResult } from '@/types/types';

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
  onSave?: (editedData: T[]) => void; // 저장 버튼 (편집된 데이터 전달)
  onCancel?: () => void; // 취소 버튼
  onDeleteConfirm?: (ids: (string | number)[]) => void; // 삭제 확인
  readOnlyFields?: string[]; // 편집 불가 필드들
  selectFields?: Record<string, SelectFieldOption[]>; // 셀렉트 박스로 표시할 필드와 옵션들
  dateFields?: string[]; // 날짜 필드 목록
  dateFormat?: string; // 날짜 저장 형식 (기본: YYYYMMDDHHmmss)
  validator?: (data: T) => Record<string, ValidationResult>; // validation 함수
  /**
   * (선택) 행별로 특정 필드(예: qst_ctgr) 옵션을 동적으로 지정할 때 사용 (row: T) => 옵션 배열
   */
  getDynamicSelectOptions?: (row: T) => SelectFieldOption[];
  /**
   * (선택) 동적 옵션을 적용할 필드 목록 (기본: ['qst_ctgr'])
   */
  dynamicSelectFields?: string[];
  /**
   * (선택) 행 업데이트 직전에 newRow를 가공하거나 의존 필드를 초기화할 때 사용
   */
  onProcessRowUpdate?: (newRow: T, oldRow: T) => T;
  /**
   * (선택) 외부에서 데이터 변경을 감지하고 초기화하고 싶을 때 전달
   */
  externalRows?: T[];
  /**
   * (선택) 필수 필드 목록을 반환하는 함수 (조건적 필수 포함, row별로 다를 수 있음)
   */
  getRequiredFields?: (row: T) => string[];
  /**
   * (선택) 결재 선택 모드 관련
   */
  onApproveSelect?: (next: boolean) => void; // 결재 선택 모드 토글
  approveSelectionMode?: boolean; // 결재 선택 모드 상태
  onApproveConfirm?: (selectedIds: (string | number)[]) => void; // 결재 확인
  onApproveCancel?: () => void; // 결재 취소 (기본: 선택 모드 해제)
  isLoading?: boolean; // 로딩 상태
  /**
   * (선택) 엑셀 업로드 모드 관련
   */
  showExcelActions?: boolean; // 엑셀 편집 액션 표시 여부 (행 추가/삭제)
  onAddRow?: () => void; // 행 추가 핸들러
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

type SelectEditCellProps = {
  params: GridRenderEditCellParams;
  options: SelectFieldOption[];
};

const SelectEditCell: React.FC<SelectEditCellProps> = ({ params, options }) => {
  const [open, setOpen] = useState(true);
  const committedRef = useRef(false);

  const handleChange = useCallback(
    async (event: SelectChangeEvent<string>) => {
      setOpen(false);
      committedRef.current = true;
      await params.api.setEditCellValue({
        id: params.id,
        field: params.field,
        value: event.target.value,
      });
      try {
        params.api.stopCellEditMode({
          id: params.id,
          field: params.field,
        });
      } catch (error) {
        console.debug('Cell not in edit mode:', error);
      }
    },
    [params],
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    try {
      params.api.stopCellEditMode({
        id: params.id,
        field: params.field,
        ignoreModifications: !committedRef.current,
      });
    } catch (error) {
      console.debug('Cell not in edit mode:', error);
    }
    committedRef.current = false;
  }, [params]);

  return (
    <Select
      value={params.value ?? ''}
      onChange={handleChange}
      onClose={handleClose}
      open={open}
      fullWidth
      autoFocus
      size="small"
      MenuProps={{
        PaperProps: {
          sx: {
            maxHeight: 240,
          },
        },
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
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
  dynamicSelectFields = ['qst_ctgr'],
  onProcessRowUpdate,
  externalRows,
  getRequiredFields,
  onApproveSelect,
  approveSelectionMode = false,
  onApproveConfirm,
  onApproveCancel,
  isLoading = false,
  showExcelActions = false,
  onAddRow,
}: EditableListProps<T>): JSX.Element => {
  const [data, setData] = useState<T[]>(rows ?? []);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: defaultPageSize,
  });
  const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);
  const { showAlert } = useAlertDialog();
  const tabKeyPressedRef = useRef<{ field: string; rowId: string | number } | null>(null);
  const shouldMoveToNextCellRef = useRef(false);
  const dataGridRef = useGridApiRef();

  const getRowId = useMemo(() => defaultGetRowId<T>(rowIdGetter), [rowIdGetter]);

  const renderSelectEditCell = useCallback(
    (params: GridRenderEditCellParams, options: SelectFieldOption[]) => {
      return <SelectEditCell params={params} options={options} />;
    },
    [],
  );

  // 필수 필드 목록 가져오기 (첫 번째 행 기준)
  const requiredFields = useMemo(() => {
    if (!getRequiredFields || data.length === 0) return [];
    return getRequiredFields(data[0]);
  }, [getRequiredFields, data]);

  // 편집 모드에 따라 컬럼 처리 (selectFields, dateFields 포함)
  const processedColumns = useMemo(
    () =>
      createProcessedColumns<T>({
        columns,
        isEditMode,
        readOnlyFields,
        selectFields,
        dateFields,
        dateFormat,
        getDynamicSelectOptions,
        dynamicSelectFields,
        data,
        getRowId,
        renderSelectEditCell,
        requiredFields,
        addRequiredMark: true,
      }),
    [
      columns,
      isEditMode,
      readOnlyFields,
      selectFields,
      dateFields,
      dateFormat,
      getDynamicSelectOptions,
      dynamicSelectFields,
      data,
      getRowId,
      renderSelectEditCell,
      requiredFields,
    ],
  );

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
      // externalRows가 변경되면 선택 초기화 (삭제 후 refetch 시 선택 초기화)
      setSelectionModel([]);
    }
  }, [externalRows]);

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

      // 부모 컴포넌트에 변경된 데이터 즉시 전달 (엑셀 업로드 모드 등에서 사용)
      if (onSave) {
        onSave(updatedData);
      }

      return processedRow;
    },
    [data, getRowId, onProcessRowUpdate, onSave],
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

    // Validation 통과 시 저장 실행 (편집된 데이터 전달)
    if (onSave) {
      console.log('🔍 onSave 호출');
      onSave(data);
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

  // 엑셀 모드에서 행 삭제 (API 호출 없이 로컬에서만 삭제)
  const handleExcelDeleteClick = useCallback(() => {
    if (selectionModel.length > 0) {
      const updatedData = data.filter((row) => !selectionModel.includes(getRowId(row)));
      setData(updatedData);
      setSelectionModel([]);

      // 부모 컴포넌트에 변경된 데이터 즉시 전달
      if (onSave) {
        onSave(updatedData);
      }
    }
  }, [selectionModel, data, getRowId, onSave]);

  // 엑셀 모드에서 행 추가
  const handleAddRowClick = useCallback(() => {
    if (onAddRow) {
      onAddRow();
    }
  }, [onAddRow]);

  // 다음 편집 가능한 셀 찾기
  const findNextEditableCell = useCallback(
    (
      currentField: string,
      currentRowIndex: number,
    ): { field: string; rowId: string | number } | null => {
      const currentColIndex = processedColumns.findIndex((col) => col.field === currentField);
      if (currentColIndex === -1) return null;

      // 같은 행에서 다음 셀 찾기
      for (let i = currentColIndex + 1; i < processedColumns.length; i++) {
        const col = processedColumns[i];
        if (col.editable && !readOnlyFields.includes(col.field)) {
          return { field: col.field, rowId: getRowId(data[currentRowIndex]) };
        }
      }

      // 다음 행의 첫 번째 편집 가능한 셀 찾기
      if (currentRowIndex + 1 < data.length) {
        for (let i = 0; i < processedColumns.length; i++) {
          const col = processedColumns[i];
          if (col.editable && !readOnlyFields.includes(col.field)) {
            return { field: col.field, rowId: getRowId(data[currentRowIndex + 1]) };
          }
        }
      }

      return null;
    },
    [processedColumns, readOnlyFields, data, getRowId],
  );

  // 다음 셀로 이동하는 함수 (포커스만 이동, 편집 모드 진입 안 함)
  const moveToNextCell = useCallback(
    (rowId: string | number, currentField: string) => {
      const currentRowIndex = data.findIndex((row) => getRowId(row) === rowId);
      if (currentRowIndex === -1) return;

      const nextCell = findNextEditableCell(currentField, currentRowIndex);

      if (nextCell && dataGridRef.current) {
        setTimeout(() => {
          if (dataGridRef.current) {
            dataGridRef.current.setCellFocus(nextCell.rowId, nextCell.field);

            // 셀이 보이도록 스크롤 (가로/세로 모두)
            const cellElement = dataGridRef.current.getCellElement(nextCell.rowId, nextCell.field);
            if (cellElement) {
              cellElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'nearest',
              });
            }
          }
        }, 50);
      } else {
        // 다음 편집 가능한 셀이 없으면 현재 셀에 포커스 유지
        setTimeout(() => {
          if (dataGridRef.current) {
            dataGridRef.current.setCellFocus(rowId, currentField);
          }
        }, 50);
      }
    },
    [data, getRowId, findNextEditableCell],
  );

  // 셀 편집 종료 핸들러
  const handleCellEditStop = useCallback(
    (params: any) => {
      if (!isEditMode) return;

      const currentField = params.field;
      const rowId = params.id;

      // 현재 셀이 selectbox인지 확인
      const currentColumn = processedColumns.find((col) => col.field === currentField);
      const isDynamicSelectField = dynamicSelectFields.includes(currentField);
      const isSelectField =
        currentColumn?.type === 'singleSelect' ||
        (selectFields && selectFields[currentField]) ||
        isDynamicSelectField;

      if (isSelectField) {
        // Tab 키가 눌린 경우에만 다음 셀로 포커스 이동
        if (shouldMoveToNextCellRef.current && tabKeyPressedRef.current) {
          const { field, rowId: tabRowId } = tabKeyPressedRef.current;
          if (currentField === field && rowId === tabRowId) {
            tabKeyPressedRef.current = null;
            shouldMoveToNextCellRef.current = false;
            setTimeout(() => {
              moveToNextCell(rowId, field);
            }, 50);
            return;
          }
        }

        // 탭 키가 아닌 경우 자동 이동 방지
        if (
          tabKeyPressedRef.current &&
          tabKeyPressedRef.current.field === currentField &&
          tabKeyPressedRef.current.rowId === rowId
        ) {
          tabKeyPressedRef.current = null;
        }
        shouldMoveToNextCellRef.current = false;

        // 현재 셀에 포커스를 다시 설정 (자동 이동 방지)
        setTimeout(() => {
          if (dataGridRef.current) {
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
        const isEditing = params.cellMode === 'edit';

        const currentColumn = processedColumns.find((col) => col.field === currentField);
        const isDynamicSelectField = dynamicSelectFields.includes(currentField);
        const isSelectField =
          currentColumn?.type === 'singleSelect' ||
          (selectFields && selectFields[currentField]) ||
          isDynamicSelectField;

        if (isEditing) {
          if (isSelectField) {
            tabKeyPressedRef.current = { field: currentField, rowId };
            shouldMoveToNextCellRef.current = true;
          } else {
            shouldMoveToNextCellRef.current = true;
            if (dataGridRef.current) {
              try {
                dataGridRef.current.stopCellEditMode({
                  id: rowId,
                  field: currentField,
                  ignoreModifications: false,
                });
              } catch (error) {
                // 셀이 이미 편집 모드가 아닌 경우 무시
                console.debug('Cell not in edit mode:', error);
              }
            }
            setTimeout(() => {
              moveToNextCell(rowId, currentField);
            }, 50);
          }
        } else {
          moveToNextCell(rowId, currentField);
        }
      } else if (event.key === 'Enter') {
        const currentField = params.field;
        const rowId = params.id;
        const isEditing = params.cellMode === 'edit';
        const currentColumn = processedColumns.find((col) => col.field === currentField);
        const isDynamicSelectField = dynamicSelectFields.includes(currentField);
        const isSelectField =
          currentColumn?.type === 'singleSelect' ||
          (selectFields && selectFields[currentField]) ||
          isDynamicSelectField;
        const isDateField = dateFields && dateFields.includes(currentField);

        // 날짜 필드에서 Enter 키를 누른 경우
        if (isDateField) {
          // 편집 모드가 아닌 경우: 편집 모드로 진입 (달력 자동 열림)
          if (!isEditing) {
            event.preventDefault();
            event.stopPropagation();
            // 명시적으로 편집 모드 시작
            if (dataGridRef.current) {
              dataGridRef.current.startCellEditMode({
                id: rowId,
                field: currentField,
              });
            }
            return;
          }
          // 편집 모드인 경우: Enter 키가 DateTimePicker 내부로 전파되어 달력이 열림
          // preventDefault 하지 않음
          return;
        }

        // 일반 인풋 필드에서 Enter 키를 누른 경우 편집 종료 후 현재 셀에 포커스 유지
        if (!isSelectField && !isDateField && isEditing) {
          event.preventDefault();
          event.stopPropagation();
          if (dataGridRef.current) {
            try {
              dataGridRef.current.stopCellEditMode({
                id: rowId,
                field: currentField,
                ignoreModifications: false,
              });
            } catch (error) {
              // 셀이 이미 편집 모드가 아닌 경우 무시
              console.debug('Cell not in edit mode:', error);
            }
          }
          // 편집 종료 후 현재 셀에 포커스 유지
          setTimeout(() => {
            if (dataGridRef.current) {
              dataGridRef.current.setCellFocus(rowId, currentField);
            }
          }, 50);
          return;
        }

        if (isSelectField) {
          shouldMoveToNextCellRef.current = false;
          if (
            tabKeyPressedRef.current &&
            tabKeyPressedRef.current.field === currentField &&
            tabKeyPressedRef.current.rowId === rowId
          ) {
            tabKeyPressedRef.current = null;
          }
        }
      }
    },
    [isEditMode, processedColumns, selectFields, dynamicSelectFields, moveToNextCell],
  );

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
      {!isEditMode && !approveSelectionMode && (
        <DetailNavigationActions onBack={onBack} onEdit={onEdit} />
      )}
      {/* 결재 선택 모드일 때 상단 버튼들 - onApproveSelect가 없으면 목록으로 버튼만 표시 */}
      {!isEditMode &&
        approveSelectionMode &&
        (onApproveSelect ? (
          <ApprovalListActions
            onBack={onBack}
            onApproveSelect={() => onApproveSelect(false)}
            approveSelectLabel="선택 취소"
            approveSelectActive={approveSelectionMode}
          />
        ) : (
          <DetailNavigationActions onBack={onBack} />
        ))}
      {/* 결재 선택 모드가 아닐 때 결재 선택 버튼 표시 */}
      {!isEditMode && !approveSelectionMode && onApproveSelect && (
        <ApprovalListActions
          onBack={onBack}
          onEdit={onEdit}
          onApproveSelect={() => onApproveSelect(true)}
          approveSelectLabel="결재 선택"
          approveSelectActive={false}
        />
      )}

      <Box sx={EDITABLE_LIST_GRID_WRAPPER_SX}>
        <DataGrid
          key={JSON.stringify(data)}
          rows={data}
          columns={processedColumns}
          getRowId={getRowId}
          checkboxSelection={isEditMode || approveSelectionMode}
          rowSelectionModel={isEditMode || approveSelectionMode ? selectionModel : []}
          onRowSelectionModelChange={
            isEditMode || approveSelectionMode ? setSelectionModel : undefined
          }
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={pageSizeOptions}
          hideFooterPagination={!showPagination}
          disableRowSelectionOnClick
          density="standard"
          rowHeight={46}
          columnHeaderHeight={46}
          autoHeight={false}
          processRowUpdate={handleProcessRowUpdate}
          onRowClick={onRowClick ? handleRowClick : undefined}
          onCellKeyDown={isEditMode ? handleCellKeyDown : undefined}
          onCellEditStop={isEditMode ? handleCellEditStop : undefined}
          apiRef={dataGridRef}
          loading={isLoading}
          sx={EDITABLE_LIST_GRID_SX}
        />
      </Box>

      {/* 편집 모드일 때 하단 액션 버튼들 (일반 모드) */}
      {isEditMode && onSave && onCancel && !showExcelActions && (
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

      {/* 엑셀 업로드 모드일 때 하단 액션 버튼들 */}
      {isEditMode && showExcelActions && (
        <ExcelEditActions
          open={isEditMode}
          selectedCount={selectionModel.length}
          selectedRowNumbers={selectedRowNumbers}
          onDelete={handleExcelDeleteClick}
          onAddRow={handleAddRowClick}
          size={size}
        />
      )}

      {/* 결재 선택 모드일 때 하단 결재 확인 버튼들 */}
      {!isEditMode && approveSelectionMode && onApproveConfirm && (
        <ApprovalConfirmActions
          open={approveSelectionMode}
          selectedIds={selectionModel}
          onConfirm={onApproveConfirm}
          onCancel={
            onApproveCancel ||
            (() => {
              setSelectionModel([]);
              if (onApproveSelect) onApproveSelect(false);
            })
          }
          size={size}
        />
      )}
    </Box>
  );
};

export default EditableList;

const EDITABLE_LIST_GRID_WRAPPER_SX = {
  height: 545,
  width: '100%',
  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#1976d2 !important',
  },
  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
    outline: '2px solid #1976d2',
    outlineOffset: '-2px',
  },
} as const;

const EDITABLE_LIST_GRID_SX = {
  '& .MuiDataGrid-footerContainer': {
    minHeight: '42px',
    maxHeight: '42px',
  },
} as const;
