import type React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import { useLoadingStore } from '../../../store/loading';

const GlobalLoadingSpinner: React.FC = () => {
  const isLoading = useLoadingStore((s) => s.isLoading);

  return (
    <Backdrop open={isLoading} sx={{ color: '#fff', zIndex: (t) => t.zIndex.modal + 1 }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default GlobalLoadingSpinner;
