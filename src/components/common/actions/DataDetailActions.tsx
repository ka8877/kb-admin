import React from 'react';
import Stack from '@mui/material/Stack';
import MediumButton from '../button/MediumButton';

export type DataDetailActionsProps = {
  onBack?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showEdit?: boolean;
  showDelete?: boolean;
  isLocked?: boolean;
};

const DataDetailActions: React.FC<DataDetailActionsProps> = ({
  onBack,
  onEdit,
  onDelete,
  showEdit = true,
  showDelete = true,
  isLocked = false,
}) => {
  return (
    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
      <MediumButton subType="etc" variant="outlined" onClick={onBack}>
        목록으로
      </MediumButton>

      {showEdit && onEdit && !isLocked && (
        <MediumButton subType="u" variant="contained" onClick={onEdit}>
          수정
        </MediumButton>
      )}

      {showDelete && onDelete && !isLocked && (
        <MediumButton subType="d" variant="outlined" color="error" onClick={onDelete}>
          삭제
        </MediumButton>
      )}
    </Stack>
  );
};

export default DataDetailActions;
