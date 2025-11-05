// frontend/src/components/common/actions/CreateDataActions.tsx
import React from 'react';
import { Button, Stack } from '@mui/material';

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
}) => {
  return (
    <Stack direction={direction} spacing={spacing} sx={{ mt: 3 }}>
      <Button variant={saveVariant} size={size} onClick={onSave} disabled={disabled || isLoading}>
        {saveLabel}
      </Button>
      <Button variant={cancelVariant} size={size} onClick={onCancel} disabled={isLoading}>
        {cancelLabel}
      </Button>
    </Stack>
  );
};

export default CreateDataActions;
