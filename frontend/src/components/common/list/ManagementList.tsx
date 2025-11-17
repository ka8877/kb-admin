import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
  GridValidRowModel,
  GridRowId,
} from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import ListSearch, { type SearchField } from '../search/ListSearch';
import ListActions, { DeleteConfirmBar } from '../actions/ListActions';
import { useListState } from '@/hooks/useListState';
import ExcelJS from 'exceljs';
import { formatDateForDisplay } from '@/utils/dateUtils';

export type SelectFieldOption = {
  label: string;
  value: string;
};

export type ManagementListProps<T extends GridValidRowModel = GridValidRowModel> = {
  columns: GridColDef<T>[];
  fetcher?: () => Promise<T[]>;
  rows?: T[];
  rowIdGetter?: keyof T | ((row: T) => string | number);
  defaultPageSize?: number;
  onCreate?: () => void;
  onRequestApproval?: () => void;
  onDeleteConfirm?: (ids: (string | number)[]) => void;
  onExportAll?: (rows: T[]) => void;
  searchPlaceholder?: string;
  size?: 'small' | 'medium' | 'large';
  enableClientSearch?: boolean;
  onRowClick?: (params: { id: string | number; row: T }) => void;
  enableStatePreservation?: boolean; // URL 상태 저장 활성화 (기본: true)
  exportFileName?: string; // 다운로드 파일명 (확장자 제외)
  selectFields?: Record<string, SelectFieldOption[]>; // 셀렉트 박스로 표시할 필드와 옵션들
  dateFields?: string[]; // 날짜 필드 목록
  dateFormat?: string; // 날짜 저장 형식 (기본: YYYYMMDDHHmmss)
  searchFields?: SearchField[]; // 검색 필드 설정 (textGroup 지원)
};

const defaultGetRowId =
  <T extends GridValidRowModel>(getter: ManagementListProps<T>['rowIdGetter']) =>
  (row: T) => {
    if (!getter) {
      const rowObj = row as Record<string, unknown>;
      return (rowObj.id ?? rowObj.id_str ?? '') as string | number;
    }
    if (typeof getter === 'function') return getter(row);
    return row[getter as keyof T] as string | number;
  };

