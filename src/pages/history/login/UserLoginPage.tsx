import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import SimpleList from '@/components/common/list/SimpleList';
import type { UserLoginItem } from './type';
import { userLoginColumns } from './components/columns/columns';
import { LOGIN_HISTORY_ID, resultOptions } from './data';
import { useUserLogins } from './hooks';
import { useListState } from '@/hooks/useListState';
import { parseSearchParams } from '@/utils/apiUtils';
import MediumButton from '@/components/common/button/MediumButton';
import { LABELS } from '@/constants/label';
import { exportGridToExcel } from '@/utils/excelUtils';

const selectFieldsConfig = {
  result: resultOptions,
};

const UserLoginPage: React.FC = () => {
  const { listState } = useListState(20);

  const searchParams = useMemo(
    () => parseSearchParams(listState.searchFieldsState),
    [listState.searchFieldsState],
  );

  const { data, isLoading, isFetching } = useUserLogins({
    page: listState.page,
    size: listState.size,
    searchParams,
  });

  const rows = data?.items || [];

  const isDataLoading = isLoading || isFetching;

  const handleExportExcel = async () => {
    await exportGridToExcel({
      rows,
      columns: userLoginColumns,
      exportFileName: '로그인_이력',
    });
  };

  return (
    <Box>
      <PageHeader title="로그인 이력" />
      <SimpleList<UserLoginItem>
        actionsNode={
          <MediumButton subType="etc" variant="outlined" onClick={handleExportExcel}>
            {LABELS.DOWNLOAD_ALL_XLSX}
          </MediumButton>
        }
        columns={userLoginColumns}
        rows={rows}
        rowIdGetter={LOGIN_HISTORY_ID}
        defaultPageSize={20}
        enableStatePreservation={true}
        selectFields={selectFieldsConfig}
        isLoading={isDataLoading}
      />
    </Box>
  );
};

export default UserLoginPage;
