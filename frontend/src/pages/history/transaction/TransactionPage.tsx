import React from 'react';
import { Box } from '@mui/material';
import PageHeader from '@/components/common/PageHeader';
import SimpleList from '@/components/common/list/SimpleList';
import type { TransactionItem } from './type';
import { transactionColumns } from './components/columns/columns';
import { mockTransactions, division1Options, division2Options } from './data';

const listApi = {
  list: async (): Promise<TransactionItem[]> => {
    return Promise.resolve(mockTransactions);
  },
};

const selectFieldsConfig = {
  division1: division1Options,
  division2: division2Options,
};

const TransactionPage: React.FC = () => {
  return (
    <Box>
      <PageHeader title="사용자 사용 이력" />
      <SimpleList<TransactionItem>
        columns={transactionColumns}
        fetcher={listApi.list}
        rowIdGetter="no"
        defaultPageSize={20}
        enableStatePreservation={true}
        selectFields={selectFieldsConfig}
      />
    </Box>
  );
};

export default TransactionPage;