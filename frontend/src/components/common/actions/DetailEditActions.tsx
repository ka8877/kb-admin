// frontend/src/components/common/actions/DetailEditActions.tsx
import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

export type DetailEditActionsProps = {
  open: boolean;
  onSave: () => void;
  onCancel: () => void;
  size?: 'small' | 'medium';
  isLoading?: boolean;
  showDelete?: boolean; // 삭제 버튼 표시 여부
  selectedCount?: number; // 선택된 항목 수
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
  onDelete,
}) => {
  if (!open) return null;

  return (
    <Paper elevation={1} sx={{ mt: 2, p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="primary" fontWeight={600}>
          수정 모드
        </Typography>
        <Stack direction="row" spacing={1}>
          {showDelete && selectedCount > 0 && onDelete && (
            <Button
              variant="outlined"
              color="error"
              size={size}
              onClick={onDelete}
              disabled={isLoading}
            >
              삭제 ({selectedCount})
            </Button>
          )}
          <Button variant="contained" size={size} onClick={onSave} disabled={isLoading}>
            저장
          </Button>
          <Button variant="outlined" size={size} onClick={onCancel} disabled={isLoading}>
            취소
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default DetailEditActions;
