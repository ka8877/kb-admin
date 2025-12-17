import React from 'react';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';

interface SearchLabelLayoutProps {
  label: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

const SearchLabelLayout: React.FC<SearchLabelLayoutProps> = ({ label, children, sx }) => {
  return (
    <Box display="flex" alignItems="center" gap={1} sx={sx}>
    <Box
      component="span"
      sx={{
        fontSize: '0.875rem',
        fontWeight: 500,
        color: 'text.primary',
        whiteSpace: 'nowrap',
      }}
    >
      {label}:
    </Box>
    
      {children}
    </Box>
  );
};

export default SearchLabelLayout;
