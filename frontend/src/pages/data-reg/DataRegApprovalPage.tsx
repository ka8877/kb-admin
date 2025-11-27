import { toast } from 'react-toastify';
import { TOAST_MESSAGES, ALERT_TITLES, ALERT_MESSAGES } from '@/constants/message';
import { IN_REVIEW, DONE_REVIEW } from '@/constants/options';
import { approvalRequestKeys } from '@/constants/queryKey';
import React, { useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import type { ApprovalRequestItem } from '@/types/types';
import { approvalRequestColumns } from '@/constants/columns';
import SimpleList from '@/components/common/list/SimpleList';
import PageHeader from '@/components/common/PageHeader';
import { ROUTES } from '@/routes/menu';
import { approvalSearchFields as recommendedQuestionsApprovalSearchFields } from './recommended-questions/data';
import { approvalSearchFields as appSchemeApprovalSearchFields } from './app-scheme/data';
import ApprovalListActions from '../../components/common/actions/ApprovalListActions';
import { ApprovalConfirmActions } from '@/components/common/actions/ApprovalConfirmActions';
import { getApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { env } from '@/config';
import { useQueryClient } from '@tanstack/react-query';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { updateApprovalRequestStatus } from './recommended-questions/api';
import { formatDateForStorage } from '@/utils/dateUtils';

// 경로 타입 정의
type ApprovalPageType = 'recommended-questions' | 'app-scheme';

// 경로에서 타입 추출 (ROUTES 상수 사용)
const getApprovalPageType = (pathname: string): ApprovalPageType => {
  if (pathname.includes(ROUTES.APP_SCHEME_APPROVAL)) {
    return 'app-scheme';
  }
  return 'recommended-questions';
};

/**
 * Firebase 응답 데이터를 ApprovalRequestItem으로 변환하는 함수
 */
const transformApprovalRequests = (raw: unknown): ApprovalRequestItem[] => {
  if (!raw) return [];

  // 배열 형태 응답: [null, { ... }, { ... }]
  if (Array.isArray(raw)) {
    return raw
      .map((item, index) => {
        if (!item) return null;
        const v = item as Partial<ApprovalRequestItem> & Record<string, any>;
        return {
          no: v.no ?? index + 1,
          id: String(v.id ?? index + 1),
          approval_form: v.approval_form ?? '',
          title: v.title ?? '',
          content: v.content ?? '',
          requester: v.requester ?? null,
          department: v.department ?? '',
          request_date: v.request_date ? String(v.request_date) : '',
          status: v.status ?? 'request',
          process_date: v.process_date ? String(v.process_date) : '',
        };
      })
      .filter((item): item is ApprovalRequestItem => item !== null);
  }

  // 객체 형태 응답도 지원 (기존 방식)
  if (typeof raw === 'object' && raw !== null) {
    const entries = Object.entries(raw as Record<string, unknown>) as [string, any][];

    return entries.map(([key, value], index) => {
      const v = value as Partial<ApprovalRequestItem> & Record<string, any>;
      return {
        no: v.no ?? index + 1,
        id: String(v.id ?? key),
        approval_form: v.approval_form ?? '',
        title: v.title ?? '',
        content: v.content ?? '',
        requester: v.requester ?? null,
        department: v.department ?? '',
        request_date: v.request_date ? String(v.request_date) : '',
        status: v.status ?? 'request',
        process_date: v.process_date ? String(v.process_date) : '',
      };
    });
  }

  return [];
};

/**
 * 승인 요청 목록 조회 API
 */
const fetchApprovalRequests = async (
  pageType: ApprovalPageType,
): Promise<ApprovalRequestItem[]> => {
  const endpoint =
    pageType === 'app-scheme'
      ? API_ENDPOINTS.APP_SCHEME.APPROVAL_LIST
      : API_ENDPOINTS.RECOMMENDED_QUESTIONS.APPROVAL_LIST;

  const response = await getApi<ApprovalRequestItem[]>(endpoint, {
    baseURL: env.testURL,
    transform: transformApprovalRequests,
    errorMessage: '승인 요청 목록을 불러오지 못했습니다.',
  });

  return response.data;
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
        searchFields: appSchemeApprovalSearchFields,
        defaultReturnRoute: ROUTES.APP_SCHEME,
        approvalDetailRoute: (id: string | number) => ROUTES.APP_SCHEME_APPROVAL_DETAIL(id),
      };
    }
    return {
      title: '추천질문 결재 요청',
      searchFields: recommendedQuestionsApprovalSearchFields,
      defaultReturnRoute: ROUTES.RECOMMENDED_QUESTIONS,
      approvalDetailRoute: (id: string | number) =>
        ROUTES.RECOMMENDED_QUESTIONS_APPROVAL_DETAIL(id),
    };
  }, [pageType]);

  // selectFields 설정 (코드 값을 label로 변환)
  const selectFieldsConfig = useMemo(() => {
    const approvalFormField = pageConfig.searchFields?.find(
      (field): field is Extract<typeof field, { type: 'select'; field: string }> =>
        field.type === 'select' && field.field === 'approval_form',
    );
    const statusField = pageConfig.searchFields?.find(
      (field): field is Extract<typeof field, { type: 'select'; field: string }> =>
        field.type === 'select' && field.field === 'status',
    );

    const approvalFormOptions = approvalFormField?.options || [];
    const statusOptions = statusField?.options || [];

    return {
      approval_form: approvalFormOptions.map((opt: { label: string; value: string | number }) => ({
        label: opt.label,
        value: String(opt.value),
      })),
      status: statusOptions.map((opt: { label: string; value: string | number }) => ({
        label: opt.label,
        value: String(opt.value),
      })),
    };
  }, [pageConfig.searchFields]);

  // 승인 요청 목록 조회
  const {
    data: approvalRequests = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: approvalRequestKeys.list(pageType),
    queryFn: () => fetchApprovalRequests(pageType),
  });

  // isLoading 또는 isFetching 중 하나라도 true면 로딩 상태로 처리
  const isDataLoading = isLoading || isFetching;

  // 페이지가 마운트되거나 경로가 변경될 때 데이터 리프레시 (뒤로가기 시 자동 리프레시)
  useEffect(() => {
    refetch();
  }, [location.pathname, refetch]);

  const listApi = {
    list: async (): Promise<ApprovalRequestItem[]> => {
      return approvalRequests;
    },
  };

  // sessionStorage에서 원본 URL 가져오기 (useMemo로 최적화)
  const returnUrl = useMemo(() => {
    return sessionStorage.getItem('approval_return_url');
  }, []);

  const handleBack = useCallback(() => {
    if (returnUrl) {
      sessionStorage.removeItem('approval_return_url');
      navigate(returnUrl);
    } else {
      navigate(pageConfig.defaultReturnRoute);
    }
  }, [returnUrl, navigate, pageConfig.defaultReturnRoute]);

  const handleRowClick = useCallback(
    (params: { id: string | number; row: ApprovalRequestItem }) => {
      const currentApprovalUrl = location.pathname + location.search;
      sessionStorage.setItem('approval_page_state', currentApprovalUrl);

      const detailUrl = pageConfig.approvalDetailRoute(params.id);
      navigate(detailUrl);
    },
    [location.pathname, location.search, navigate, pageConfig],
  );

  // 결재 선택 토글 상태 및 핸들러
  const [approveSelectionMode, setApproveSelectionMode] = React.useState(false);
  const handleApproveSelect = useCallback((next: boolean) => {
    setApproveSelectionMode(next);
  }, []);

  const queryClient = useQueryClient();
  const { showAlert } = useAlertDialog();

  // 결재 확인 처리
  const handleApproveConfirm = useCallback(
    async (selectedIds: (string | number)[], toggleSelectionMode?: (next?: boolean) => void) => {
      if (selectedIds.length === 0) {
        showAlert({
          title: ALERT_TITLES.VALIDATION_CHECK,
          message: ALERT_MESSAGES.NO_ITEMS_SELECTED,
          severity: 'warning',
        });
        return;
      }

      // 추천질문 승인 요청인 경우에만 처리
      if (pageType !== 'recommended-questions') {
        toast.success(TOAST_MESSAGES.FINAL_APPROVAL_SUCCESS);
        handleApproveSelect(false);
        return;
      }

      // 선택된 승인 요청들 필터링
      const selectedRequests = approvalRequests.filter((request) =>
        selectedIds.includes(request.id),
      );

      // done_review 상태인 건은 선택 불가
      const doneReviewRequests = selectedRequests.filter(
        (request) => request.status === DONE_REVIEW,
      );
      if (doneReviewRequests.length > 0) {
        showAlert({
          title: ALERT_TITLES.VALIDATION_CHECK,
          message: ALERT_MESSAGES.APPROVED_ITEMS_CANNOT_SELECT,
          severity: 'warning',
        });
        return;
      }

      // 선택된 요청이 없으면 return
      if (selectedRequests.length === 0) {
        showAlert({
          title: ALERT_TITLES.VALIDATION_CHECK,
          message: ALERT_MESSAGES.NO_ITEMS_SELECTED,
          severity: 'warning',
        });
        return;
      }

      // 최종 결재 요청: 모든 선택된 요청의 status를 in_review로 변경
      try {
        const processDate = formatDateForStorage(new Date(), 'YYYYMMDDHHmmss') || '';
        // 모든 선택된 요청의 status를 in_review로 변경
        for (const request of selectedRequests) {
          await updateApprovalRequestStatus(request.id, IN_REVIEW, processDate);
        }
        toast.success(TOAST_MESSAGES.FINAL_APPROVAL_SUCCESS);
        setApproveSelectionMode(false);
        if (toggleSelectionMode) {
          toggleSelectionMode(false);
        }
        queryClient.invalidateQueries({ queryKey: approvalRequestKeys.list(pageType) });
      } catch (error) {
        toast.error('최종 결재 처리에 실패했습니다.');
      }
    },
    [approvalRequests, pageType, showAlert, queryClient, handleApproveSelect],
  );

  return (
    <Box>
      <PageHeader title={pageConfig.title} />
      <SimpleList<ApprovalRequestItem>
        columns={approvalRequestColumns}
        searchFields={pageConfig.searchFields}
        fetcher={listApi.list}
        isLoading={isDataLoading}
        selectFields={selectFieldsConfig}
        dateFields={['request_date', 'process_date']}
        dateFormat="YYYYMMDDHHmmss"
        dateDisplayFormat="dots"
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
              handleApproveConfirm(ids, toggleSelectionMode);
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
        isRowSelectable={(params) => {
          // done_review 상태인 행만 선택 불가
          return params.row.status !== DONE_REVIEW && params.row.status !== IN_REVIEW;
        }}
      />
    </Box>
  );
};

export default DataRegApprovalPage;
