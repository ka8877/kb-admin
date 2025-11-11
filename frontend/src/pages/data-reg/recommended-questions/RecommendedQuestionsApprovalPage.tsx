import React, { useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import type { ApprovalRequestItem } from '@/types/types';
import { approvalRequestColumns } from '@/constants/columns';
import SimpleList from '@/components/common/list/SimpleList';
import PageHeader from '@/components/common/PageHeader';
import { ROUTES } from '@/routes/menu';
import { mockApprovalRequests } from './data';

const listApi = {
  list: async (): Promise<ApprovalRequestItem[]> => {
    return Promise.resolve(mockApprovalRequests);
  },
};

const RecommendedQuestionsApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // sessionStorage에서 원본 URL 가져오기 (useMemo로 최적화)
  const returnUrl = useMemo(() => {
    const savedUrl = sessionStorage.getItem('approval_return_url');
    console.log('🔍 ApprovalPage useMemo - returnUrl from sessionStorage:', savedUrl);
    return savedUrl;
  }, []);

  const handleBack = useCallback(() => {
    console.log('🔍 ApprovalPage handleBack - returnUrl:', returnUrl);

    if (returnUrl) {
      console.log('🔍 ApprovalPage handleBack - navigating to saved URL:', returnUrl);
      sessionStorage.removeItem('approval_return_url');
      navigate(returnUrl);
    } else {
      navigate(ROUTES.RECOMMENDED_QUESTIONS);
    }
  }, [returnUrl, navigate]);

  const handleRowClick = useCallback(
    (params: { id: string | number; row: ApprovalRequestItem }) => {
      const currentApprovalUrl = location.pathname + location.search;
      console.log(
        '🔍 ApprovalPage handleRowClick - saving current approval state:',
        currentApprovalUrl,
      );
      sessionStorage.setItem('approval_page_state', currentApprovalUrl);

      const detailUrl = ROUTES.RECOMMENDED_QUESTIONS_APPROVAL_DETAIL(params.id);
      console.log('🔍 ApprovalPage handleRowClick - navigating to:', detailUrl);
      navigate(detailUrl);
    },
    [location.pathname, location.search, navigate],
  );

  return (
    <Box>
      <PageHeader title="추천질문 결재 요청" />
      <SimpleList<ApprovalRequestItem>
        columns={approvalRequestColumns}
        fetcher={listApi.list}
        onBack={handleBack}
        onRowClick={handleRowClick}
        enableStatePreservation={true} // URL 기반 상태 보존 활성화
      />
    </Box>
  );
};

export default RecommendedQuestionsApprovalPage;
