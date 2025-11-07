import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import EditableList from '../../../components/common/list/EditableList';

import type { RowItem } from './types';
import { listColumns } from './components/columns';
import { ROUTES } from '../../../routes/menu';
import { ageGroupMockDb } from '../../../mocks/ageGroupDb';

const AgeGroupPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoEditPage = () => navigate(`${ROUTES.AGE_GROUP}/edit`);

  return (
    <Box>
      <PageHeader title="연령대 카테고리 관리" />
      <EditableList
        columns={listColumns}
        fetcher={async () => await ageGroupMockDb.listAll()}
        rowIdGetter={(r) => (r as any).service_cd}
        defaultPageSize={25}
        onEdit={handleGoEditPage}
        isEditMode={false}
      />
    </Box>
  );
};

export default AgeGroupPage;
