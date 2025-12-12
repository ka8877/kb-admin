import React from 'react';
import { SxProps } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MediumButton from '../button/MediumButton';

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
    <MediumButton
      subType="c"
      startIcon={startIcon ?? <AddIcon />}
      size={size}
      variant={variant}
      color={color}
      onClick={onClick}
      sx={sx}
    >
      {children}
    </MediumButton>
  );
};

export default AddDataButton;
