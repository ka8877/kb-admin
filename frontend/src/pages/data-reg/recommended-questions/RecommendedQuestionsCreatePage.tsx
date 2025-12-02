// frontend/src/pages/data-reg/recommended-questions/RecommendedQuestionsCreatePage.tsx
import React from 'react';
import { Box } from '@mui/material';
import DualTabs from '@/components/common/tabs/DualTabs';
import PageHeader from '@/components/common/PageHeader';
import ApprovalExcelUpload from '@/pages/data-reg/recommended-questions/components/approval/ApprovalExcelUpload';
import ApprovalManualForm from '@/pages/data-reg/recommended-questions/components/approval/ApprovalManualForm';

const RecommendedQuestionsCreatePage: React.FC = () => {
  return (
    <Box>
      <PageHeader title="추천질문 등록" />
      <DualTabs
        label1="직접 입력하기"
        label2="엑셀파일로 일괄등록"
        component1={<ApprovalManualForm />}
        component2={<ApprovalExcelUpload />}
        defaultTab={0}
        variant="standard"
      />
    </Box>
  );
};

export default RecommendedQuestionsCreatePage;
