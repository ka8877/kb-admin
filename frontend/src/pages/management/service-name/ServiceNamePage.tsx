import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, TextField, Typography } from '@mui/material';
import EditActionButton from '../../../components/common/actions/EditActionButton';
import { DataGrid } from '@mui/x-data-grid';

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
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <EditActionButton onClick={handleGoEditPage} />
      </Stack>

      <Box sx={{ height: 480, width: '100%' }}>
        <DataGrid
          rows={items}
          columns={listColumns}
          getRowId={(row: RowItem) => row.service_cd}
          pageSizeOptions={[25, 50, 100]}
          initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
          disableRowSelectionOnClick
          // make the grid read-only on this page (no cell editing / clicks)
          isCellEditable={() => false}
          disableColumnMenu
          loading={loading}
          // row click navigation intentionally disabled for read-only list
        />
      </Box>
    </Box>
  );
};

export default ServiceNamePage;
