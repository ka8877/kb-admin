import React, { useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import type { RecommendedQuestionItem } from './types';
import { recommendedQuestionColumns } from './components/columns/columns';
import ManagementList from '@/components/common/list/ManagementList';
import PageHeader from '@/components/common/PageHeader';
import { ROUTES } from '@/routes/menu';
import { searchFields, selectFieldsConfig, dateFieldsConfig } from './data';
import { toast } from 'react-toastify';
import { TOAST_MESSAGES } from '@/constants/message';
import { useRecommendedQuestions, useDeleteRecommendedQuestions } from './hooks';
import { useListState } from '@/hooks/useListState';
import { parseSearchParams } from '@/utils/apiUtils';

const RecommendedQuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { listState } = useListState(20);
  const deleteMutation = useDeleteRecommendedQuestions();

  // 검색 조건을 객체로 변환
  const searchParams = useMemo(
    () => parseSearchParams(listState.searchFieldsState),
    [listState.searchFieldsState],
  );

  const {
    data: rows = [],
    isLoading,
    isFetching,
    refetch,
  } = useRecommendedQuestions({
    page: listState.page,
    pageSize: listState.pageSize,
    searchParams,
  });

  // isLoading 또는 isFetching 중 하나라도 true면 로딩 상태로 처리
  const isDataLoading = isLoading || isFetching;

  // 페이지가 마운트되거나 경로가 변경될 때 데이터 리프레시 (뒤로가기 시 자동 리프레시)
  useEffect(() => {
    refetch();
  }, [location.pathname, refetch]);

  const handleCreate = useCallback(() => {
    navigate(ROUTES.RECOMMENDED_QUESTIONS_CREATE);
  }, [navigate]);

  const handleRequestApproval = useCallback(() => {
    const currentUrl = location.pathname + location.search;
    sessionStorage.setItem('approval_return_url', currentUrl);
    navigate(ROUTES.RECOMMENDED_QUESTIONS_APPROVAL);
  }, [location.pathname, location.search, navigate]);

  const handleDeleteConfirm = useCallback(
    async (ids: (string | number)[]) => {
      if (ids.length === 0) {
        return;
      }
      try {
        await deleteMutation.mutateAsync(ids);
        toast.success(TOAST_MESSAGES.SAVE_SUCCESS);
      } catch (error) {
        toast.error(TOAST_MESSAGES.DELETE_FAILED);
      }
    },
    [deleteMutation],
  );

  const handleRowClick = useCallback(
    (params: { id: string | number; row: RecommendedQuestionItem }) => {
      navigate(ROUTES.RECOMMENDED_QUESTIONS_DETAIL(params.id));
    },
    [navigate],
  );

  return (
    <Box>
      <PageHeader title="추천질문 관리" />
      <ManagementList<RecommendedQuestionItem>
        onRowClick={handleRowClick}
        columns={recommendedQuestionColumns}
        rows={rows}
        rowIdGetter={'qst_id'}
        onCreate={handleCreate}
        onRequestApproval={handleRequestApproval}
        onDeleteConfirm={handleDeleteConfirm}
        enableStatePreservation={true}
        enableClientSearch={false}
        exportFileName="추천질문목록"
        selectFields={selectFieldsConfig}
        dateFields={dateFieldsConfig}
        dateFormat="YYYYMMDDHHmmss"
        searchFields={searchFields}
        isLoading={isDataLoading}
      />
    </Box>
  );
};

export default RecommendedQuestionsPage;
