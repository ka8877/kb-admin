import React, { useEffect, useMemo, useState } from 'react';
import type {
  GridColDef,
  GridPaginationModel,
  GridRowSelectionModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import ListSearch from '../search/ListSearch';
import ListActions, { DeleteConfirmBar } from '../actions/ListActions';
import { useListState } from '../../../hooks/useListState';
import ExcelJS from 'exceljs';
import { formatDateForDisplay } from '../../../utils/dateUtils';

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
};

const defaultGetRowId =
  <T extends GridValidRowModel>(getter: ManagementListProps<T>['rowIdGetter']) =>
  (row: T) => {
    if (!getter) return (row as any).id ?? (row as any).id_str ?? '';
    if (typeof getter === 'function') return getter(row);
    return (row as any)[getter as string];
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
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => {
      if (!searchField) {
        return Object.values(row).some((v) =>
          v == null ? false : String(v).toLowerCase().includes(q),
        );
      }
      const value = (row as any)[searchField];
      return value == null ? false : String(value).toLowerCase().includes(q);
    });
  }, [data, searchField, searchQuery, enableClientSearch]);

  const handleExportAll = async () => {
    if (onExportAll) return onExportAll(filteredRows);
    if (!filteredRows.length) return;

    // columns의 field와 headerName 매핑 생성
    const columnMap = new Map<string, string>();
    columns.forEach((col) => {
      columnMap.set(col.field, col.headerName || col.field);
    });

    // 헤더 생성 (columns 순서대로, headerName 사용)
    const orderedFields = columns.map((col) => col.field);
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

    // 데이터 행 추가
    filteredRows.forEach((row) => {
      const rowData = orderedFields.map((field) => {
        const value = (row as any)[field];
        return value ?? '';
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
          const value = (row as any)[field];
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
  };

  const handleDeleteConfirm = (ids: (string | number)[]) => {
    if (onDeleteConfirm) onDeleteConfirm(ids);
    setSelectionModel([]);
    setSelectionMode(false);
  };

  const handleSearch = (p: { field?: string; query: string }) => {
    // 검색 시 삭제 모드 해제
    if (selectionMode) {
      setSelectionMode(false);
      setSelectionModel([]);
    }

    if (enableStatePreservation) {
      updateListState({
        searchField: p.field,
        searchQuery: p.query,
        page: 0, // 검색 시 첫 페이지로
      });
    } else {
      setLocalSearchField(p.field);
      setLocalSearchQuery(p.query);
      setLocalPaginationModel((prev) => ({ ...prev, page: 0 }));
    }
  };

  const handlePaginationChange = (model: GridPaginationModel) => {
    if (enableStatePreservation) {
      updateListState({
        page: model.page,
        pageSize: model.pageSize,
      });
    } else {
      setLocalPaginationModel(model);
    }
  };

  // 컬럼에 셀렉트 필드와 날짜 필드 적용
  const processedColumns = useMemo(() => {
    if (!selectFields && !dateFields) return columns;

    return columns.map((col) => {
      const isSelectField = selectFields && selectFields[col.field];
      const isDateField = dateFields && dateFields.includes(col.field);

      // 날짜 필드인 경우
      if (isDateField) {
        return {
          ...col,
          valueFormatter: (params: any) => {
            return formatDateForDisplay(params.value, dateFormat);
          },
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
        };
      }

      return col;
    });
  }, [columns, selectFields, dateFields, dateFormat]);

  return (
    <Box>
      <ListSearch
        columns={columns}
        onSearch={handleSearch}
        placeholder={searchPlaceholder}
        defaultField={searchField || 'all'}
        defaultQuery={searchQuery}
        size={size}
      />

      <ListActions
        selectionMode={selectionMode}
        onToggleSelectionMode={(next) => {
          setSelectionMode(next);
          if (!next) setSelectionModel([]);
        }}
        selectedIds={
          Array.isArray(selectionModel) ? selectionModel : selectionModel ? [selectionModel] : []
        }
        onCreate={onCreate}
        onRequestApproval={onRequestApproval}
        onDeleteConfirm={(ids) => handleDeleteConfirm(ids)}
        onDownloadAll={() => handleExportAll()}
        size={size}
      />

      <Box sx={{ height: 420, width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={processedColumns as any}
          getRowId={(r) => getRowId(r) as any}
          checkboxSelection={selectionMode}
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={(newModel) => setSelectionModel(newModel)}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[5, 10, 20, 50]}
          disableRowSelectionOnClick
          density="standard"
          autoHeight={false}
          onRowClick={
            onRowClick ? (params) => onRowClick({ id: params.id, row: params.row }) : undefined
          }
        />
      </Box>

      <DeleteConfirmBar
        open={selectionMode}
        selectedIds={
          Array.isArray(selectionModel) ? selectionModel : selectionModel ? selectionModel : []
        }
        onConfirm={(ids) => handleDeleteConfirm(ids)}
        onCancel={() => {
          setSelectionMode(false);
          setSelectionModel([]);
        }}
        size={size}
      />
    </Box>
  );
};

export default ManagementList;
