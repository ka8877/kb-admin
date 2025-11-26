import { toast } from 'react-toastify';
import { TOAST_MESSAGES, CONFIRM_TITLES, CONFIRM_MESSAGES } from '@/constants/message';
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
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import {
  fetchApprovalDetailQuestions,
  updateApprovalRequestStatus,
  createApprovedQuestions,
  updateApprovedQuestions,
  deleteApprovedQuestions,
} from './recommended-questions/api';
import { formatDateForStorage } from '@/utils/dateUtils';
import type { RecommendedQuestionItem } from './recommended-questions/types';

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
const fetchApprovalRequests = async (pageType: ApprovalPageType): Promise<ApprovalRequestItem[]> => {
  const endpoint = pageType === 'app-scheme' 
    ? API_ENDPOINTS.APP_SCHEME.APPROVAL_LIST
    : API_ENDPOINTS.RECOMMENDED_QUESTIONS.APPROVAL_LIST;

  const response = await getApi<ApprovalRequestItem[]>(
    endpoint,
    {
      baseURL: env.testURL,
      transform: transformApprovalRequests,
      errorMessage: '승인 요청 목록을 불러오지 못했습니다.',
    },
  );

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
      approvalDetailRoute: (id: string | number) => ROUTES.RECOMMENDED_QUESTIONS_APPROVAL_DETAIL(id),
    };
  }, [pageType]);

  // selectFields 설정 (코드 값을 label로 변환)
  const selectFieldsConfig = useMemo(() => {
    const approvalFormField = pageConfig.searchFields?.find(
      (field): field is Extract<typeof field, { type: 'select'; field: string }> =>
        field.type === 'select' && field.field === 'approval_form'
    );
    const statusField = pageConfig.searchFields?.find(
      (field): field is Extract<typeof field, { type: 'select'; field: string }> =>
        field.type === 'select' && field.field === 'status'
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
  const { data: approvalRequests = [], isLoading, refetch } = useQuery({
    queryKey: ['approval-requests', pageType],
    queryFn: () => fetchApprovalRequests(pageType),
  });

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

  const queryClient = useQueryClient();
  const { showConfirm } = useConfirmDialog();
  const { showAlert } = useAlertDialog();

  // 결재 확인 처리
  const handleApproveConfirm = useCallback(
    async (selectedIds: (string | number)[], toggleSelectionMode?: (next?: boolean) => void) => {
      console.log('🔍 handleApproveConfirm 호출됨', { selectedIds, pageType, approvalRequestsLength: approvalRequests.length });
      
      if (selectedIds.length === 0) {
        showAlert({
          title: '알림',
          message: '선택된 항목이 없습니다.',
          severity: 'warning',
        });
        return;
      }

      // 추천질문 승인 요청인 경우에만 처리
      if (pageType !== 'recommended-questions') {
        console.log('🔍 추천질문 승인 요청이 아님, pageType:', pageType);
        toast.success(TOAST_MESSAGES.FINAL_APPROVAL_SUCCESS);
        handleApproveSelect(false);
        return;
      }

      // 선택된 승인 요청들 필터링
      const selectedRequests = approvalRequests.filter((request) =>
        selectedIds.includes(request.id),
      );
      console.log('🔍 선택된 승인 요청들:', selectedRequests);

      // done_review 상태인 건은 선택 불가
      const doneReviewRequests = selectedRequests.filter(
        (request) => request.status === 'done_review',
      );
      if (doneReviewRequests.length > 0) {
        showAlert({
          title: '알림',
          message: '승인완료된 항목은 선택할 수 없습니다.',
          severity: 'warning',
        });
        return;
      }

      // status별로 분류
      const requestStatusRequests = selectedRequests.filter(
        (request) =>
          request.status === 'create_requested' ||
          request.status === 'update_requested' ||
          request.status === 'delete_requested',
      );
      const inReviewRequests = selectedRequests.filter(
        (request) => request.status === 'in_review',
      );

      console.log('🔍 status가 create_requested, update_requested, delete_requested인 요청들:', requestStatusRequests);
      console.log('🔍 status가 in_review인 요청들:', inReviewRequests);

      // 처리할 요청이 없으면 return
      if (requestStatusRequests.length === 0 && inReviewRequests.length === 0) {
        showAlert({
          title: '알림',
          message: '처리할 수 있는 항목이 없습니다.',
          severity: 'warning',
        });
        return;
      }

      // approval_form별로 분류
      const registrationRequests = requestStatusRequests.filter(
        (request) => request.approval_form === 'data_registration',
      );
      const modificationRequests = requestStatusRequests.filter(
        (request) => request.approval_form === 'data_modification',
      );
      const deletionRequests = requestStatusRequests.filter(
        (request) => request.approval_form === 'data_deletion',
      );

      console.log('🔍 approval_form이 data_registration인 요청들:', registrationRequests);
      console.log('🔍 approval_form이 data_modification인 요청들:', modificationRequests);
      console.log('🔍 approval_form이 data_deletion인 요청들:', deletionRequests);

      if (
        registrationRequests.length === 0 &&
        modificationRequests.length === 0 &&
        deletionRequests.length === 0
      ) {
        console.log('🔍 처리할 수 있는 approval_form이 없음');
        showAlert({
          title: '알림',
          message: '데이터 등록, 수정 또는 삭제 요청이 아닌 항목은 선택할 수 없습니다.',
          severity: 'warning',
        });
        return;
      }

      // in_review 상태인 요청들은 바로 최종 결재 confirm (실제 데이터 작업 없음)
      if (inReviewRequests.length > 0) {
        showConfirm({
          title: CONFIRM_TITLES.FINAL_APPROVAL,
          message: CONFIRM_MESSAGES.FINAL_APPROVAL,
          onConfirm: async () => {
            try {
              const processDate = formatDateForStorage(new Date(), 'YYYYMMDDHHmmss') || '';
              for (const request of inReviewRequests) {
                await updateApprovalRequestStatus(request.id, 'done_review', processDate);
              }
              toast.success(TOAST_MESSAGES.FINAL_APPROVAL_SUCCESS);
              setApproveSelectionMode(false);
              if (toggleSelectionMode) {
                toggleSelectionMode(false);
              }
              queryClient.invalidateQueries({ queryKey: ['approval-requests', pageType] });
            } catch (error) {
              console.error('🔍 최종 결재 처리 실패:', error);
              toast.error('최종 결재 처리에 실패했습니다.');
            }
          },
        });
      }

      // create_requested, update_requested, delete_requested 상태인 요청들은 실제 데이터 작업 수행
      if (requestStatusRequests.length === 0) {
        return;
      }

      console.log('🔍 승인 처리 시작');
      try {
        // data_registration 요청 처리
        for (const request of registrationRequests) {
          console.log('🔍 [data_registration] 승인 요청 처리 시작:', request.id);
          
          // 1. 승인 요청의 status를 done_review로 수정 (process_date 포함)
          const processDate = formatDateForStorage(new Date(), 'YYYYMMDDHHmmss') || '';
          console.log('🔍 updateApprovalRequestStatus 호출:', { id: request.id, status: 'done_review', processDate });
          await updateApprovalRequestStatus(request.id, 'done_review', processDate);
          console.log('🔍 updateApprovalRequestStatus 완료');

          // 2. 승인 요청의 list 조회
          console.log('🔍 fetchApprovalDetailQuestions 호출:', request.id);
          const listItems = await fetchApprovalDetailQuestions(request.id);
          console.log('🔍 fetchApprovalDetailQuestions 완료, listItems:', listItems);

          // 3. list에 있는 항목들을 실제 데이터로 등록 (qst_id 그대로 사용)
          if (listItems.length > 0) {
            console.log('🔍 createApprovedQuestions 호출, items:', listItems);
            await createApprovedQuestions(listItems);
            console.log('🔍 createApprovedQuestions 완료');
          } else {
            console.log('🔍 listItems가 비어있음');
          }
        }

        // data_modification 요청 처리
        for (const request of modificationRequests) {
          console.log('🔍 [data_modification] 승인 요청 처리 시작:', request.id);
          
          // 1. 승인 요청의 status를 done_review로 수정 (process_date 포함)
          const processDate = formatDateForStorage(new Date(), 'YYYYMMDDHHmmss') || '';
          console.log('🔍 updateApprovalRequestStatus 호출:', { id: request.id, status: 'done_review', processDate });
          await updateApprovalRequestStatus(request.id, 'done_review', processDate);
          console.log('🔍 updateApprovalRequestStatus 완료');

          // 2. 승인 요청의 list 조회
          console.log('🔍 fetchApprovalDetailQuestions 호출:', request.id);
          const listItems = await fetchApprovalDetailQuestions(request.id);
          console.log('🔍 fetchApprovalDetailQuestions 완료, listItems:', listItems);

          // 3. list에 있는 항목들을 실제 데이터로 수정 (각 qst_id로 UPDATE 호출)
          if (listItems.length > 0) {
            console.log('🔍 updateApprovedQuestions 호출, items:', listItems);
            await updateApprovedQuestions(listItems);
            console.log('🔍 updateApprovedQuestions 완료');
          } else {
            console.log('🔍 listItems가 비어있음');
          }
        }

        // data_deletion 요청 처리
        for (const request of deletionRequests) {
          console.log('🔍 [data_deletion] 승인 요청 처리 시작:', request.id);
          
          // 1. 승인 요청의 status를 done_review로 수정 (process_date 포함)
          const processDate = formatDateForStorage(new Date(), 'YYYYMMDDHHmmss') || '';
          console.log('🔍 updateApprovalRequestStatus 호출:', { id: request.id, status: 'done_review', processDate });
          await updateApprovalRequestStatus(request.id, 'done_review', processDate);
          console.log('🔍 updateApprovalRequestStatus 완료');

          // 2. 승인 요청의 list 조회
          console.log('🔍 fetchApprovalDetailQuestions 호출:', request.id);
          const listItems = await fetchApprovalDetailQuestions(request.id);
          console.log('🔍 fetchApprovalDetailQuestions 완료, listItems:', listItems);

          // 3. list에 있는 항목들을 실제 데이터로 삭제 (각 qst_id로 DELETE 호출)
          if (listItems.length > 0) {
            console.log('🔍 deleteApprovedQuestions 호출, items:', listItems);
            await deleteApprovedQuestions(listItems);
            console.log('🔍 deleteApprovedQuestions 완료');
          } else {
            console.log('🔍 listItems가 비어있음');
          }
        }

        console.log('🔍 모든 승인 요청 처리 완료');
        toast.success(TOAST_MESSAGES.FINAL_APPROVAL_REQUESTED);
        setApproveSelectionMode(false);
        if (toggleSelectionMode) {
          toggleSelectionMode(false);
        }
        // 데이터 리프레시
        queryClient.invalidateQueries({ queryKey: ['approval-requests', pageType] });
      } catch (error) {
        console.error('🔍 승인 처리 실패:', error);
        toast.error('승인 처리에 실패했습니다.');
      }
    },
    [approvalRequests, pageType, showConfirm, showAlert, queryClient, handleApproveSelect],
  );

  return (
    <Box>
      <PageHeader title={pageConfig.title} />
      <SimpleList<ApprovalRequestItem>
        columns={approvalRequestColumns}
        searchFields={pageConfig.searchFields}
        fetcher={listApi.list}
        isLoading={isLoading}
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
            onConfirm={async (ids: (string | number)[]) => {
              await handleApproveConfirm(ids, toggleSelectionMode);
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
          // done_review, in_review 상태인 행은 선택 불가
          return params.row.status !== 'done_review' && params.row.status !== 'in_review';
        }}
      />
    </Box>
  );
};

export default DataRegApprovalPage;

