import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import MediumButton from '../button/MediumButton';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { useAlertDialog } from '../../../hooks/useAlertDialog';
import { CONFIRM_TITLES, CONFIRM_MESSAGES, ALERT_MESSAGES } from '../../../constants/message';

export type ListActionsProps = {
  selectionMode: boolean;
  onToggleSelectionMode: (next: boolean) => void;
  selectedIds?: (string | number)[];
  onCreate?: () => void;
  onRequestApproval?: () => void;
  onDeleteConfirm: (ids: (string | number)[]) => void;
  onDownloadAll?: () => void;
  size?: 'small' | 'medium' | 'large';
};

const ListActions: React.FC<ListActionsProps> = ({
  selectionMode,
  onToggleSelectionMode,
  selectedIds = [],
  onCreate,
  onRequestApproval,
  onDeleteConfirm,
  onDownloadAll,
  size = 'small',
}) => {
  const handleToggleSelection = () => {
    onToggleSelectionMode(!selectionMode);
  };

  const handleConfirmDelete = () => {
    onDeleteConfirm(selectedIds);
  };

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} mt={1}>
      <Stack direction="row" spacing={1}>
        <MediumButton variant="contained" onClick={onCreate}>
          신규 등록
        </MediumButton>

        <MediumButton variant="outlined" onClick={handleToggleSelection}>
          {selectionMode ? '삭제 취소' : '선택 삭제'}
        </MediumButton>

        <MediumButton variant="contained" onClick={onRequestApproval}>
          결재요청 대기함
        </MediumButton>

        <MediumButton variant="outlined" onClick={onDownloadAll}>
          전체목록 xlsx 다운로드
        </MediumButton>
      </Stack>

      {/* 간단한 상태 안내 */}
      <Typography variant="body2" color="textSecondary">
        {selectionMode ? `선택 : ${selectedIds.length}개 선택` : ''}
      </Typography>
    </Box>
  );
};

export const DeleteConfirmBar: React.FC<{
  open: boolean;
  selectedIds: (string | number)[];
  onConfirm: (ids: (string | number)[]) => void;
  onCancel?: () => void;
  size?: 'small' | 'medium' | 'large';
}> = ({ open, selectedIds, onConfirm, onCancel, size = 'small' }) => {
  const { showConfirm } = useConfirmDialog();
  const { showAlert } = useAlertDialog();

  const handleDeleteClick = () => {
    // 선택된 항목이 없는 경우 알림 표시
    if (!selectedIds || selectedIds.length === 0) {
      showAlert({
        title: '알림',
        message: ALERT_MESSAGES.NO_ITEMS_TO_DELETE,
        severity: 'warning',
      });
      return;
    }

    // 선택된 항목이 있는 경우 확인 다이얼로그 표시
    showConfirm({
      title: CONFIRM_TITLES.DELETE,
      message: CONFIRM_MESSAGES.DELETE,
      onConfirm: () => {
        onConfirm(selectedIds);
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
            variant="contained"
            color="error"
            onClick={handleDeleteClick}
            sx={{ minWidth: '80px' }}
          >
            삭제
          </MediumButton>
          <MediumButton variant="outlined" onClick={onCancel} sx={{ minWidth: '80px' }}>
            취소
          </MediumButton>
        </Stack>
      </Box>
    </Paper>
  );
};

export default ListActions;
