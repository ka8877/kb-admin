import { toast } from 'react-toastify';
import { TOAST_MESSAGES } from '@/constants/message';
import React, { useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import type { ApprovalRequestItem } from '@/types/types';
import { approvalRequestColumns } from '@/constants/columns';
import SimpleList from '@/components/common/list/SimpleList';
import PageHeader from '@/components/common/PageHeader';
import { ROUTES } from '@/routes/menu';
import { approvalSearchFields as recommendedQuestionsApprovalSearchFields, mockApprovalRequests as recommendedQuestionsMockApprovalRequests } from './recommended-questions/data';
import { approvalSearchFields as appSchemeApprovalSearchFields, mockApprovalRequests as appSchemeMockApprovalRequests } from './app-scheme/data';
import ApprovalListActions from '../../components/common/actions/ApprovalListActions';
import { ApprovalConfirmActions } from '@/components/common/actions/ApprovalConfirmActions';

// 경로 타입 정의
type ApprovalPageType = 'recommended-questions' | 'app-scheme';

// 경로에서 타입 추출 (ROUTES 상수 사용)
const getApprovalPageType = (pathname: string): ApprovalPageType => {
  if (pathname.includes(ROUTES.APP_SCHEME_APPROVAL)) {
    return 'app-scheme';
  }
  return 'recommended-questions';
};

const DataRegApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 경로에 따라 타입 결정
  const pageType = useMemo(() => getApprovalPageType(location.pathname), [location.pathname]);
  
  // 타입에 따른 설정
  const pageConfig = useMemo(() => {
    if (pageType === 'app-scheme') {
      return {
        title: '앱스킴 결재 요청',
        mockData: appSchemeMockApprovalRequests,
        searchFields: appSchemeApprovalSearchFields,
        defaultReturnRoute: ROUTES.APP_SCHEME,
        approvalDetailRoute: (id: string | number) => ROUTES.APP_SCHEME_APPROVAL_DETAIL(id),
      };
    }
    return {
      title: '추천질문 결재 요청',
      mockData: recommendedQuestionsMockApprovalRequests,
      searchFields: recommendedQuestionsApprovalSearchFields,
      defaultReturnRoute: ROUTES.RECOMMENDED_QUESTIONS,
      approvalDetailRoute: (id: string | number) => ROUTES.RECOMMENDED_QUESTIONS_APPROVAL_DETAIL(id),
    };
  }, [pageType]);

  const listApi = {
    list: async (): Promise<ApprovalRequestItem[]> => {
      return Promise.resolve(pageConfig.mockData);
    },
  };

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
      navigate(pageConfig.defaultReturnRoute);
    }
  }, [returnUrl, navigate, pageConfig.defaultReturnRoute]);

  const handleRowClick = useCallback(
    (params: { id: string | number; row: ApprovalRequestItem }) => {
      const currentApprovalUrl = location.pathname + location.search;
      console.log(
        '🔍 ApprovalPage handleRowClick - saving current approval state:',
        currentApprovalUrl,
      );
      sessionStorage.setItem('approval_page_state', currentApprovalUrl);

      const detailUrl = pageConfig.approvalDetailRoute(params.id);
      console.log('🔍 ApprovalPage handleRowClick - navigating to:', detailUrl);
      navigate(detailUrl);
    },
    [location.pathname, location.search, navigate, pageConfig],
  );

  // 결재 선택 토글 상태 및 핸들러
  const [approveSelectionMode, setApproveSelectionMode] = React.useState(false);
  const handleApproveSelect = useCallback((next: boolean) => {
    setApproveSelectionMode(next);
  }, []);

  return (
    <Box>
      <PageHeader title={pageConfig.title} />
      <SimpleList<ApprovalRequestItem>
        columns={approvalRequestColumns}
        searchFields={pageConfig.searchFields}
        fetcher={listApi.list}
        actionsNode={({ toggleSelectionMode }) => (
          <ApprovalListActions
            onBack={handleBack}
            onApproveSelect={() => toggleSelectionMode()}
            approveSelectLabel={approveSelectionMode ? '선택 취소' : '결재 선택'}
            approveSelectActive={approveSelectionMode}
          />
        )}
        confirmBarNode={({ selectedIds, toggleSelectionMode }) => (
          <ApprovalConfirmActions
            open={approveSelectionMode}
            selectedIds={selectedIds as (string | number)[]}
            onConfirm={(ids: (string | number)[]) => {
              toast.success(TOAST_MESSAGES.FINAL_APPROVAL_SUCCESS);
              handleApproveSelect(false);
              toggleSelectionMode(false);
              // 실제 결재 처리 로직 연결 가능
            }}
            onCancel={() => {
              handleApproveSelect(false);
              toggleSelectionMode(false);
            }}
          />
        )}
        onBack={handleBack}
        onRowClick={handleRowClick}
        enableStatePreservation={true}
        onApproveSelect={handleApproveSelect}
      />
    </Box>
  );
};

export default DataRegApprovalPage;

