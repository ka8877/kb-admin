import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import SimpleList from '@/components/common/list/SimpleList';
import type { UserLoginItem } from './type';
import { userLoginColumns } from './components/columns/columns';
import { resultOptions } from './data';
import { useUserLogins } from './hooks';
import { useListState } from '@/hooks/useListState';
import { parseSearchParams } from '@/utils/apiUtils';

const selectFieldsConfig = {
  result: resultOptions,
};

const UserLoginPage: React.FC = () => {
  const { listState } = useListState(20);

  const searchParams = useMemo(
    () => parseSearchParams(listState.searchFieldsState),
    [listState.searchFieldsState],
  );

  const {
    data: rows = [],
    isLoading,
    isFetching,
  } = useUserLogins({
    page: listState.page,
    pageSize: listState.pageSize,
    searchParams,
  });

  const isDataLoading = isLoading || isFetching;

  return (
    <Box>
      <PageHeader title="로그인 이력" />
      <SimpleList<UserLoginItem>
        columns={userLoginColumns}
        rows={rows}
        rowIdGetter="no"
        defaultPageSize={20}
        enableStatePreservation={true}
        selectFields={selectFieldsConfig}
        isLoading={isDataLoading}
      />
    </Box>
  );
};

export default UserLoginPage;
