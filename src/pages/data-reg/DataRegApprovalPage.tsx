import { TOAST_MESSAGES } from '@/constants/message';
// Re-saving to fix potential TS errors
import { IN_REVIEW, DONE_REVIEW, APPROVAL_RETURN_URL } from '@/constants/options';
import { approvalRequestKeys } from '@/constants/queryKey';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { GridEventListener } from '@mui/x-data-grid';
import { useQuery } from '@tanstack/react-query';
import type { ApprovalRequestItem } from '@/types/types';
import { approvalRequestColumns } from '@/constants/columns';
import SimpleList from '@/components/common/list/SimpleList';
import PageHeader from '@/components/common/PageHeader';
import TextPopup from '@/components/common/popup/TextPopup';
import { ROUTES } from '@/routes/menu';
import ApprovalListActions from '@/components/common/actions/ApprovalListActions';
import { ApprovalConfirmActions } from '@/components/common/actions/ApprovalConfirmActions';
import { getApi, postApi } from '@/utils/apiUtils';
import { API_ENDPOINTS } from '@/constants/endpoints';
import { useQueryClient } from '@tanstack/react-query';
import { PAGE_TYPE } from '@/constants/options';

import { APPROVAL_SEARCH_FIELDS, APPROVAL_PAGE_STATE } from '@/constants/options';
import { PAGE_TITLES } from '@/constants/pageTitle';
import {
  NO,
  APPROVAL_REQUEST_ID,
  TARGET_TYPE,
  TARGET_ID,
  ITSVC_NO,
  REQUEST_KIND,
  APPROVAL_STATUS,
  PAYLOAD_BEFORE,
  PAYLOAD_AFTER,
  REQUESTER_NAME,
  REQUESTER_DEPT_NAME,
  LAST_ACTOR_NAME,
  REQUESTED_AT,
  LAST_UPDATED_AT,
  IS_RETRACTED,
  IS_APPLIED,
  APPLIED_AT,
} from '@/constants/label';

export const { RECOMMENDED_QUESTIONS, APP_SCHEME } = PAGE_TYPE.DATA_REG;

type ApprovalPageType = typeof RECOMMENDED_QUESTIONS | typeof APP_SCHEME;

const getApprovalPageType = (pathname: string): ApprovalPageType => {
  if (pathname.includes(ROUTES.APP_SCHEME_APPROVAL)) {
    return APP_SCHEME;
  }
  return RECOMMENDED_QUESTIONS;
};

/**
 * Firebase 응답 데이터를 ApprovalRequestItem으로 변환하는 함수
 */
