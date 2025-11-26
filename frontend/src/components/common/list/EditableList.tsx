import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  GridColDef,
  GridPaginationModel,
  GridValidRowModel,
  GridRenderEditCellParams,
} from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import type { SelectChangeEvent } from '@mui/material/Select';
import DetailEditActions from '../actions/DetailEditActions';
import DetailNavigationActions from '../actions/DetailNavigationActions';
import ApprovalListActions from '../actions/ApprovalListActions';
import { ApprovalConfirmActions } from '../actions/ApprovalConfirmActions';
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
  isLoading?: boolean; // 로딩 상태
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
      params.api.stopCellEditMode({
        id: params.id,
        field: params.field,
      });
    },
    [params],
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    params.api.stopCellEditMode({
      id: params.id,
      field: params.field,
      ignoreModifications: !committedRef.current,
    });
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
  onProcessRowUpdate,
  externalRows,
  getRequiredFields,
  onApproveSelect,
  approveSelectionMode = false,
  onApproveConfirm,
  isLoading = false,
}: EditableListProps<T>): JSX.Element => {
  const [data, setData] = useState<T[]>(rows ?? []);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: defaultPageSize,
  });
  const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);
  const { showAlert } = useAlertDialog();

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
      {/* 결재 선택 모드일 때 상단 버튼들 */}
      {!isEditMode && approveSelectionMode && onApproveSelect && (
        <ApprovalListActions
          onBack={onBack}
          onApproveSelect={() => onApproveSelect(false)}
          approveSelectLabel="선택 취소"
          approveSelectActive={approveSelectionMode}
        />
      )}
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
          onRowSelectionModelChange={isEditMode || approveSelectionMode ? setSelectionModel : undefined}
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
          sx={EDITABLE_LIST_GRID_SX}
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

      {/* 결재 선택 모드일 때 하단 결재 확인 버튼들 */}
      {!isEditMode && approveSelectionMode && onApproveConfirm && (
        <ApprovalConfirmActions
          open={approveSelectionMode}
          selectedIds={selectionModel}
          onConfirm={onApproveConfirm}
          onCancel={() => {
            setSelectionModel([]);
            if (onApproveSelect) onApproveSelect(false);
          }}
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
