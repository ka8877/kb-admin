// frontend/src/components/common/actions/DetailNavigationActions.tsx
import React from 'react';
import Stack from '@mui/material/Stack';
import MediumButton from '../button/MediumButton';

export type DetailNavigationActionsProps = {
  onBack?: () => void; // 목록으로 버튼
  onEdit?: () => void; // 편집 버튼
  backLabel?: string;
  editLabel?: string;
  size?: 'small' | 'medium' | 'large';
  spacing?: number;
};

const DetailNavigationActions: React.FC<DetailNavigationActionsProps> = ({
  onBack,
  onEdit,
  backLabel = '목록으로',
  editLabel = '편집',
  size = 'medium',
  spacing = 1,
}) => {
  // 버튼이 하나도 없으면 렌더링하지 않음
  if (!onBack && !onEdit) {
    return null;
  }

  return (
    <Stack direction="row" spacing={spacing} sx={{ mb: 2 }}>
      {onBack && (
        <MediumButton variant="outlined" onClick={onBack} subType="etc">
          {backLabel}
        </MediumButton>
      )}
      {onEdit && (
        <MediumButton variant="contained" onClick={onEdit} subType="u">
          {editLabel}
        </MediumButton>
      )}
    </Stack>
  );
};

export default DetailNavigationActions;
