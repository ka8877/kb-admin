import React from 'react';
import Button from '@mui/material/Button';
import type { ButtonProps } from '@mui/material/Button';

export type MediumButtonProps = ButtonProps & {
  // 필요시 추가 props
};

const MediumButton: React.FC<MediumButtonProps> = ({ children, sx, ...props }) => {
  const mediumButtonStyles = {
    fontSize: '0.875rem',
    padding: '6px 12px',
    minWidth: '90px',
    ...sx, // 기존 sx를 덮어쓸 수 있도록
  };

  return (
    <Button sx={mediumButtonStyles} {...props}>
      {children}
    </Button>
  );
};

export default MediumButton;
