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
import ApprovalListActions from '@/components/common/actions/ApprovalListActions';
import { ApprovalConfirmActions } from '@/components/common/actions/ApprovalConfirmActions';
import { getApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { env } from '@/config';
import { useQueryClient } from '@tanstack/react-query';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { updateApprovalRequestStatus as updateRecommendedQuestionStatus } from '@/pages/data-reg/recommended-questions/api';
import { updateApprovalRequestStatus as updateAppSchemeStatus } from '@/pages/data-reg/app-scheme/api';
import { formatDateForStorage } from '@/utils/dateUtils';
import { APPROVAL_SEARCH_FIELDS, APPROVAL_PAGE_STATE } from '@/constants/options';

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
          approvalRequestId: String(v.approvalRequestId ?? v.id ?? index + 1),
          targetType: v.targetType ?? '',
          targetId: v.targetId ?? '',
          itsvcNo: v.itsvcNo ?? null,
          requestKind: v.requestKind ?? v.approval_form ?? '',
          approvalStatus: v.approvalStatus ?? v.status ?? 'request',
          title: v.title ?? null,
          content: v.content ?? null,
          createdBy: v.createdBy ?? v.requester ?? '',
          department: v.department ?? '',
          updatedBy: v.updatedBy ?? null,
          createdAt: v.createdAt ?? (v.request_date ? String(v.request_date) : ''),
          updatedAt: v.updatedAt ?? (v.process_date ? String(v.process_date) : ''),
          isRetracted: v.isRetracted ?? 0,
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
        approvalRequestId: String(v.approvalRequestId ?? v.id ?? key),
        targetType: v.targetType ?? '',
        targetId: v.targetId ?? '',
        itsvcNo: v.itsvcNo ?? null,
        requestKind: v.requestKind ?? v.approval_form ?? '',
        approvalStatus: v.approvalStatus ?? v.status ?? 'request',
        title: v.title ?? null,
        content: v.content ?? null,
        createdBy: v.createdBy ?? v.requester ?? '',
        department: v.department ?? '',
        updatedBy: v.updatedBy ?? null,
        createdAt: v.createdAt ?? (v.request_date ? String(v.request_date) : ''),
        updatedAt: v.updatedAt ?? (v.process_date ? String(v.process_date) : ''),
        isRetracted: v.isRetracted ?? 0,
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
        searchFields: APPROVAL_SEARCH_FIELDS,
        defaultReturnRoute: ROUTES.APP_SCHEME,
        approvalDetailRoute: (id: string | number) => ROUTES.APP_SCHEME_APPROVAL_DETAIL(id),
      };
    }
    return {
      title: '추천질문 결재 요청',
      searchFields: APPROVAL_SEARCH_FIELDS,
      defaultReturnRoute: ROUTES.RECOMMENDED_QUESTIONS,
      approvalDetailRoute: (id: string | number) =>
        ROUTES.RECOMMENDED_QUESTIONS_APPROVAL_DETAIL(id),
    };
  }, [pageType]);

  // selectFields 설정 (코드 값을 label로 변환)
  const selectFieldsConfig = useMemo(() => {
    const approvalFormField = pageConfig.searchFields?.find(
      (field): field is Extract<typeof field, { type: 'select'; field: string }> =>
        field.type === 'select' && field.field === 'requestKind',
    );
    const statusField = pageConfig.searchFields?.find(
      (field): field is Extract<typeof field, { type: 'select'; field: string }> =>
        field.type === 'select' && field.field === 'approvalStatus',
    );

    const approvalFormOptions = approvalFormField?.options || [];
    const statusOptions = statusField?.options || [];

    return {
      requestKind: approvalFormOptions.map((opt: { label: string; value: string | number }) => ({
        label: opt.label,
        value: String(opt.value),
      })),
      approvalStatus: statusOptions.map((opt: { label: string; value: string | number }) => ({
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
  } = useQuery({
    queryKey: approvalRequestKeys.list(pageType),
    queryFn: () => fetchApprovalRequests(pageType),
  });

  // isLoading 또는 isFetching 중 하나라도 true면 로딩 상태로 처리
  const isDataLoading = isLoading || isFetching;

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
      sessionStorage.setItem(APPROVAL_PAGE_STATE, currentApprovalUrl);

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

      // 선택된 승인 요청들 필터링
      const selectedRequests = approvalRequests.filter((request) =>
        selectedIds.includes(request.approvalRequestId),
      );

      // done_review 상태인 건은 선택 불가
      const doneReviewRequests = selectedRequests.filter(
        (request) => request.approvalStatus === DONE_REVIEW,
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
          if (pageType === 'app-scheme') {
            await updateAppSchemeStatus(request.approvalRequestId, IN_REVIEW, processDate);
          } else {
            await updateRecommendedQuestionStatus(
              request.approvalRequestId,
              IN_REVIEW,
              processDate,
            );
          }
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
        dateFields={['createdAt', 'updatedAt']}
        dateFormat="YYYYMMDDHHmmss"
        dateDisplayFormat="dots"
        rowIdGetter="approvalRequestId"
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
          return (
            params.row.approvalStatus !== DONE_REVIEW && params.row.approvalStatus !== IN_REVIEW
          );
        }}
      />
    </Box>
  );
};

export default DataRegApprovalPage;
