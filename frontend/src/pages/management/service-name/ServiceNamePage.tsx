import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import EditableList from '@/components/common/list/EditableList';
import { ROUTES } from '@/routes/menu';
import { serviceNameMockDb } from '@/mocks/serviceNameDb';
import { listColumns } from './components/columns';
import type { RowItem } from './types';

const ServiceNamePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoEditPage = () => navigate(ROUTES.SERVICE_NAME_EDIT);

  return (
    <Box>
      <PageHeader title="서비스명 카테고리 관리" />
      <EditableList
        columns={listColumns}
        fetcher={async () => await serviceNameMockDb.listAll()}
        rowIdGetter={(r: RowItem) => r.service_cd}
        defaultPageSize={25}
        pageSizeOptions={[10, 25, 50, 100]}
        onEdit={handleGoEditPage}
        isEditMode={false}
      />
    </Box>
  );
};

export default ServiceNamePage;
