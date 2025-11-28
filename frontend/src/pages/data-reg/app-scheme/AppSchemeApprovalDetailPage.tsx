import React, { useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Box } from '@mui/material';
import type { AppSchemeItem } from './types';
import { appSchemeColumns } from './components/columns/columns';
import PageHeader from '@/components/common/PageHeader';
import ApprovalDetailList from '@/components/common/list/ApprovalDetailList';
import { ROUTES } from '@/routes/menu';
import { selectFieldsConfig, dateFieldsConfig } from './data';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { CONFIRM_TITLES, CONFIRM_MESSAGES, TOAST_MESSAGES } from '@/constants/message';
import { toast } from 'react-toastify';
import { useApprovalDetailAppSchemes } from './hooks';
import { fetchApprovalRequest, updateApprovalRequestStatus } from './api';
import { useQuery } from '@tanstack/react-query';
import { formatDateForStorage } from '@/utils/dateUtils';
import { IN_REVIEW, DONE_REVIEW } from '@/constants/options';
import { createProcessedColumns } from '@/components/common/upload/utils/listUtils';

const AppSchemeApprovalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showConfirm } = useConfirmDialog();
  const queryClient = useQueryClient();

  // React Query로 데이터 fetching
  const { data = [], isLoading } = useApprovalDetailAppSchemes(id);

  // 승인 요청 정보 조회
  const { data: approvalRequest } = useQuery({
    queryKey: ['app-scheme-approval-request', id],
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
    [selectFieldsConfig, dateFieldsConfig],
  );

  // rowId getter
  const getRowId = useCallback((row: AppSchemeItem) => row.id, []);

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
          queryClient.invalidateQueries({ queryKey: ['app-scheme-approval-request', id] });
          queryClient.invalidateQueries({ queryKey: ['app-scheme-approval-detail-questions', id] });
          queryClient.invalidateQueries({ queryKey: ['approval-requests', 'list', 'app-scheme'] });

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
      <PageHeader title="앱스킴 결재 상세" />

      <ApprovalDetailList<AppSchemeItem>
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

export default AppSchemeApprovalDetailPage;