const transformApprovalRequests = (raw: unknown): ApprovalRequestItem[] => {
  if (!raw) return [];

  // 배열 형태 응답: [null, { ... }, { ... }]
  if (Array.isArray(raw)) {
    return raw
      .map((item, index): ApprovalRequestItem | null => {
        if (!item) return null;
        const v = item as Partial<ApprovalRequestItem> & Record<string, unknown>;
        return {
          [NO]: (v[NO] as number) ?? index + 1,
          [APPROVAL_REQUEST_ID]:
            (v[APPROVAL_REQUEST_ID] as string | number) ?? (v.id as string | number) ?? index + 1,
          [TARGET_TYPE]: (v[TARGET_TYPE] as string) ?? '',
          [TARGET_ID]: Number(v[TARGET_ID] ?? 0),
          [ITSVC_NO]: (v[ITSVC_NO] as string | null) ?? null,
          [REQUEST_KIND]: (v[REQUEST_KIND] as string) ?? (v.approval_form as string) ?? '',
          [APPROVAL_STATUS]: (v[APPROVAL_STATUS] as string) ?? (v.status as string) ?? 'request',
          [PAYLOAD_BEFORE]: (v[PAYLOAD_BEFORE] as string | null) ?? null,
          [PAYLOAD_AFTER]: (v[PAYLOAD_AFTER] as string | null) ?? null,
          [REQUESTER_NAME]: (v[REQUESTER_NAME] as string | null) ?? (v.createdBy as string) ?? null,
          [REQUESTER_DEPT_NAME]: (v[REQUESTER_DEPT_NAME] as string | null) ?? null,
          [LAST_ACTOR_NAME]:
            (v[LAST_ACTOR_NAME] as string | null) ?? (v.updatedBy as string) ?? null,
          [REQUESTED_AT]: (v[REQUESTED_AT] as string) ?? (v.createdAt as string) ?? '',
          [LAST_UPDATED_AT]: (v[LAST_UPDATED_AT] as string) ?? (v.updatedAt as string) ?? '',
          [IS_RETRACTED]: Boolean(v[IS_RETRACTED]),
          [IS_APPLIED]: Boolean(v[IS_APPLIED]),
          [APPLIED_AT]: (v[APPLIED_AT] as string | null) ?? null,
        };
      })
      .filter((item): item is ApprovalRequestItem => item !== null);
  }

  // 객체 형태 응답도 지원 (기존 방식)
  if (typeof raw === 'object' && raw !== null) {
    const entries = Object.entries(raw as Record<string, unknown>);

    return entries.map(([key, value], index): ApprovalRequestItem => {
      const v = value as Partial<ApprovalRequestItem> & Record<string, unknown>;
      return {
        [NO]: (v[NO] as number) ?? index + 1,
        [APPROVAL_REQUEST_ID]:
          (v[APPROVAL_REQUEST_ID] as string | number) ?? (v.id as string | number) ?? key,
        [TARGET_TYPE]: (v[TARGET_TYPE] as string) ?? '',
        [TARGET_ID]: Number(v[TARGET_ID] ?? 0),
        [ITSVC_NO]: (v[ITSVC_NO] as string | null) ?? null,
        [REQUEST_KIND]: (v[REQUEST_KIND] as string) ?? (v.approval_form as string) ?? '',
        [APPROVAL_STATUS]: (v[APPROVAL_STATUS] as string) ?? (v.status as string) ?? 'request',
        [PAYLOAD_BEFORE]: (v[PAYLOAD_BEFORE] as string | null) ?? null,
        [PAYLOAD_AFTER]: (v[PAYLOAD_AFTER] as string | null) ?? null,
        [REQUESTER_NAME]: (v[REQUESTER_NAME] as string | null) ?? (v.createdBy as string) ?? null,
        [REQUESTER_DEPT_NAME]: (v[REQUESTER_DEPT_NAME] as string | null) ?? null,
        [LAST_ACTOR_NAME]: (v[LAST_ACTOR_NAME] as string | null) ?? (v.updatedBy as string) ?? null,
        [REQUESTED_AT]: (v[REQUESTED_AT] as string) ?? (v.createdAt as string) ?? '',
        [LAST_UPDATED_AT]: (v[LAST_UPDATED_AT] as string) ?? (v.updatedAt as string) ?? '',
        [IS_RETRACTED]: Boolean(v[IS_RETRACTED]),
        [IS_APPLIED]: Boolean(v[IS_APPLIED]),
        [APPLIED_AT]: (v[APPLIED_AT] as string | null) ?? null,
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
    pageType === APP_SCHEME
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

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [popupTitle, setPopupTitle] = useState('');

  // 경로에 따라 타입 결정
  const pageType = useMemo(() => getApprovalPageType(location.pathname), [location.pathname]);

  // 타입에 따른 설정
  const pageConfig = useMemo(() => {
    if (pageType === APP_SCHEME) {
      return {
        title: PAGE_TITLES.APP_SCHEME_APPROVAL,
        searchFields: APPROVAL_SEARCH_FIELDS,
        defaultReturnRoute: ROUTES.APP_SCHEME,
        approvalDetailRoute: (id: string | number) => ROUTES.APP_SCHEME_APPROVAL_DETAIL(id),
      };
    }
    return {
      title: PAGE_TITLES.RECOMMENDED_QUESTIONS_APPROVAL,
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
        field.type === 'select' && field.field === REQUEST_KIND,
    );
    const statusField = pageConfig.searchFields?.find(
      (field): field is Extract<typeof field, { type: 'select'; field: string }> =>
        field.type === 'select' && field.field === APPROVAL_STATUS,
    );

    const approvalFormOptions = approvalFormField?.options || [];
    const statusOptions = statusField?.options || [];

    return {
      [REQUEST_KIND]: approvalFormOptions.map((opt: { label: string; value: string | number }) => ({
        label: opt.label,
        value: String(opt.value),
      })),
      [APPROVAL_STATUS]: statusOptions.map((opt: { label: string; value: string | number }) => ({
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
    return sessionStorage.getItem(APPROVAL_RETURN_URL);
  }, []);

  const handleBack = useCallback(() => {
    if (returnUrl) {
      sessionStorage.removeItem(APPROVAL_RETURN_URL);
      navigate(returnUrl);
    } else {
      navigate(pageConfig.defaultReturnRoute);
    }
  }, [returnUrl, navigate, pageConfig.defaultReturnRoute]);

  const handleRowClick = useCallback(
    (_params: { id: string | number; row: ApprovalRequestItem }) => {
      const currentApprovalUrl = location.pathname + location.search;
      sessionStorage.setItem(APPROVAL_PAGE_STATE, currentApprovalUrl);

      // const detailUrl = pageConfig.approvalDetailRoute(params.id);
      // navigate(detailUrl);
    },
    [location.pathname, location.search],
  );

  const handleCellClick: GridEventListener<'cellClick'> = (params) => {
    if (params.field === PAYLOAD_BEFORE || params.field === PAYLOAD_AFTER) {
      setPopupTitle(params.colDef.headerName || '상세 정보');
      setPopupContent((params.value as string) || '');
      setPopupOpen(true);
    }
  };

  // 결재 선택 토글 상태 및 핸들러
  const [approveSelectionMode, setApproveSelectionMode] = React.useState(false);
  const handleApproveSelect = useCallback((next: boolean) => {
    setApproveSelectionMode(next);
  }, []);

  const queryClient = useQueryClient();
  // const { showAlert } = useAlertDialog();

  // 결재 확인 처리
  const handleApproveConfirm = useCallback(
    async (selectedIds: (string | number)[], toggleSelectionMode?: (next?: boolean) => void) => {
      try {
        const endpoint =
          pageType === APP_SCHEME
            ? API_ENDPOINTS.APP_SCHEME.APPROVAL_LIST
            : API_ENDPOINTS.RECOMMENDED_QUESTIONS.APPROVAL_LIST;

        await postApi(endpoint, selectedIds, {
          successMessage: TOAST_MESSAGES.FINAL_APPROVAL_REQUESTED,
          errorMessage: TOAST_MESSAGES.FINAL_APPROVAL_PROCESS_FAILED,
        });

        setApproveSelectionMode(false);
        if (toggleSelectionMode) {
          toggleSelectionMode(false);
        }
        queryClient.invalidateQueries({ queryKey: approvalRequestKeys.list(pageType) });
      } catch {
        // toast handled by postApi
      }
    },
    [pageType, queryClient],
  );

  // 회수 확인 처리
  const handleRetractConfirm = useCallback(
    async (selectedIds: (string | number)[], toggleSelectionMode?: (next?: boolean) => void) => {
      try {
        const endpoint =
          pageType === APP_SCHEME
            ? API_ENDPOINTS.APP_SCHEME.APPROVAL_LIST
            : API_ENDPOINTS.RECOMMENDED_QUESTIONS.APPROVAL_LIST;

        await postApi(`${endpoint}/retract`, selectedIds, {
          successMessage: TOAST_MESSAGES.RETRACT_SUCCESS,
          errorMessage: TOAST_MESSAGES.RETRACT_FAILED,
        });

        setApproveSelectionMode(false);
        if (toggleSelectionMode) {
          toggleSelectionMode(false);
        }
        queryClient.invalidateQueries({ queryKey: approvalRequestKeys.list(pageType) });
      } catch {
        // toast handled by postApi
      }
    },
    [pageType, queryClient],
  );

  // 컬럼 필터링 (No, 결재양식, 변경 전 내용, 변경 후 내용, 요청자, 요청일, 처리상태, 처리일)
  const filteredColumns = useMemo(() => {
    const visibleFields = [
      NO,
      REQUEST_KIND,
      PAYLOAD_BEFORE,
      PAYLOAD_AFTER,
      REQUESTER_NAME,
      REQUESTED_AT,
      APPROVAL_STATUS,
      LAST_UPDATED_AT,
    ];

    // visibleFields 순서대로 컬럼 정렬
    return visibleFields
      .map((field) => approvalRequestColumns.find((col) => col.field === field))
      .filter((col): col is (typeof approvalRequestColumns)[number] => !!col)
      .map((col) => {
        if (col.field === LAST_UPDATED_AT) {
          return { ...col, headerName: '처리일' };
        }
        if (col.field === PAYLOAD_BEFORE) {
          return { ...col, headerName: '변경 전 내용' };
        }
        if (col.field === PAYLOAD_AFTER) {
          return { ...col, headerName: '변경 후 내용' };
        }
        return col;
      });
  }, []);

  return (
    <Box>
      <PageHeader title={pageConfig.title} />
      <SimpleList<ApprovalRequestItem>
        columns={filteredColumns}
        searchFields={pageConfig.searchFields}
        fetcher={listApi.list}
        isLoading={isDataLoading}
        selectFields={selectFieldsConfig}
        dateFields={[REQUESTED_AT, LAST_UPDATED_AT]}
        dateFormat="YYYYMMDDHHmmss"
        dateDisplayFormat="dots"
        rowIdGetter={APPROVAL_REQUEST_ID}
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
            onRetract={(ids: (string | number)[]) => {
              handleRetractConfirm(ids, toggleSelectionMode);
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
        onCellClick={handleCellClick}
      />
      <TextPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        title={popupTitle}
        content={popupContent}
      />
    </Box>
  );
};

export default DataRegApprovalPage;
