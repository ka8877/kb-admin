import React, { useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import type { AppSchemeItem } from '@/pages/data-reg/app-scheme/types';
import { appSchemeColumns } from '@/pages/data-reg/app-scheme/components/columns/columns';
import ManagementList from '@/components/common/list/ManagementList';
import PageHeader from '@/components/common/PageHeader';
import { ROUTES } from '@/routes/menu';
import { APP_SCHEME_ID, searchFields } from '@/pages/data-reg/app-scheme/data';
import { toast } from 'react-toastify';
import { TOAST_MESSAGES } from '@/constants/message';
import { useDeleteAppSchemes, useAppSchemes } from '@/pages/data-reg/app-scheme/hooks';
import { selectFieldsConfig, dateFieldsConfig } from '@/pages/data-reg/app-scheme/data';
import { useListState } from '@/hooks/useListState';
import { parseSearchParams } from '@/utils/apiUtils';
import { PAGE_TITLES } from '@/constants/pageTitle';
import { APPROVAL_RETURN_URL } from '@/constants/options';

const AppSchemePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { listState } = useListState(20);
  const deleteMutation = useDeleteAppSchemes();

  // 검색 조건을 객체로 변환
  const searchParams = useMemo(
    () => parseSearchParams(listState.searchFieldsState),
    [listState.searchFieldsState],
  );

  const { data, isLoading, isFetching } = useAppSchemes({
    page: listState.page,
    size: listState.size,
    searchParams,
  });
  const isDataLoading = isLoading || isFetching;

  const rows = data?.items || [];
  const totalElements = data?.meta?.totalElements;

  const handleCreate = useCallback(() => {
    navigate(ROUTES.APP_SCHEME_CREATE);
  }, [navigate]);

  const handleRequestApproval = useCallback(() => {
    const currentUrl = location.pathname + location.search;
    sessionStorage.setItem(APPROVAL_RETURN_URL, currentUrl);
    navigate(ROUTES.APP_SCHEME_APPROVAL);
  }, [location.pathname, location.search, navigate]);

  const handleDeleteConfirm = useCallback(
    async (ids: (string | number)[]) => {
      if (ids.length === 0) {
        return;
      }
      try {
        await deleteMutation.mutateAsync(ids);
        //toast.success(TOAST_MESSAGES.SAVE_SUCCESS);
      } catch {
        toast.error(TOAST_MESSAGES.DELETE_FAILED);
      }
    },
    [deleteMutation],
  );

  const handleRowClick = useCallback(
    (params: { id: string | number; row: AppSchemeItem }) => {
      navigate(ROUTES.APP_SCHEME_DETAIL(params.id));
    },
    [navigate],
  );

  return (
    <Box>
      <PageHeader title={PAGE_TITLES.APP_SCHEME} />
      <ManagementList<AppSchemeItem>
        onRowClick={handleRowClick}
        columns={appSchemeColumns}
        rows={rows}
        totalElements={totalElements}
        rowIdGetter={APP_SCHEME_ID}
        onCreate={handleCreate}
        onRequestApproval={handleRequestApproval}
        onDeleteConfirm={handleDeleteConfirm}
        enableStatePreservation={true}
        enableClientSearch={false}
        exportFileName={`${PAGE_TITLES.APP_SCHEME} 목록`}
        selectFields={selectFieldsConfig}
        dateFields={dateFieldsConfig}
        dateFormat="YYYYMMDDHHmmss"
        searchFields={searchFields}
        isLoading={isDataLoading}
      />
    </Box>
  );
};

export default AppSchemePage;
