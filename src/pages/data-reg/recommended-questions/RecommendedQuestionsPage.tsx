import React, { useCallback, useMemo, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import type { RecommendedQuestionItem } from '@/pages/data-reg/recommended-questions/types';
import { recommendedQuestionColumns } from '@/pages/data-reg/recommended-questions/components/columns/columns';
import ManagementList from '@/components/common/list/ManagementList';
import PageHeader from '@/components/common/PageHeader';
import { ROUTES } from '@/routes/menu';
import { dateFieldsConfig } from '@/pages/data-reg/recommended-questions/data';
import { toast } from 'react-toastify';
import { TOAST_MESSAGES } from '@/constants/message';
import {
  useRecommendedQuestions,
  useDeleteRecommendedQuestions,
  useSelectFieldsData,
  useSearchFields,
} from '@/pages/data-reg/recommended-questions/hooks';
import { useListState } from '@/hooks/useListState';
import { parseSearchParams } from '@/utils/apiUtils';
import { APPROVAL_RETURN_URL } from '@/constants/options';
import { PAGE_TITLES } from '@/constants/pageTitle';
import { QST_ID, SERVICE_NM } from '@/pages/data-reg/recommended-questions/data';
``;

const RecommendedQuestionsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { listState } = useListState(20);
  const deleteMutation = useDeleteRecommendedQuestions();
  const selectFieldsData = useSelectFieldsData();

  // 검색 조건을 객체로 변환
  const searchParams = useMemo(
    () => parseSearchParams(listState.searchFieldsState),
    [listState.searchFieldsState],
  );

  // 현재 선택된 서비스명 관리 (URL 파라미터 또는 사용자 입력)
  const [watchedServiceNm, setWatchedServiceNm] = useState<string>('');

  // URL 파라미터가 변경되면 watchedServiceNm 업데이트 (초기 로드 시)
  useEffect(() => {
    const serviceNmFromUrl = searchParams[SERVICE_NM] as string;
    if (serviceNmFromUrl) {
      setWatchedServiceNm(serviceNmFromUrl);
    }
  }, [searchParams]);

  // 검색 필드 변경 핸들러
  const handleSearchFieldChange = useCallback((field: string, value: string | number) => {
    if (field === SERVICE_NM) {
      setWatchedServiceNm(value as string);
    }
  }, []);

  const searchFields = useSearchFields(watchedServiceNm);

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
      <PageHeader title={PAGE_TITLES.RECOMMENDED_QUESTIONS} />
      <ManagementList<RecommendedQuestionItem>
        onRowClick={handleRowClick}
        columns={recommendedQuestionColumns}
        rows={rows}
        rowIdGetter={QST_ID}
        onCreate={handleCreate}
        onRequestApproval={handleRequestApproval}
        onDeleteConfirm={handleDeleteConfirm}
        enableStatePreservation={true}
        enableClientSearch={false}
        exportFileName={`${PAGE_TITLES.RECOMMENDED_QUESTIONS} 목록`}
        selectFields={selectFieldsData}
        dateFields={dateFieldsConfig}
        dateFormat="YYYYMMDDHHmmss"
        searchFields={searchFields}
        isLoading={isDataLoading}
        onSearchFieldChange={handleSearchFieldChange}
      />
    </Box>
  );
};

export default RecommendedQuestionsPage;
