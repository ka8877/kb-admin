import React, { useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Box } from '@mui/material';
import type { AppSchemeItem } from '@/pages/data-reg/app-scheme/types';
import { appSchemeColumns } from '@/pages/data-reg/app-scheme/components/columns/columns';
import PageHeader from '@/components/common/PageHeader';
import ApprovalDetailList from '@components/common/list/ApprovalDetailList';
import { ROUTES } from '@/routes/menu';
import { selectFieldsConfig, dateFieldsConfig } from '@/pages/data-reg/app-scheme/data';
import { TOAST_MESSAGES } from '@/constants/message';
import { toast } from 'react-toastify';
import { useApprovalDetailAppSchemes } from '@/pages/data-reg/app-scheme/hooks';
import { fetchApprovalRequest, updateApprovalRequestStatus } from '@/pages/data-reg/app-scheme/api';
import { useQuery } from '@tanstack/react-query';
import { formatDateForStorage } from '@/utils/dateUtils';
import { IN_REVIEW, DONE_REVIEW, APPROVAL_PAGE_STATE } from '@/constants/options';
import { createProcessedColumns } from '@components/common/upload/utils/listUtils';
import { APP_SCHEME, appSchemeKeys, approvalRequestKeys } from '@/constants/queryKey';
import { PAGE_TITLES } from '@/constants/pageTitle';

const AppSchemeApprovalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // React Query로 데이터 fetching
  const { data = [], isLoading, isError } = useApprovalDetailAppSchemes(id);

  // 승인 요청 정보 조회
  const { data: approvalRequest } = useQuery({
    queryKey: appSchemeKeys.approvalRequest(id!),
    queryFn: () => fetchApprovalRequest(id!),
    enabled: !!id,
  });

  // sessionStorage 접근 최적화
  const savedApprovalState = useMemo(() => sessionStorage.getItem(APPROVAL_PAGE_STATE), []);

  const handleBack = useCallback(() => {
    if (savedApprovalState) {
      sessionStorage.removeItem(APPROVAL_PAGE_STATE);
      navigate(savedApprovalState);
    } else {
      navigate(ROUTES.APP_SCHEME_APPROVAL);
    }
  }, [savedApprovalState, navigate]);

  // 조회용 컬럼 처리 (편집 모드 false)
  const processedColumns = useMemo(
    () =>
      createProcessedColumns<AppSchemeItem>({
        columns: appSchemeColumns,
        isEditMode: false,
        selectFields: selectFieldsConfig,
        dateFields: dateFieldsConfig,
        dateFormat: 'YYYYMMDDHHmmss',
      }),
    [],
  );

  // rowId getter
  const getRowId = useCallback((row: AppSchemeItem) => row.appSchemeId, []);

  // status가 in_review 또는 done_review인 경우 최종 결재 버튼 숨김
  const canShowFinalApprovalButton = useMemo(() => {
    if (!approvalRequest) return true; // 데이터 로딩 전에는 표시
    const status = approvalRequest.approvalStatus;
    return status !== IN_REVIEW && status !== DONE_REVIEW;
  }, [approvalRequest]);

  // 최종 결재 처리
  const handleFinalApproval = useCallback(async () => {
    try {
      if (!id) {
        toast.error(TOAST_MESSAGES.APPROVAL_ID_MISSING);
        return;
      }

      // status를 in_review로 업데이트
      const inReviewStatus = IN_REVIEW;
      const processDate = formatDateForStorage(new Date(), 'YYYYMMDDHHmmss') || '';
      await updateApprovalRequestStatus(id, inReviewStatus, processDate);

      // 모든 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: appSchemeKeys.approvalRequest(id!) });
      queryClient.invalidateQueries({ queryKey: appSchemeKeys.approvalDetailQuestions(id!) });
      queryClient.invalidateQueries({ queryKey: approvalRequestKeys.list(APP_SCHEME) });

      // toast.success(TOAST_MESSAGES.FINAL_APPROVAL_REQUESTED);
      handleBack();
    } catch (error) {
      console.error('결재 승인 실패:', error);
      toast.error(TOAST_MESSAGES.FINAL_APPROVAL_FAILED);
    }
  }, [queryClient, id, handleBack]);

  return (
    <Box>
      <PageHeader title={PAGE_TITLES.APP_SCHEME_APPROVAL_DETAIL} />

      <ApprovalDetailList<AppSchemeItem>
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

export default AppSchemeApprovalDetailPage;
