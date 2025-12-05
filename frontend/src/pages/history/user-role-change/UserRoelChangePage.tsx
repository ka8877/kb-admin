import React, { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { GridEventListener } from '@mui/x-data-grid';
import PageHeader from '@/components/common/PageHeader';
import SimpleList from '@/components/common/list/SimpleList';
import TextPopup from '@/components/common/popup/TextPopup';
import type { UserRoleChangeItem } from './type';
import { userRoleChangeColumns } from './components/columns/columns';
import { changeTypeOptions } from './data';
import { useUserRoleChanges } from './hooks';
import { useListState } from '@/hooks/useListState';
import { parseSearchParams } from '@/utils/apiUtils';

const selectFieldsConfig = {
  changeType: changeTypeOptions,
};

const UserRoleChangePage: React.FC = () => {
  const { listState } = useListState(20);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [popupTitle, setPopupTitle] = useState('');

  const searchParams = useMemo(
    () => parseSearchParams(listState.searchFieldsState),
    [listState.searchFieldsState],
  );

  const {
    data: rows = [],
    isLoading,
    isFetching,
  } = useUserRoleChanges({
    page: listState.page,
    pageSize: listState.pageSize,
    searchParams,
  });

  const isDataLoading = isLoading || isFetching;

  const handleCellClick: GridEventListener<'cellClick'> = (params) => {
    if (params.field === 'beforeState' || params.field === 'afterState') {
      setPopupTitle(params.colDef.headerName || '상세 정보');
      setPopupContent((params.value as string) || '');
      setPopupOpen(true);
    }
  };

  return (
    <Box>
      <PageHeader title="사용자 역할 변경 이력" />
      <SimpleList<UserRoleChangeItem>
        columns={userRoleChangeColumns}
        rows={rows}
        rowIdGetter="historyId"
        enableStatePreservation={true}
        selectFields={selectFieldsConfig}
        onCellClick={handleCellClick}
        isLoading={isDataLoading}
      />
      <TextPopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        title={popupTitle}
        content={popupContent}
      />
    </Box>
  );
};

export default UserRoleChangePage;
