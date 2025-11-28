import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Box } from '@mui/material';
import type {
  GridColDef,
  GridValidRowModel,
  GridPaginationModel,
  GridRenderEditCellParams,
} from '@mui/x-data-grid';
import { DataGrid, useGridApiRef } from '@mui/x-data-grid';
import type { ValidationResult } from '@/types/types';
import type { SelectFieldOption } from '@/types/types';
import { createProcessedColumns } from '@/components/common/upload/utils/listUtils';
import ExcelEditActions from '@/components/common/actions/ExcelEditActions';
import { useGridCellNavigation } from '@/hooks/useGridCellNavigation';
import ListSelect from '../select/ListSelect';

export type ExcelPreviewListProps<T extends GridValidRowModel = GridValidRowModel> = {
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

const defaultGetRowId =
  <T extends GridValidRowModel>(getter: ExcelPreviewListProps<T>['rowIdGetter']) =>
  (row: T) => {
    if (!getter) {
      const rowObj = row as Record<string, unknown>;
      return (rowObj.id ?? rowObj.id_str ?? rowObj.no ?? '') as string | number;
    }
    if (typeof getter === 'function') return getter(row);
    return row[getter as keyof T] as string | number;
  };

const ExcelPreviewList = <T extends GridValidRowModel = GridValidRowModel>({
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
}: ExcelPreviewListProps<T>): JSX.Element => {
  const [localData, setLocalData] = useState<T[]>(data);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 20,
  });
  const [selectionModel, setSelectionModel] = useState<(string | number)[]>([]);
  const dataGridRef = useGridApiRef();

  const getRowId = useMemo(() => defaultGetRowId<T>(rowIdGetter), [rowIdGetter]);

  const renderSelectEditCell = useCallback(
    (params: GridRenderEditCellParams, options: SelectFieldOption[]) => {
      return <ListSelect params={params} options={options} />;
    },
    [],
  );

  // externalRows 변경 시 로컬 데이터 업데이트
  useEffect(() => {
    setLocalData(data);
    setSelectionModel([]);
  }, [data]);

  // 필수 필드 목록 가져오기 (첫 번째 행 기준)
  const requiredFields = useMemo(() => {
    if (!getRequiredFields || localData.length === 0) return [];
    return getRequiredFields(localData[0]);
  }, [getRequiredFields, localData]);

  // 편집 모드에 따라 컬럼 처리 (selectFields, dateFields 포함)
  const processedColumns = useMemo(
    () =>
      createProcessedColumns<T>({
        columns,
        isEditMode: true,
        readOnlyFields,
        selectFields,
        dateFields,
        dateFormat,
        getDynamicSelectOptions,
        dynamicSelectFields,
        data: localData,
        getRowId,
        renderSelectEditCell,
        requiredFields,
        addRequiredMark: true,
      }),
    [
      columns,
      readOnlyFields,
      selectFields,
      dateFields,
      dateFormat,
      getDynamicSelectOptions,
      dynamicSelectFields,
      localData,
      getRowId,
      renderSelectEditCell,
      requiredFields,
    ],
  );

  // 셀 네비게이션 hook 사용
  const { handleCellKeyDown, handleCellEditStop } = useGridCellNavigation<T>({
    isEditMode: true,
    data: localData,
    processedColumns,
    readOnlyFields,
    selectFields,
    dateFields,
    dynamicSelectFields,
    getRowId,
    dataGridRef,
  });

  // 행 업데이트 처리 (셀 편집 시)
  const handleProcessRowUpdate = useCallback(
    (newRow: T, oldRow: T) => {
      const processedRow = onProcessRowUpdate ? onProcessRowUpdate(newRow, oldRow) : newRow;
      const updatedData = localData.map((row) =>
        getRowId(row) === getRowId(processedRow) ? processedRow : row,
      );
      setLocalData(updatedData);

      // 부모 컴포넌트에 변경된 데이터 즉시 전달
      if (onDataChange) {
        onDataChange(updatedData);
      }

      return processedRow;
    },
    [localData, getRowId, onProcessRowUpdate, onDataChange],
  );

  // 엑셀 모드에서 행 삭제 (로컬에서만 삭제)
  const handleExcelDeleteClick = useCallback(() => {
    if (selectionModel.length > 0) {
      const updatedData = localData.filter((row) => !selectionModel.includes(getRowId(row)));
      setLocalData(updatedData);
      setSelectionModel([]);

      // 부모 컴포넌트에 변경된 데이터 즉시 전달
      if (onDataChange) {
        onDataChange(updatedData);
      }
    }
  }, [selectionModel, localData, getRowId, onDataChange]);

  // 행 추가
  const handleAddRowClick = useCallback(() => {
    if (onAddRow) {
      onAddRow();
    }
  }, [onAddRow]);

  // selectedRowNumbers 계산
  const selectedRowNumbers = useMemo(
    () =>
      selectionModel
        .map((id) => {
          const row = localData.find((r) => getRowId(r) === id);
          if (!row) return null;
          const rowObj = row as Record<string, unknown>;
          return typeof rowObj.no === 'number' ? rowObj.no : null;
        })
        .filter((num): num is number => num !== null),
    [selectionModel, localData, getRowId],
  );

  if (localData.length === 0) {
    return <></>;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={EXCEL_LIST_GRID_WRAPPER_SX}>
        <DataGrid
          rows={localData}
          columns={processedColumns}
          getRowId={getRowId}
          checkboxSelection={true}
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={setSelectionModel}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 20, 50, 100]}
          hideFooterPagination={false}
          disableRowSelectionOnClick
          density="standard"
          rowHeight={46}
          columnHeaderHeight={46}
          autoHeight={false}
          processRowUpdate={handleProcessRowUpdate}
          onCellKeyDown={handleCellKeyDown}
          onCellEditStop={handleCellEditStop}
          apiRef={dataGridRef}
          sx={EXCEL_LIST_GRID_SX}
        />
      </Box>

      {/* 엑셀 편집 액션 버튼들 */}
      <ExcelEditActions
        open={true}
        selectedCount={selectionModel.length}
        selectedRowNumbers={selectedRowNumbers}
        onDelete={handleExcelDeleteClick}
        onAddRow={handleAddRowClick}
        size="small"
      />
    </Box>
  );
};

export default ExcelPreviewList;

const EXCEL_LIST_GRID_WRAPPER_SX = {
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

const EXCEL_LIST_GRID_SX = {
  '& .MuiDataGrid-footerContainer': {
    minHeight: '42px',
    maxHeight: '42px',
  },
} as const;
