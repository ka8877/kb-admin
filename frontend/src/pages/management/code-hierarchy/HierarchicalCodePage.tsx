import React from 'react';
import { Box } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import HierarchicalCodeManager from './components/HierarchicalCodeManager';

const HierarchicalCodePage: React.FC = () => {
  return (
    <Box>
      <PageHeader title="계층형 코드 관리" />
      <HierarchicalCodeManager />
    </Box>
  );
};

export default HierarchicalCodePage;
