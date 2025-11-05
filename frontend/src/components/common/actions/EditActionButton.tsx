import React from 'react';
import Button from '@mui/material/Button';

export type EditActionButtonProps = {
  onClick: () => void;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'text' | 'outlined' | 'contained';
};

const EditActionButton: React.FC<EditActionButtonProps> = ({
  onClick,
  label = '편집',
  size = 'small',
  variant = 'contained',
}) => {
  return (
    <Button variant={variant} size={size} onClick={onClick}>
      {label}
    </Button>
  );
};

export default EditActionButton;