const ManagementList = <T extends GridValidRowModel = GridValidRowModel>({
  columns,
  fetcher,
  rows,
  rowIdGetter,
  defaultPageSize = 20,
  onCreate,
  onRequestApproval,
  onDeleteConfirm,
  onExportAll,
  searchPlaceholder = '검색어를 입력하세요',
  size = 'medium',
  enableClientSearch = true,
  onRowClick,
  enableStatePreservation = true,
  exportFileName = '목록',
  selectFields,
  dateFields,
  dateFormat = 'YYYYMMDDHHmmss',
  searchFields,
}: ManagementListProps<T>): JSX.Element => {
  const { listState, updateListState } = useListState(defaultPageSize);
  const [data, setData] = useState<T[]>(rows ?? []);

  // URL 상태를 사용하거나 로컬 상태 사용
  const [localPaginationModel, setLocalPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: defaultPageSize,
  });
  const [localSearchField, setLocalSearchField] = useState<string | undefined>(undefined);
  const [localSearchQuery, setLocalSearchQuery] = useState<string>('');

  const paginationModel = enableStatePreservation
    ? { page: listState.page, pageSize: listState.pageSize }
    : localPaginationModel;
  const searchField = enableStatePreservation ? listState.searchField : localSearchField;
  const searchQuery = enableStatePreservation ? listState.searchQuery || '' : localSearchQuery;

  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);

  const getRowId = useMemo(() => defaultGetRowId<T>(rowIdGetter), [rowIdGetter]);

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

  const filteredRows = useMemo(() => {
    if (!enableClientSearch) return data;
    
    // searchFields가 있고 여러 필드 검색인 경우
    // ManagementList는 단일 필드 검색만 지원하므로, 
    // ListSearch에서 여러 필드 값을 하나의 쿼리로 변환하여 전달하거나
    // 별도의 검색 상태 관리가 필요할 수 있음
    // 현재는 기존 로직 유지
    
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => {
      if (!searchField) {
        return Object.values(row).some((v) =>
          v == null ? false : String(v).toLowerCase().includes(q),
        );
      }
      const rowObj = row as Record<string, unknown>;
      const value = rowObj[searchField];
      return value == null ? false : String(value).toLowerCase().includes(q);
    });
  }, [data, searchField, searchQuery, enableClientSearch]);

  // 컬럼 처리 로직 공통화 (DRY 원칙)
  const applyColumnFormatters = useCallback(
    (col: GridColDef<T>) => {
      const isSelectField = selectFields && selectFields[col.field];
      const isDateField = dateFields && dateFields.includes(col.field);

      // 날짜 필드인 경우
      if (isDateField) {
        return {
          ...col,
          valueFormatter: (params: { value: string }) =>
            formatDateForDisplay(params.value, dateFormat),
        };
      }

      // 셀렉트 필드인 경우
      if (isSelectField) {
        return {
          ...col,
          valueFormatter: (params: { value: string }) => {
            const option = isSelectField.find((opt) => opt.value === params.value);
            return option ? option.label : (params.value ?? '');
          },
        };
      }

      return col;
    },
    [selectFields, dateFields, dateFormat],
  );

  const handleExportAll = useCallback(async () => {
    if (onExportAll) return onExportAll(filteredRows);
    if (!filteredRows.length) return;

    // 포맷터 적용된 컬럼 생성
    const processedColumnsForExport = columns.map(applyColumnFormatters);

    // columns의 field와 headerName 매핑 생성
    const columnMap = new Map<string, string>();
    processedColumnsForExport.forEach((col) => {
      columnMap.set(col.field, col.headerName || col.field);
    });

    // 헤더 생성 (columns 순서대로, headerName 사용)
    const orderedFields = processedColumnsForExport.map((col) => col.field);
    const headers = orderedFields.map((field) => columnMap.get(field) || field);

    // ExcelJS 워크북 생성
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');

    // 헤더 행 추가
    const headerRow = worksheet.addRow(headers);

    // 헤더 스타일 적용
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }, // 파란색
      };
      cell.font = {
        bold: true,
        color: { argb: 'FFFFFFFF' }, // 흰색
      };
      cell.alignment = {
        horizontal: 'center',
        vertical: 'middle',
      };
    });

    // 데이터 행 추가 (화면에 표시되는 포맷팅된 값 사용)
    filteredRows.forEach((row) => {
      const rowData = orderedFields.map((field) => {
        const column = processedColumnsForExport.find((col) => col.field === field);
        if (!column) return '';

        const rowObj = row as Record<string, unknown>;
        const rawValue = rowObj[field];

        // valueFormatter가 있으면 사용 (날짜, 셀렉트 필드 포맷팅)
        if (column.valueFormatter && typeof column.valueFormatter === 'function') {
          try {
            return column.valueFormatter({ value: rawValue } as never) ?? '';
          } catch {
            return rawValue ?? '';
          }
        }

        // valueGetter가 있으면 사용
        if (column.valueGetter && typeof column.valueGetter === 'function') {
          try {
            return column.valueGetter({ row, field } as never) ?? '';
          } catch {
            return rawValue ?? '';
          }
        }

        // 기본값
        return rawValue ?? '';
      });
      worksheet.addRow(rowData);
    });

    // 열 너비 자동 조정
    worksheet.columns = orderedFields.map((field, idx) => {
      // 헤더 길이
      const headerLength = (headers[idx] || '').length;
      // 데이터 최대 길이
      const maxDataLength = Math.max(
        ...filteredRows.map((row) => {
          const rowObj = row as Record<string, unknown>;
          const value = rowObj[field];
          return String(value ?? '').length;
        }),
        0,
      );
      // 헤더와 데이터 중 더 긴 것 기준으로 너비 설정 (최소 10, 최대 50)
      const width = Math.min(Math.max(headerLength, maxDataLength, 10), 50);
      return { width };
    });

    // 파일명: {메뉴명}_{YYYYMMDD_HHmmss}.xlsx
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHmmss
    const fileName = `${exportFileName}_${dateStr}_${timeStr}.xlsx`;

    // 파일 다운로드
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }, [onExportAll, filteredRows, columns, applyColumnFormatters, exportFileName]);

  const handleDeleteConfirm = useCallback(
    (ids: (string | number)[]) => {
      if (onDeleteConfirm) onDeleteConfirm(ids);
      setSelectionModel([]);
      setSelectionMode(false);
    },
    [onDeleteConfirm],
  );

  const handleSearch = useCallback(
    (payload: Record<string, string | number>) => {
      // 검색 시 삭제 모드 해제
      if (selectionMode) {
        setSelectionMode(false);
        setSelectionModel([]);
      }

      // 여러 필드 검색을 지원하기 위해 payload를 처리
      // 현재 ManagementList는 단일 필드 검색만 지원하므로
      // 첫 번째 필드만 사용하거나, 모든 필드를 조합하여 검색
      const fields = Object.keys(payload);
      if (fields.length === 0) {
        // 검색 조건이 없으면 전체 표시
        if (enableStatePreservation) {
          updateListState({
            searchField: undefined,
            searchQuery: '',
            page: 0,
          });
        } else {
          setLocalSearchField(undefined);
          setLocalSearchQuery('');
          setLocalPaginationModel((prev) => ({ ...prev, page: 0 }));
        }
        return;
      }

      // 첫 번째 필드와 값을 사용 (향후 여러 필드 검색 지원 시 확장 가능)
      const firstField = fields[0];
      const searchQuery = String(payload[firstField]);

      if (enableStatePreservation) {
        updateListState({
          searchField: firstField,
          searchQuery,
          page: 0, // 검색 시 첫 페이지로
        });
      } else {
        setLocalSearchField(firstField);
        setLocalSearchQuery(searchQuery);
        setLocalPaginationModel((prev) => ({ ...prev, page: 0 }));
      }
    },
    [selectionMode, enableStatePreservation, updateListState],
  );

  const handlePaginationChange = useCallback(
    (model: GridPaginationModel) => {
      if (enableStatePreservation) {
        updateListState({
          page: model.page,
          pageSize: model.pageSize,
        });
      } else {
        setLocalPaginationModel(model);
      }
    },
    [enableStatePreservation, updateListState],
  );

  const handleToggleSelectionMode = useCallback((next: boolean) => {
    setSelectionMode(next);
    if (!next) setSelectionModel([]);
  }, []);

  const handleRowClick = useCallback(
    (params: { id: GridRowId; row: T }) => {
      if (onRowClick) {
        onRowClick({ id: params.id, row: params.row });
      }
    },
    [onRowClick],
  );

  const handleCancelSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectionModel([]);
  }, []);

  // 컬럼에 셀렉트 필드와 날짜 필드 적용 (DataGrid 표시용)
  const processedColumns = useMemo(() => {
    if (!selectFields && !dateFields) return columns;

    return columns.map((col) => {
      const isSelectField = selectFields && selectFields[col.field];
      const formattedCol = applyColumnFormatters(col);

      // 셀렉트 필드인 경우 type과 valueOptions 추가 (DataGrid 편집용)
      if (isSelectField) {
        return {
          ...formattedCol,
          type: 'singleSelect',
          valueOptions: isSelectField.map((opt) => ({
            value: opt.value,
            label: opt.label,
          })),
        };
      }

      return formattedCol;
    });
  }, [columns, selectFields, dateFields, applyColumnFormatters]);

  return (
    <Box>
      <ListSearch
        columns={columns}
        searchFields={searchFields}
        onSearch={handleSearch}
        placeholder={searchPlaceholder}
        size={size}
      />

      <ListActions
        selectionMode={selectionMode}
        onToggleSelectionMode={handleToggleSelectionMode}
        selectedIds={
          Array.isArray(selectionModel) ? selectionModel : selectionModel ? [selectionModel] : []
        }
        onCreate={onCreate}
        onRequestApproval={onRequestApproval}
        onDeleteConfirm={handleDeleteConfirm}
        onDownloadAll={handleExportAll}
        size={size}
      />

      <Box sx={{ height: 420, width: '100%' }}>
        <DataGrid<T>
          rows={filteredRows}
          columns={processedColumns}
          getRowId={(r) => getRowId(r) as GridRowId}
          checkboxSelection={selectionMode}
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={setSelectionModel}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[5, 10, 20, 50]}
          disableRowSelectionOnClick
          density="standard"
          autoHeight={false}
          onRowClick={onRowClick ? handleRowClick : undefined}
        />
      </Box>

      <DeleteConfirmBar
        open={selectionMode}
        selectedIds={
          Array.isArray(selectionModel) ? selectionModel : selectionModel ? selectionModel : []
        }
        onConfirm={handleDeleteConfirm}
        onCancel={handleCancelSelection}
        size={size}
      />
    </Box>
  );
};

export default ManagementList;
