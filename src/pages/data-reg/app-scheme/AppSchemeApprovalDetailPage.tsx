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

import { IN_REVIEW, DONE_REVIEW, APPROVAL_PAGE_STATE } from '@/constants/options';
import { createProcessedColumns } from '@components/common/upload/utils/listUtils';
import { PAGE_TITLES } from '@/constants/pageTitle';

const AppSchemeApprovalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    console.log('handleFinalApproval disabled');
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
