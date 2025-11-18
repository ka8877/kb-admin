import React from 'react';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';

interface AdvancedSearchLayoutProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

const AdvancedSearchLayout: React.FC<AdvancedSearchLayoutProps> = ({ children, sx }) => {
  return (
    <Box
      sx={{
        background: '#fff',
        border: '1.5px solid #E3E8EF',
        borderRadius: '12px',
        boxShadow: '0 2px 8px 0 rgba(16, 30, 54, 0.04)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default AdvancedSearchLayout;
