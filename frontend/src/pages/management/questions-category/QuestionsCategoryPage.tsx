import React from 'react';
import { useNavigate } from 'react-router-dom';
import EditableList from '../../../components/common/list/EditableList';

import type { RowItem } from './types';
import { listColumns } from './components/columns';
import { ROUTES } from '../../../routes/menu';
import { questionsCategoryMockDb } from '../../../mocks/questionsCategoryDb';

const QuestionsCategoryPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoEditPage = () => navigate(`${ROUTES.QUESTIONS_CATEGORY}/edit`);

  return (
    <EditableList
      columns={listColumns}
      fetcher={async () => await questionsCategoryMockDb.listAll()}
      rowIdGetter={(r) => (r as any).service_cd}
      defaultPageSize={25}
      onEdit={handleGoEditPage}
      isEditMode={false}
    />
  );
};

export default QuestionsCategoryPage;
