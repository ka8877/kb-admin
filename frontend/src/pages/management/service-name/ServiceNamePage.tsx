import React from 'react';
import { useNavigate } from 'react-router-dom';
import EditableList from '../../../components/common/list/EditableList';

import type { RowItem } from './types';
import { listColumns } from './components/columns';
import { ROUTES } from '../../../routes/menu';
import { serviceNameMockDb } from '../../../mocks/serviceNameDb';

const ServiceNamePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoEditPage = () => navigate(ROUTES.SERVICE_NAME_EDIT);

  return (
    <EditableList
      columns={listColumns}
      fetcher={async () => await serviceNameMockDb.listAll()}
      rowIdGetter={(r) => (r as any).service_cd}
      defaultPageSize={25}
      onEdit={handleGoEditPage}
      isEditMode={false}
    />
  );
};

export default ServiceNamePage;
