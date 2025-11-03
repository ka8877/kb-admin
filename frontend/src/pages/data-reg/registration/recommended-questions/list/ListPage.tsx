import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataGrid, type GridPaginationModel, type GridRowSelectionModel } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import type { RowItem } from './types';
import { listColumns } from './components/columns/columns';
import ListSearch from '../../../../../components/common/search/ListSearch';
import ListActions, { DeleteConfirmBar } from '../../../../../components/common/actions/ListActions';

const listApi = {
  list: async (): Promise<RowItem[]> => {
    return Promise.resolve([
      {
        no: 560,
        qst_id: '1',
        service_nm: 'AI 검색',
        qst_ctnt: '하루만 맡겨도 연 2% 받을 수 있어?',
        parent_id: 'M020011',
        parent_nm: '26주 적금',
        imp_start_date: '20250501235959',
        imp_end_date: '99991231235959',
        updatedAt: '202501235959',
        registeredAt: '202501235959',
        status: 'in_service',
      },
      {
        no: 561,
        qst_id: '2',
        service_nm: 'AI 추천',
        qst_ctnt: '지금 가입하면 혜택이 있나요?',
        parent_id: null,
        parent_nm: null,
        imp_start_date: '20250601235959',
        imp_end_date: '20251231235959',
        updatedAt: '20250601235959',
        registeredAt: '20250601235959',
        status: 'out_of_service',
      },
      {
        no: 562,
        qst_id: '3',
        service_nm: 'AI 검색',
        qst_ctnt: '모바일에서도 동일한 혜택을 받을 수 있나요?',
        parent_id: 'M020012',
        parent_nm: '12개월 적금',
        imp_start_date: '20250401235959',
        imp_end_date: '20250630235959',
        updatedAt: '20250415235959',
        registeredAt: '20250415235959',
        status: 'in_service',
      },
    ]);
  },
};

const ListPage: React.FC = () => {
  const navigate = useNavigate();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [searchField, setSearchField] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // selection mode state (controls whether DataGrid shows checkboxes)
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>([]);

  const { data, isLoading } = useQuery<RowItem[]>({
    queryKey: ['recommendedQuestions'],
    queryFn: listApi.list,
  });

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return data ?? [];
    return (data ?? []).filter((row) => {
      if (!searchField) {
        return Object.values(row).some((v) =>
          v == null ? false : String(v).toLowerCase().includes(q)
        );
      }
      const value = (row as any)[searchField];
      return value == null ? false : String(value).toLowerCase().includes(q);
    });
  }, [data, searchField, searchQuery]);

  const handleSearch = (payload: { field?: string; query: string }) => {
    setSearchField(payload.field);
    setSearchQuery(payload.query);
    setPaginationModel((p) => ({ ...p, page: 0 }));
  };

  const handleCreate = () => {
    navigate('./create'); // 예시 경로
  };

  const handleRequestApproval = () => {
    navigate('./requests'); // 예시 경로
  };

  const handleDownloadAll = () => {
    // 간단 CSV 다운로드(의도는 엑셀로 열 수 있는 파일 제공)
    const rows = filteredRows ?? [];
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => `"${String((r as any)[h] ?? '')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recommended-questions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteConfirm = (ids: (string | number)[]) => {
    // 부모 쪽에서 실제 삭제 처리 (예: API 호출). 여기서는 mock 처리.
    console.log('삭제 요청 ids:', ids);
    // 삭제 후 선택 초기화 및 selection mode 종료
    setSelectionModel([]);
    setSelectionMode(false);
  };

  return (
    <>
      <ListSearch columns={listColumns} onSearch={handleSearch} placeholder="검색어를 입력하세요" />
      <ListActions
        selectionMode={selectionMode}
        onToggleSelectionMode={(n) => {
          setSelectionMode(n);
          if (!n) setSelectionModel([]); // 취소 시 선택 초기화
        }}
        selectedIds={selectionModel}
        onCreate={handleCreate}
        onRequestApproval={handleRequestApproval}
        onDeleteConfirm={handleDeleteConfirm}
        onDownloadAll={handleDownloadAll}
      />


      <div style={{ height: 420, width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={listColumns}
          getRowId={(row) => row.qst_id}
          checkboxSelection={selectionMode}
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={(newModel: GridRowSelectionModel) => setSelectionModel(newModel)}
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 20, 50]}
          disableRowSelectionOnClick
          density="standard"
          loading={isLoading}
          autoHeight={false}
        />
      </div>

      <DeleteConfirmBar
        open={selectionMode}
        selectedIds={selectionModel}
        onConfirm={(ids) => handleDeleteConfirm(ids)}
        onCancel={() => {
          setSelectionMode(false);
          setSelectionModel([]);
        }}
      />
    </>
  );
};

export default ListPage;