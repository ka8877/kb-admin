import React, { useState, useMemo } from 'react';
import { Box } from '@mui/material';
import { GridEventListener } from '@mui/x-data-grid';
import PageHeader from '@/components/common/PageHeader';
import SimpleList from '@/components/common/list/SimpleList';
import TextPopup from '@/components/common/popup/TextPopup';
import type { DataChangeItem } from './type';
import { dataChangeColumns } from './components/columns/columns';
import { useDataChanges } from './hooks';
import { useListState } from '@/hooks/useListState';
import { parseSearchParams } from '@/utils/apiUtils';
import MediumButton from '@/components/common/button/MediumButton';
import { LABELS } from '@/constants/label';
import { exportGridToExcel } from '@/utils/excelUtils';
import { AUDIT_LOG_ID, BEFORE_DATA, AFTER_DATA } from './data';

const selectFieldsConfig = {};

const DataChangePage: React.FC = () => {
  const { listState } = useListState(20);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupContent, setPopupContent] = useState('');
  const [popupTitle, setPopupTitle] = useState('');

  const searchParams = useMemo(
    () => parseSearchParams(listState.searchFieldsState),
    [listState.searchFieldsState]
  );

  const { data, isLoading, isFetching } = useDataChanges({
    page: listState.page,
    size: listState.size,
    searchParams,
  });

  const rows = data?.items || [];

  const isDataLoading = isLoading || isFetching;

  const handleExportExcel = async () => {
    await exportGridToExcel({
      rows,
      columns: dataChangeColumns,
      exportFileName: '데이터_변경_이력',
    });
  };

  const handleCellClick: GridEventListener<'cellClick'> = (params) => {
    if (params.field === BEFORE_DATA || params.field === AFTER_DATA) {
      setPopupTitle(params.colDef.headerName || '상세 정보');
      setPopupContent((params.value as string) || '');
      setPopupOpen(true);
    }
  };

  return (
    <Box>
      <PageHeader title="데이터 변경 이력" />
      <SimpleList<DataChangeItem>
        actionsNode={
          <MediumButton subType="etc" variant="outlined" onClick={handleExportExcel}>
            {LABELS.DOWNLOAD_ALL_XLSX}
          </MediumButton>
        }
        columns={dataChangeColumns}
        rows={rows}
        rowIdGetter={AUDIT_LOG_ID}
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

export default DataChangePage;
