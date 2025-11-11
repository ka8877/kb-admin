// frontend/src/components/common/actions/DetailEditActions.tsx
import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import MediumButton from '../button/MediumButton';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { CONFIRM_TITLES, getDeleteConfirmMessage } from '@/constants/message';

export type DetailEditActionsProps = {
  open: boolean;
  onSave: () => void;
  onCancel: () => void;
  size?: 'small' | 'medium';
  isLoading?: boolean;
  showDelete?: boolean; // 삭제 버튼 표시 여부
  selectedCount?: number; // 선택된 항목 수
  selectedRowNumbers?: number[]; // 선택된 행 번호 배열
  onDelete?: () => void; // 삭제 버튼 클릭 핸들러
};

const DetailEditActions: React.FC<DetailEditActionsProps> = ({
  open,
  onSave,
  onCancel,
  size = 'small',
  isLoading = false,
  showDelete = false,
  selectedCount = 0,
  selectedRowNumbers = [],
  onDelete,
}) => {
  const { showConfirm } = useConfirmDialog();

  const handleDeleteClick = () => {
    const message =
      selectedRowNumbers.length > 0
        ? getDeleteConfirmMessage(selectedRowNumbers)
        : `${selectedCount}개의 데이터를 삭제하시겠습니까?`;

    showConfirm({
      title: CONFIRM_TITLES.DELETE,
      message,
      onConfirm: () => {
        if (onDelete) {
          onDelete();
        }
      },
    });
  };

  if (!open) return null;

  return (
    <Paper elevation={1} sx={{ mt: 2, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="primary" fontWeight={600}>
          수정 모드
        </Typography>
        <Stack direction="row" spacing={1}>
          {showDelete && selectedCount > 0 && onDelete && (
            <MediumButton
              variant="outlined"
              color="error"
              onClick={handleDeleteClick}
              disabled={isLoading}
            >
              삭제 ({selectedCount})
            </MediumButton>
          )}
          <MediumButton variant="contained" onClick={onSave} disabled={isLoading}>
            저장
          </MediumButton>
          <MediumButton variant="outlined" onClick={onCancel} disabled={isLoading}>
            취소
          </MediumButton>
        </Stack>
      </Box>
    </Paper>
  );
};

export default DetailEditActions;
