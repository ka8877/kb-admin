import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import type { RowItem } from './types';
import { listColumns } from './components/columns';
import EditableList from '@/components/common/list/EditableList';
import PageHeader from '@/components/common/PageHeader';
import { ROUTES } from '@/routes/menu';
import { commonCodeMockDb } from '@/mocks/commonCodeDb';

const listApi = {
  list: async (): Promise<RowItem[]> => {
    return await commonCodeMockDb.listAll();
  },
};

const CommonCodePage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoEditPage = useCallback(() => {
    navigate(ROUTES.COMMON_CODE_EDIT);
  }, [navigate]);

  return (
    <Box>
      <PageHeader title="공통 코드 관리" />
      <EditableList<RowItem>
        columns={listColumns}
        fetcher={listApi.list}
        rowIdGetter={(r: RowItem) => r.service_cd}
        defaultPageSize={25}
        pageSizeOptions={[10, 25, 50, 100]}
        onEdit={handleGoEditPage}
        isEditMode={false}
      />
    </Box>
  );
};

export default CommonCodePage;
