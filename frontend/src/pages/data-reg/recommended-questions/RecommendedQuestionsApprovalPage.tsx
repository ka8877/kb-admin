import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import type { ApprovalRequestItem } from '../../../types/types';
import { approvalRequestColumns } from '../../../constants/columns';
import SimpleList from '../../../components/common/list/SimpleList';
import { ROUTES } from '../../../routes/menu';
import { mockApprovalRequests } from './data';

const listApi = {
  list: async (): Promise<ApprovalRequestItem[]> => {
    return Promise.resolve(mockApprovalRequests);
  },
};

const RecommendedQuestionsApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // sessionStorage에서 원본 URL 가져오기
  const returnUrl = React.useMemo(() => {
    const savedUrl = sessionStorage.getItem('approval_return_url');
    console.log('🔍 ApprovalPage useMemo - returnUrl from sessionStorage:', savedUrl);
    return savedUrl;
  }, []);

  const handleBack = () => {
    console.log('🔍 ApprovalPage handleBack - returnUrl:', returnUrl);

    if (returnUrl) {
      // sessionStorage에 저장된 원본 URL로 복귀
      console.log('🔍 ApprovalPage handleBack - navigating to saved URL:', returnUrl);
      sessionStorage.removeItem('approval_return_url'); // 사용 후 정리
      navigate(returnUrl);
    } else {
      // 직접 접근한 경우 기본 추천질문 페이지로
      navigate(ROUTES.RECOMMENDED_QUESTIONS);
    }
  };

  const handleRowClick = (params: { id: string | number; row: ApprovalRequestItem }) => {
    // ApprovalPage의 현재 상태를 sessionStorage에 저장
    const currentApprovalUrl = location.pathname + location.search;
    console.log(
      '🔍 ApprovalPage handleRowClick - saving current approval state:',
      currentApprovalUrl,
    );
    sessionStorage.setItem('approval_page_state', currentApprovalUrl);

    // 결재 요청 상세 페이지로 이동
    const detailUrl = ROUTES.RECOMMENDED_QUESTIONS_APPROVAL_DETAIL(params.id);
    console.log('🔍 ApprovalPage handleRowClick - navigating to:', detailUrl);
    navigate(detailUrl);
  };

  return (
    <SimpleList<ApprovalRequestItem>
      columns={approvalRequestColumns}
      fetcher={listApi.list}
      onBack={handleBack}
      onRowClick={handleRowClick}
      enableStatePreservation={true} // URL 기반 상태 보존 활성화
    />
  );
};

export default RecommendedQuestionsApprovalPage;
