import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export type ListActionsProps = {
  selectionMode: boolean;
  onToggleSelectionMode: (next: boolean) => void;
  selectedIds?: (string | number)[];
  onCreate?: () => void;
  onRequestApproval?: () => void;
  onDeleteConfirm: (ids: (string | number)[]) => void;
  onDownloadAll?: () => void;
  size?: 'small' | 'medium';
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
        <Button variant="contained" size={size} onClick={onCreate}>
          신규 등록
        </Button>

        <Button variant="outlined" size={size} onClick={handleToggleSelection}>
          {selectionMode ? '삭제 취소' : '선택 삭제'}
        </Button>

        <Button variant="contained" size={size} onClick={onRequestApproval}>
          결재요청 대기함
        </Button>

        <Button variant="outlined" size={size} onClick={onDownloadAll}>
          전체목록 xlsx 다운로드
        </Button>
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
  size?: 'small' | 'medium';
}> = ({ open, selectedIds, onConfirm, onCancel, size = 'small' }) => {
  if (!open) return null;
  return (
    <Paper elevation={1} sx={{ mt: 1, p: 1 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2">
          선택된 항목: {selectedIds.length}개
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" color="error" size={size} onClick={() => onConfirm(selectedIds)}>
            삭제 확인
          </Button>
          <Button variant="outlined" size={size} onClick={onCancel}>
            취소
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default ListActions;