// frontend/src/components/common/actions/CreateDataActions.tsx
import React from 'react';
import { Stack } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import MediumButton from '../button/MediumButton';

export type CreateDataActionsProps = {
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  saveVariant?: 'text' | 'outlined' | 'contained';
  cancelVariant?: 'text' | 'outlined' | 'contained';
  direction?: 'row' | 'column';
  spacing?: number;
  sx?: SxProps<Theme>;
};

const CreateDataActions: React.FC<CreateDataActionsProps> = ({
  onSave,
  onCancel,
  saveLabel = '저장',
  cancelLabel = '취소',
  size = 'medium',
  isLoading = false,
  disabled = false,
  saveVariant = 'contained',
  cancelVariant = 'outlined',
  direction = 'row',
  spacing = 2,
  sx,
}) => {
  return (
    <Stack direction={direction} spacing={spacing} sx={sx ?? { mt: 3 }}>
      <MediumButton variant={saveVariant} onClick={onSave} disabled={disabled || isLoading}>
        {saveLabel}
      </MediumButton>
      <MediumButton variant={cancelVariant} onClick={onCancel} disabled={isLoading}>
        {cancelLabel}
      </MediumButton>
    </Stack>
  );
};

export default CreateDataActions;
