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

export type DataListProps<T extends GridValidRowModel = GridValidRowModel> = {
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
  size?: 'small' | 'medium';
  enableClientSearch?: boolean;
  onRowClick?: (params: { id: string | number; row: T }) => void;
  enableStatePreservation?: boolean; // URL 상태 저장 활성화 (기본: true)
};

const defaultGetRowId =
  <T extends GridValidRowModel>(getter: DataListProps<T>['rowIdGetter']) =>
  (row: T) => {
    if (!getter) return (row as any).id ?? (row as any).id_str ?? '';
    if (typeof getter === 'function') return getter(row);
    return (row as any)[getter as string];
  };

const DataList = <T extends GridValidRowModel = GridValidRowModel>({
  columns,
  fetcher,
  rows,
  rowIdGetter,
  defaultPageSize = 10,
  onCreate,
  onRequestApproval,
  onDeleteConfirm,
  onExportAll,
  searchPlaceholder = '검색어를 입력하세요',
  size = 'small',
  enableClientSearch = true,
  onRowClick,
  enableStatePreservation = true,
}: DataListProps<T>): JSX.Element => {
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

  const handleExportAll = () => {
    if (onExportAll) return onExportAll(filteredRows);
    // 기본 CSV export (UTF-8 BOM, 숫자처럼 보이는 필드는 ="..."로 강제)
    if (!filteredRows.length) return;
    const headers = Object.keys(filteredRows[0] as any);
    const escapeCell = (v: unknown) => {
      if (v == null) return '';
      const s = String(v);
      if (/^\d{6,}$/.test(s)) {
        const esc = s.replace(/"/g, '""');
        return `="${esc}"`;
      }
      const esc = s.replace(/"/g, '""');
      return esc.includes(',') || esc.includes('\n') ? `"${esc}"` : esc;
    };
    const csv = [
      headers.join(','),
      ...filteredRows.map((r) => headers.map((h) => escapeCell((r as any)[h])).join(',')),
    ].join('\r\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteConfirm = (ids: (string | number)[]) => {
    if (onDeleteConfirm) onDeleteConfirm(ids);
    setSelectionModel([]);
    setSelectionMode(false);
  };

  const handleSearch = (p: { field?: string; query: string }) => {
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
          columns={columns as any}
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

export default DataList;
