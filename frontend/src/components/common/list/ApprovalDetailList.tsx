import React, { useCallback } from 'react';
import { Box } from '@mui/material';
import type { GridValidRowModel, GridColDef } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import DetailNavigationActions from '../actions/DetailNavigationActions';
import MediumButton from '../button/MediumButton';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { CONFIRM_TITLES, CONFIRM_MESSAGES } from '@/constants/message';
import GlobalLoadingSpinner from '../spinner/GlobalLoadingSpinner';

export type ApprovalDetailListProps<T extends GridValidRowModel = GridValidRowModel> = {
  /** 그리드에 표시할 데이터 */
  rows: T[];
  /** 그리드 컬럼 정의 */
  columns: GridColDef<T>[];
  /** 행 ID를 반환하는 함수 */
  getRowId: (row: T) => string | number;
  /** 목록으로 돌아가기 핸들러 */
  onBack?: () => void;
  /** 최종 결재 요청 핸들러 */
  onFinalApproval?: () => Promise<void> | void;
  /** 최종 결재 버튼 표시 여부 */
  showFinalApprovalButton?: boolean;
  /** 최종 결재 버튼 라벨 */
  finalApprovalButtonLabel?: string;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 에러 상태 */
  isError?: boolean;
  /** 그리드 높이 (기본: 600) */
  gridHeight?: number;
};

/**
 * 승인 상세 목록 조회 컴포넌트
 * 조회용 DataGrid와 최종 결재 버튼을 포함
 */
const ApprovalDetailList = <T extends GridValidRowModel = GridValidRowModel>({
  rows,
  columns,
  getRowId,
  onBack,
  onFinalApproval,
  showFinalApprovalButton = false,
  finalApprovalButtonLabel = '최종 결재 요청',
  isLoading = false,
  isError = false,
  gridHeight = 600,
}: ApprovalDetailListProps<T>) => {
  if (isLoading) {
    return <GlobalLoadingSpinner isLoading={true} />;
  }

  const { showConfirm } = useConfirmDialog();

  const handleFinalApprovalClick = useCallback(() => {
    if (!onFinalApproval) return;

    showConfirm({
      title: CONFIRM_TITLES.APPROVAL_REQUEST,
      message: CONFIRM_MESSAGES.APPROVAL_REQUEST,
      onConfirm: () => {
        const executeApproval = async () => {
          await onFinalApproval();
        };
        executeApproval();
      },
    });
  }, [onFinalApproval, showConfirm]);

  // 에러가 발생했거나 로딩 중이면 버튼을 표시하지 않음
  const shouldShowButton = showFinalApprovalButton && onFinalApproval && !isError;

  return (
    <>
      {/* 목록으로 버튼 */}
      {onBack && <DetailNavigationActions onBack={onBack} />}

      {/* 조회용 그리드 */}
      <Box sx={{ height: gridHeight, width: '100%', mb: 2 }}>
        <DataGrid<T>
          rows={rows}
          columns={columns}
          getRowId={getRowId}
          disableRowSelectionOnClick
          density="standard"
          rowHeight={46}
          columnHeaderHeight={46}
          autoHeight={false}
          loading={isLoading}
          sx={{
            '& .MuiDataGrid-footerContainer': {
              minHeight: '42px',
              maxHeight: '42px',
            },
          }}
        />
      </Box>

      {/* 최종 결재 버튼 (그리드 오른쪽 하단) */}
      {shouldShowButton && (
        <Box display="flex" justifyContent="flex-end">
          <MediumButton variant="contained" onClick={handleFinalApprovalClick} size="medium">
            {finalApprovalButtonLabel}
          </MediumButton>
        </Box>
      )}
    </>
  );
};

export default ApprovalDetailList;
