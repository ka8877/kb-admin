import React, { useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import type { RecommendedQuestionItem } from '@/pages/data-reg/recommended-questions/types';
import { recommendedQuestionColumns } from '@/pages/data-reg/recommended-questions/components/columns/columns';
import ManagementList from '@/components/common/list/ManagementList';
import PageHeader from '@/components/common/PageHeader';
import { ROUTES } from '@/routes/menu';
import {
  searchFields,
  selectFieldsConfig,
  dateFieldsConfig,
} from '@/pages/data-reg/recommended-questions/data';
import { toast } from 'react-toastify';
import { TOAST_MESSAGES } from '@/constants/message';
import {
  useRecommendedQuestions,
  useDeleteRecommendedQuestions,
} from '@/pages/data-reg/recommended-questions/hooks';
import { useListState } from '@/hooks/useListState';
import { parseSearchParams } from '@/utils/apiUtils';
import { APPROVAL_RETURN_URL } from '@/constants/options';

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

  const handleCreate = useCallback(() => {
    navigate(ROUTES.RECOMMENDED_QUESTIONS_CREATE);
  }, [navigate]);

  const handleRequestApproval = useCallback(() => {
    const currentUrl = location.pathname + location.search;
    sessionStorage.setItem(APPROVAL_RETURN_URL, currentUrl);
    navigate(ROUTES.RECOMMENDED_QUESTIONS_APPROVAL);
  }, [location.pathname, location.search, navigate]);

  const handleDeleteConfirm = useCallback(
    async (ids: (string | number)[]) => {
      if (ids.length === 0) {
        return;
      }
      try {
        await deleteMutation.mutateAsync(ids);
        //toast.success(TOAST_MESSAGES.SAVE_SUCCESS);
      } catch (error) {
        // TODO : 나중에 제거 예정
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
        rowIdGetter={'qstId'}
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
