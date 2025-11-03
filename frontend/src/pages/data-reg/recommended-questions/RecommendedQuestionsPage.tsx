import React, { useMemo, useState } from 'react';


import type { RowItem } from './types';
import { listColumns } from './components/columns/columns';
import DataList from '../../../components/common/list/DataList';


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

const RecommendedQuestionsPage: React.FC = () => {
  const handleCreate = () => { /* navigate to create */ };
  const handleRequestApproval = () => { /* navigate to requests */ };
  const handleDeleteConfirm = (ids: (string | number)[]) => {
    console.log('삭제 요청 ids:', ids);
    // 실제 삭제 처리 후 필요 시 재요청
  };

  return (
    <DataList<RowItem>
      columns={listColumns}
      fetcher={listApi.list}
      rowIdGetter={'qst_id'}
      onCreate={handleCreate}
      onRequestApproval={handleRequestApproval}
      onDeleteConfirm={handleDeleteConfirm}
      // onExportAll can be provided to override default CSV behavior
    />
  );
};

export default RecommendedQuestionsPage;