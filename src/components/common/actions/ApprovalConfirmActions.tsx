import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MediumButton from '@/components/common/button/MediumButton';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { CONFIRM_TITLES, CONFIRM_MESSAGES, ALERT_MESSAGES } from '@/constants/message';

export const ApprovalConfirmActions: React.FC<{
  open: boolean;
  selectedIds: (string | number)[];
  onConfirm: (ids: (string | number)[]) => void;
  onRetract?: (ids: (string | number)[]) => void;
  onCancel?: () => void;
  size?: 'small' | 'medium' | 'large';
}> = ({ open, selectedIds, onConfirm, onRetract, onCancel, size = 'small' }) => {
  const { showConfirm } = useConfirmDialog();
  const { showAlert } = useAlertDialog();

  const handleApproveClick = () => {
    if (!selectedIds || selectedIds.length === 0) {
      showAlert({
        title: CONFIRM_TITLES.FINAL_APPROVAL,
        message: ALERT_MESSAGES.NO_ITEMS_TO_APPROVE,
        severity: 'warning',
      });
      return;
    }
    showConfirm({
      title: CONFIRM_TITLES.FINAL_APPROVAL,
      message: CONFIRM_MESSAGES.FINAL_APPROVAL,
      onConfirm: () => {
        onConfirm(selectedIds);
      },
    });
  };

  const handleRetractClick = () => {
    if (!onRetract) return;

    if (!selectedIds || selectedIds.length === 0) {
      showAlert({
        title: '회수 확인',
        message: ALERT_MESSAGES.NO_ITEMS_SELECTED,
        severity: 'warning',
      });
      return;
    }
    showConfirm({
      title: '회수 확인',
      message: '선택한 항목을 회수하시겠습니까?',
      onConfirm: () => {
        onRetract(selectedIds);
      },
    });
  };

  if (!open) return null;
  return (
    <Paper elevation={1} sx={{ mt: 1, p: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2">선택된 항목: {selectedIds.length}개</Typography>
        <Stack direction="row" spacing={1}>
          <MediumButton
            subType="c"
            variant="contained"
            color="primary"
            onClick={handleApproveClick}
            sx={{ minWidth: '80px' }}
          >
            최종 결재 요청
          </MediumButton>
          {onRetract && (
            <MediumButton
              subType="c"
              variant="contained"
              color="primary"
              onClick={handleRetractClick}
              sx={{ minWidth: '80px' }}
            >
              회수하기
            </MediumButton>
          )}
          <MediumButton
            subType="etc"
            variant="outlined"
            onClick={onCancel}
            sx={{ minWidth: '80px' }}
          >
            취소
          </MediumButton>
        </Stack>
      </Box>
    </Paper>
  );
};
