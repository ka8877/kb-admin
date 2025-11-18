import React from 'react';
import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';

interface SearchSectionProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

const SearchSection: React.FC<SearchSectionProps> = ({ children, sx }) => {
  return (
    <Box
      sx={{
        bgcolor: '#F8F9FA',
        border: '1px solid #E0E0E0',
        borderRadius: '8px',
        p: 2,
        mb: 2,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default SearchSection;
