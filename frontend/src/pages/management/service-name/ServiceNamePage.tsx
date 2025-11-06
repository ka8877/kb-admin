import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack } from '@mui/material';
import EditActionButton from '../../../components/common/actions/EditActionButton';
import EditableList from '../../../components/common/list/EditableList';

import type { RowItem } from './types';
import { listColumns } from './components/columns';
import { ROUTES } from '../../../routes/menu';
import { serviceNameMockDb } from '../../../mocks/serviceNameDb';

const ServiceNamePage: React.FC = () => {
  const [items, setItems] = useState<RowItem[]>([]);
  // editMode removed: editing happens on a separate page
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const data = await serviceNameMockDb.listAll();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleGoEditPage = () => navigate(ROUTES.SERVICE_NAME_EDIT);

  return (
    <Box>
      <EditableList
        columns={listColumns}
        fetcher={async () => await serviceNameMockDb.listAll()}
        rowIdGetter={(r) => (r as any).service_cd}
        defaultPageSize={25}
        onEdit={handleGoEditPage}
        isEditMode={false}
      />
    </Box>
  );
};

export default ServiceNamePage;
