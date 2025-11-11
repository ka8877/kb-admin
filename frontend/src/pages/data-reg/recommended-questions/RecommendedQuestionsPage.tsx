import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import type { RecommendedQuestionItem } from './types';
import { recommendedQuestionColumns } from './components/columns/columns';
import ManagementList from '../../../components/common/list/ManagementList';
import PageHeader from '../../../components/common/PageHeader';
import { ROUTES } from '../../../routes/menu';
import {
  mockRecommendedQuestions,
  serviceOptions,
  ageGroupOptions,
  under17Options,
  statusOptions,
  questionCategoryOptions,
} from './data';

const listApi = {
  list: async (): Promise<RecommendedQuestionItem[]> => {
    return Promise.resolve(mockRecommendedQuestions);
  },
};

const RecommendedQuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCreate = useCallback(() => {
    navigate(ROUTES.RECOMMENDED_QUESTIONS_CREATE);
  }, [navigate]);

  const handleRequestApproval = useCallback(() => {
    const currentUrl = location.pathname + location.search;
    console.log('🔍 RecommendedQuestionsPage - saving currentUrl to sessionStorage:', currentUrl);
    sessionStorage.setItem('approval_return_url', currentUrl);
    navigate(ROUTES.RECOMMENDED_QUESTIONS_APPROVAL);
  }, [location.pathname, location.search, navigate]);

  const handleDeleteConfirm = useCallback((ids: (string | number)[]) => {
    console.log('삭제 요청 ids:', ids);
    // 실제 삭제 처리 후 필요 시 재요청
  }, []);

  const handleRowClick = useCallback(
    (params: { id: string | number; row: RecommendedQuestionItem }) => {
      navigate(ROUTES.RECOMMENDED_QUESTIONS_DETAIL(params.id));
    },
    [navigate],
  );

  const selectFieldsConfig = {
    service_nm: serviceOptions,
    age_grp: ageGroupOptions,
    under_17_yn: under17Options,
    status: statusOptions,
    qst_ctgr: questionCategoryOptions,
  };

  const dateFieldsConfig = ['imp_start_date', 'imp_end_date', 'updatedAt', 'registeredAt'];

  return (
    <Box>
      <PageHeader title="추천질문 관리" />
      <ManagementList<RecommendedQuestionItem>
        onRowClick={handleRowClick}
        columns={recommendedQuestionColumns}
        fetcher={listApi.list}
        rowIdGetter={'qst_id'}
        onCreate={handleCreate}
        onRequestApproval={handleRequestApproval}
        onDeleteConfirm={handleDeleteConfirm}
        enableStatePreservation={true}
        exportFileName="추천질문목록"
        selectFields={selectFieldsConfig}
        dateFields={dateFieldsConfig}
        dateFormat="YYYYMMDDHHmmss"
      />
    </Box>
  );
};

export default RecommendedQuestionsPage;
