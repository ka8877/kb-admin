// frontend/src/pages/data-reg/recommended-questions/RecommendedQuestionsCreatePage.tsx
import React from 'react';
import { Box } from '@mui/material';
import DualTabs from '@/components/common/tabs/DualTabs';
import PageHeader from '@/components/common/PageHeader';
import ApprovalExcelUpload from '@/pages/data-reg/app-scheme/components/approval/ApprovalExcelUpload';
import ApprovalManualForm from '@/pages/data-reg/app-scheme/components/approval/ApprovalManualForm';
import { PAGE_TITLES } from '@/constants/pageTitle';
import { LABELS } from '@/constants/label';

const AppSchemeCreatePage: React.FC = () => {
  return (
    <Box>
      <PageHeader title={PAGE_TITLES.APP_SCHEME_CREATE} />
      <DualTabs
        label1={LABELS.MANUAL_INPUT}
        label2={LABELS.EXCEL_UPLOAD}
        component1={<ApprovalManualForm />}
        component2={
          <>
            <ApprovalExcelUpload />
          </>
        }
        defaultTab={0}
        variant="standard"
      />
    </Box>
  );
};

export default AppSchemeCreatePage;
