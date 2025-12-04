import React from 'react';
import { Box } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import SimpleList from '@/components/common/list/SimpleList';
import type { UserLoginItem } from './type';
import { userLoginColumns } from './components/columns/columns';
import { mockUserLogins, resultOptions } from './data';

const listApi = {
  list: async (): Promise<UserLoginItem[]> => {
    return Promise.resolve(mockUserLogins);
  },
};

const selectFieldsConfig = {
  result: resultOptions,
};

const UserLoginPage: React.FC = () => {
  return (
    <Box>
      <PageHeader title="로그인 이력" />
      <SimpleList<UserLoginItem>
        columns={userLoginColumns}
        fetcher={listApi.list}
        rowIdGetter="no"
        defaultPageSize={20}
        enableStatePreservation={true}
        selectFields={selectFieldsConfig}
      />
    </Box>
  );
};

export default UserLoginPage;
