import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Box } from '@mui/material';
import type { RecommendedQuestionItem } from './types';
import { recommendedQuestionColumns } from './components/columns/columns';
import PageHeader from '@/components/common/PageHeader';
import ApprovalDetailList from '@/components/common/list/ApprovalDetailList';
import { ROUTES } from '@/routes/menu';
import {
  loadServiceOptions,
  loadAgeGroupOptions,
  createSelectFieldsConfig,
  dateFieldsConfig,
} from './data';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { CONFIRM_TITLES, CONFIRM_MESSAGES, TOAST_MESSAGES } from '@/constants/message';
import { toast } from 'react-toastify';
import { useApprovalDetailQuestions } from './hooks';
import { fetchApprovalRequest, updateApprovalRequestStatus } from './api';
import { useQuery } from '@tanstack/react-query';
import { formatDateForStorage } from '@/utils/dateUtils';
import { IN_REVIEW, DONE_REVIEW } from '@/constants/options';
import { approvalRequestKeys } from '@/constants/queryKey';
import { createProcessedColumns } from '@/components/common/upload/utils/listUtils';

const RecommendedQuestionsApprovalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showConfirm } = useConfirmDialog();
  const queryClient = useQueryClient();
  const [serviceOptions, setServiceOptions] = useState<{ label: string; value: string }[]>([]);
  const [ageGroupOptions, setAgeGroupOptions] = useState<{ label: string; value: string }[]>([]);

  // 옵션 데이터 로드
  useEffect(() => {
    const loadOptions = async () => {
      const [services, ageGroups] = await Promise.all([loadServiceOptions(), loadAgeGroupOptions()]);
      setServiceOptions(services);
      setAgeGroupOptions(ageGroups);
    };
    loadOptions();
  }, []);

  // React Query로 데이터 fetching
  const { data = [], isLoading } = useApprovalDetailQuestions(id);

  // 승인 요청 정보 조회
  const { data: approvalRequest } = useQuery({
    queryKey: approvalRequestKeys.detail(id!),
    queryFn: () => fetchApprovalRequest(id!),
    enabled: !!id,
  });

  // sessionStorage 접근 최적화
  const savedApprovalState = useMemo(() => sessionStorage.getItem('approval_page_state'), []);

  const handleBack = useCallback(() => {
    if (savedApprovalState) {
      sessionStorage.removeItem('approval_page_state');
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
  const getRowId = useCallback((row: RecommendedQuestionItem) => row.qst_id, []);

  // status가 in_review 또는 done_review인 경우 최종 결재 버튼 숨김
  const canShowFinalApprovalButton = useMemo(() => {
    if (!approvalRequest) return true; // 데이터 로딩 전에는 표시
    const status = approvalRequest.status;
    return status !== IN_REVIEW && status !== DONE_REVIEW;
  }, [approvalRequest]);


  // 최종 결재 처리
  const handleFinalApproval = useCallback(() => {
    showConfirm({
      title: CONFIRM_TITLES.APPROVAL_REQUEST,
      message: CONFIRM_MESSAGES.APPROVAL_REQUEST,
      onConfirm: async () => {
        try {
          if (!id) {
            toast.error('승인 요청 ID가 없습니다.');
            return;
          }

          // status를 in_review로 업데이트
          const inReviewStatus = IN_REVIEW;
          const processDate = formatDateForStorage(new Date(), 'YYYYMMDDHHmmss') || '';
          await updateApprovalRequestStatus(id, inReviewStatus, processDate);

          // 모든 관련 쿼리 무효화
          queryClient.invalidateQueries({ queryKey: approvalRequestKeys.detail(id) });
          queryClient.invalidateQueries({ queryKey: approvalRequestKeys.detailQuestions(id) });
          queryClient.invalidateQueries({ queryKey: approvalRequestKeys.list('recommended-questions') });

          toast.success(TOAST_MESSAGES.FINAL_APPROVAL_REQUESTED);
          handleBack();
        } catch (error) {
          console.error('결재 승인 실패:', error);
          toast.error('결재 승인에 실패했습니다.');
        }
      },
    });
  }, [showConfirm, queryClient, id, handleBack]);


  return (
    <Box>
      <PageHeader title="추천질문 결재 상세" />

      <ApprovalDetailList<RecommendedQuestionItem>
        rows={data}
        columns={processedColumns}
        getRowId={getRowId}
        onBack={handleBack}
        onFinalApproval={handleFinalApproval}
        showFinalApprovalButton={canShowFinalApprovalButton}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default RecommendedQuestionsApprovalDetailPage;
