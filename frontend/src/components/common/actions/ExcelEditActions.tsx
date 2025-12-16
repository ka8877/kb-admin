// frontend/src/components/common/actions/ExcelEditActions.tsx
import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import MediumButton from '../button/MediumButton';
import { useConfirmDialog } from '@/hooks/useConfirmDialog';
import { CONFIRM_TITLES, getDeleteConfirmMessage } from '@/constants/message';

export type ExcelEditActionsProps = {
  open: boolean;
  selectedCount?: number; // 선택된 항목 수
  selectedRowNumbers?: number[]; // 선택된 행 번호 배열
  onDelete?: () => void; // 삭제 버튼 클릭 핸들러
  onAddRow?: () => void; // 행 추가 버튼 클릭 핸들러
  size?: 'small' | 'medium';
};

const ExcelEditActions: React.FC<ExcelEditActionsProps> = ({
  open,
  selectedCount = 0,
  selectedRowNumbers = [],
  onDelete,
  onAddRow,
  size = 'small',
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
          편집 모드
        </Typography>
        <Stack direction="row" spacing={1}>
          {onAddRow && (
            <MediumButton variant="contained" color="primary" onClick={onAddRow} subType="c">
              행 추가
            </MediumButton>
          )}
          {selectedCount > 0 && onDelete && (
            <MediumButton variant="outlined" color="error" onClick={handleDeleteClick} subType="d">
              삭제 ({selectedCount})
            </MediumButton>
          )}
        </Stack>
      </Box>
    </Paper>
  );
};

export default ExcelEditActions;
