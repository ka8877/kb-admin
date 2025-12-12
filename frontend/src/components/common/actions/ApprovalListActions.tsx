// frontend/src/components/common/actions/DetailNavigationActions.tsx
import React from 'react';
import Stack from '@mui/material/Stack';
import MediumButton from '@/components/common/button/MediumButton';

export type ApprovalListActionsProps = {
  onBack?: () => void; // 목록으로 버튼
  onEdit?: () => void; // 편집 버튼
  onApproveSelect?: () => void; // 결재 선택 토글 버튼
  backLabel?: string;
  editLabel?: string;
  approveSelectLabel?: string;
  approveSelectActive?: boolean;
  size?: 'small' | 'medium' | 'large';
  spacing?: number;
};

const ApprovalListActions: React.FC<ApprovalListActionsProps> = ({
  onBack,
  onEdit,
  onApproveSelect,
  backLabel = '목록으로',
  editLabel = '편집',
  approveSelectLabel = '결재 선택',
  approveSelectActive = false,
  size = 'medium',
  spacing = 1,
}) => {
  // 버튼이 하나도 없으면 렌더링하지 않음
  if (!onBack && !onEdit && !onApproveSelect) {
    return null;
  }

  return (
    <Stack direction="row" spacing={spacing} sx={{ mt: 1, mb: 1 }}>
      {onBack && (
        <MediumButton subType="etc" variant="outlined" onClick={onBack}>
          {backLabel}
        </MediumButton>
      )}
      {onEdit && (
        <MediumButton subType="u" variant="contained" onClick={onEdit}>
          {editLabel}
        </MediumButton>
      )}
      {onApproveSelect && (
        <MediumButton subType="u" variant="contained" onClick={onApproveSelect}>
          {approveSelectLabel}
        </MediumButton>
      )}
    </Stack>
  );
};

export default ApprovalListActions;
