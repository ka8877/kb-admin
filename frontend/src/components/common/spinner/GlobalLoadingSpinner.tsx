import type React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import { useLoadingStore } from '@/store/loading';

type GlobalLoadingSpinnerProps = {
  isLoading?: boolean; // prop으로 전달되면 사용, 없으면 store에서 가져옴
};

const GlobalLoadingSpinner: React.FC<GlobalLoadingSpinnerProps> = ({ isLoading: isLoadingProp }) => {
  const isLoadingFromStore = useLoadingStore((s) => s.isLoading);
  const isLoading = isLoadingProp !== undefined ? isLoadingProp : isLoadingFromStore;

  return (
    <Backdrop open={isLoading} sx={{ color: '#fff', zIndex: (t) => t.zIndex.modal + 1 }}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default GlobalLoadingSpinner;
