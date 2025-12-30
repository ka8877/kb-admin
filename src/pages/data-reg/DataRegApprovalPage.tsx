// Re-saving to fix potential TS errors
import { IN_REVIEW, DONE_REVIEW, APPROVAL_RETURN_URL } from '@/constants/options';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { GridEventListener } from '@mui/x-data-grid';
import type { ApprovalRequestItem } from '@/types/types';
import { approvalRequestColumns } from '@/constants/columns';
import SimpleList from '@/components/common/list/SimpleList';
import PageHeader from '@/components/common/PageHeader';
import TextPopup from '@/components/common/popup/TextPopup';
import ApprovalListActions from '@/components/common/actions/ApprovalListActions';
import { ApprovalConfirmActions } from '@/components/common/actions/ApprovalConfirmActions';
import { parseSearchParams } from '@/utils/apiUtils';
import { useListState } from '@/hooks/useListState';

import { APPROVAL_PAGE_STATE } from '@/constants/options';
import {
  NO,
  APPROVAL_REQUEST_ID,
  REQUEST_KIND,
  APPROVAL_STATUS,
  PAYLOAD_BEFORE,
  PAYLOAD_AFTER,
  REQUESTER_NAME,
  REQUESTED_AT,
  LAST_UPDATED_AT,
} from '@/constants/label';
import {
  useApprovalRequests,
  useApproveRequests,
  useRetractRequests,
} from '@/pages/data-reg/hooks';
import { getApprovalConfig } from '@/pages/data-reg/config';

const DataRegApprovalPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { listState } = useListState(20);

  const searchParams = useMemo(
    () => parseSearchParams(listState.searchFieldsState),
    [listState.searchFieldsState],
  );

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [popupTitle, setPopupTitle] = useState('');

  // 경로에 따라 설정 가져오기
  const pageConfig = useMemo(() => getApprovalConfig(location.pathname), [location.pathname]);
  const pageType = pageConfig.pageType;

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
  } = useApprovalRequests(pageType, searchParams);

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

  const approveMutation = useApproveRequests(pageType);
  const retractMutation = useRetractRequests(pageType);

  // 결재 확인 처리
  const handleApproveConfirm = useCallback(
    async (selectedIds: (string | number)[], toggleSelectionMode?: (next?: boolean) => void) => {
      try {
        await approveMutation.mutateAsync(selectedIds);

        setApproveSelectionMode(false);
        if (toggleSelectionMode) {
          toggleSelectionMode(false);
        }
      } catch {
        // toast handled by postApi
      }
    },
    [approveMutation],
  );

  // 회수 확인 처리
  const handleRetractConfirm = useCallback(
    async (selectedIds: (string | number)[], toggleSelectionMode?: (next?: boolean) => void) => {
      try {
        await retractMutation.mutateAsync(selectedIds);

        setApproveSelectionMode(false);
        if (toggleSelectionMode) {
          toggleSelectionMode(false);
        }
      } catch {
        // toast handled by postApi
      }
    },
    [retractMutation],
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
