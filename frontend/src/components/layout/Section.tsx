import React from 'react';
import { Box, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

export type SectionProps = {
  title?: string;
  variant?: 'default' | 'primary'; // default: 흰색, primary: 파란색
  children: React.ReactNode;
  sx?: SxProps<Theme>;
};

const Section: React.FC<SectionProps> = ({ title, variant = 'default', children, sx }) => {
  const backgroundColor = variant === 'primary' ? '#EBF5FF' : '#FFFFFF';
  const borderColor = '#E0E0E0';

  return (
    <Box
      sx={{
        border: `1px solid ${borderColor}`,
        borderRadius: 0.75,
        backgroundColor,
        p: 3,
        mb: 2,
        ...sx,
      }}
    >
      {title && (
        <Typography
          variant="h6"
          sx={{
            fontSize: '1.125rem',
            fontWeight: 600,
            mb: 2,
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>
      )}
      {children}
    </Box>
  );
};

export default Section;
