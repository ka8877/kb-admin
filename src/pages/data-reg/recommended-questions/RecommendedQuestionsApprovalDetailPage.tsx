import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Box } from '@mui/material';
import type { RecommendedQuestionItem } from '@/pages/data-reg/recommended-questions/types';
import { recommendedQuestionColumns } from '@/pages/data-reg/recommended-questions/components/columns/columns';
import PageHeader from '@/components/common/PageHeader';
import ApprovalDetailList from '@/components/common/list/ApprovalDetailList';
import { ROUTES } from '@/routes/menu';
import {
  loadServiceOptions,
  loadAgeGroupOptions,
  createSelectFieldsConfig,
  dateFieldsConfig,
} from '@/pages/data-reg/recommended-questions/data';

import { IN_REVIEW, DONE_REVIEW, APPROVAL_PAGE_STATE } from '@/constants/options';
import { createProcessedColumns } from '@/components/common/upload/utils/listUtils';
import { PAGE_TITLES } from '@/constants/pageTitle';

const RecommendedQuestionsApprovalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serviceOptions, setServiceOptions] = useState<{ label: string; value: string }[]>([]);
  const [ageGroupOptions, setAgeGroupOptions] = useState<{ label: string; value: string }[]>([]);

  // 옵션 데이터 로드
  useEffect(() => {
    const loadOptions = async () => {
      const [services, ageGroups] = await Promise.all([
        loadServiceOptions(),
        loadAgeGroupOptions(),
      ]);
      setServiceOptions(services);
      setAgeGroupOptions(ageGroups);
    };
    loadOptions();
  }, []);

  // React Query로 데이터 fetching
  const data: any[] = [];
  const isLoading = false;
  const isError = false;

  // 승인 요청 정보 조회
  const approvalRequest: any = undefined;

  // sessionStorage 접근 최적화
  const savedApprovalState = useMemo(() => sessionStorage.getItem(APPROVAL_PAGE_STATE), []);

  const handleBack = useCallback(() => {
    if (savedApprovalState) {
      sessionStorage.removeItem(APPROVAL_PAGE_STATE);
      navigate(savedApprovalState);
    } else {
      navigate(ROUTES.RECOMMENDED_QUESTIONS_APPROVAL);
    }
  }, [savedApprovalState, navigate]);

  const selectFieldsConfig = useMemo(
    () => createSelectFieldsConfig({ serviceOptions, ageGroupOptions }),
    [serviceOptions, ageGroupOptions],
  );

  // 조회용 컬럼 처리 (편집 모드 false)
  const processedColumns = useMemo(
    () =>
      createProcessedColumns<RecommendedQuestionItem>({
        columns: recommendedQuestionColumns,
        isEditMode: false,
        selectFields: selectFieldsConfig,
        dateFields: dateFieldsConfig,
        dateFormat: 'YYYYMMDDHHmmss',
      }),
    [selectFieldsConfig],
  );

  // rowId getter
  const getRowId = useCallback((row: RecommendedQuestionItem) => row.qstId, []);

  // status가 in_review 또는 done_review인 경우 최종 결재 버튼 숨김
  const canShowFinalApprovalButton = useMemo(() => {
    if (!approvalRequest) return true; // 데이터 로딩 전에는 표시
    const status = approvalRequest.approvalStatus;
    return status !== IN_REVIEW && status !== DONE_REVIEW;
  }, [approvalRequest]);

  // 최종 결재 처리
  const handleFinalApproval = useCallback(async () => {
    console.log('handleFinalApproval disabled');
  }, [queryClient, id, handleBack]);

  return (
    <Box>
      <PageHeader title={PAGE_TITLES.RECOMMENDED_QUESTIONS_APPROVAL_DETAIL} />

      <ApprovalDetailList<RecommendedQuestionItem>
        rows={data}
        columns={processedColumns}
        getRowId={getRowId}
        onBack={handleBack}
        onFinalApproval={handleFinalApproval}
        showFinalApprovalButton={canShowFinalApprovalButton}
        isLoading={isLoading}
        isError={isError}
      />
    </Box>
  );
};

export default RecommendedQuestionsApprovalDetailPage;
