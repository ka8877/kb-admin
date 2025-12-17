import type React from 'react';
import { Box, CircularProgress } from '@mui/material';

const InlineSpinner: React.FC = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
    <CircularProgress size={28} />
  </Box>
);

export default InlineSpinner;
