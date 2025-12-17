import React from 'react';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';

interface AdvancedSearchLayoutProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

const AdvancedSearchLayout: React.FC<AdvancedSearchLayoutProps> = ({ children, sx }) => {
  return <Box>{children}</Box>;
};

export default AdvancedSearchLayout;
