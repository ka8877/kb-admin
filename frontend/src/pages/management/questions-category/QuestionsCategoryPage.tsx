import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import EditableList from '@/components/common/list/EditableList';
import { ROUTES } from '@/routes/menu';
import { questionsCategoryMockDb } from '@/mocks/questionsCategoryDb';
import { listColumns } from './components/columns';
import type { RowItem } from './types';

const QuestionsCategoryPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoEditPage = () => navigate(`${ROUTES.QUESTIONS_CATEGORY}/edit`);

  return (
    <Box>
      <PageHeader title="질문 카테고리 관리" />
      <EditableList
        columns={listColumns}
        fetcher={async () => await questionsCategoryMockDb.listAll()}
        rowIdGetter={(r: RowItem) => r.service_cd}
        defaultPageSize={25}
        pageSizeOptions={[10, 25, 50, 100]}
        onEdit={handleGoEditPage}
        isEditMode={false}
      />
    </Box>
  );
};

export default QuestionsCategoryPage;
