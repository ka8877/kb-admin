import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import type { AppSchemeItem } from './types';
import { appSchemeColumns } from './components/columns/columns';
import ManagementList from '@/components/common/list/ManagementList';
import PageHeader from '@/components/common/PageHeader';
import { ROUTES } from '@/routes/menu';
import { mockAppSchemes, statusOptions, searchFields } from './data';
import { toast } from 'react-toastify';
import { TOAST_MESSAGES } from '@/constants/message';

const listApi = {
  list: async (): Promise<AppSchemeItem[]> => {
    return Promise.resolve(mockAppSchemes);
  },
};

const AppSchemePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleCreate = useCallback(() => {
    navigate(ROUTES.APP_SCHEME_CREATE);
  }, [navigate]);

  const handleRequestApproval = useCallback(() => {
    const currentUrl = location.pathname + location.search;
    console.log('🔍 AppSchemePage - saving currentUrl to sessionStorage:', currentUrl);
    sessionStorage.setItem('approval_return_url', currentUrl);
    navigate(ROUTES.APP_SCHEME_APPROVAL);
  }, [location.pathname, location.search, navigate]);

  const handleDeleteConfirm = useCallback((ids: (string | number)[]) => {
    console.log('삭제 요청 ids:', ids);
    // 실제 삭제 처리 후 필요 시 재요청
    toast.success(TOAST_MESSAGES.DELETE_SUCCESS);
  }, []);

  const handleRowClick = useCallback(
    (params: { id: string | number; row: AppSchemeItem }) => {
      navigate(ROUTES.APP_SCHEME_DETAIL(params.id));
    },
    [navigate],
  );

  const selectFieldsConfig = {
    status: statusOptions,
  };

  const dateFieldsConfig = ['start_date', 'end_date', 'updatedAt', 'registeredAt'];

  return (
    <Box>
      <PageHeader title="앱스킴 관리" />
      <ManagementList<AppSchemeItem>
        onRowClick={handleRowClick}
        columns={appSchemeColumns}
        fetcher={listApi.list}
        rowIdGetter={'id'}
        onCreate={handleCreate}
        onRequestApproval={handleRequestApproval}
        onDeleteConfirm={handleDeleteConfirm}
        enableStatePreservation={true}
        exportFileName="앱스킴목록"
        selectFields={selectFieldsConfig}
        dateFields={dateFieldsConfig}
        dateFormat="YYYYMMDDHHmmss"
        searchFields={searchFields}
      />
    </Box>
  );
};

export default AppSchemePage;
