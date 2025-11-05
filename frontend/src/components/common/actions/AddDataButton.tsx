import React from 'react';
import { Button, SxProps } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

type Props = {
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'text' | 'outlined' | 'contained';
  color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  startIcon?: React.ReactNode;
  children?: React.ReactNode;
  sx?: SxProps;
};

const AddDataButton: React.FC<Props> = ({
  onClick,
  size = 'small',
  variant = 'contained',
  color = 'success',
  startIcon,
  children,
  sx,
}) => {
  return (
    <Button
      startIcon={startIcon ?? <AddIcon />}
      size={size}
      variant={variant}
      color={color}
      onClick={onClick}
      sx={sx}
    >
      {children}
    </Button>
  );
};

export default AddDataButton;
