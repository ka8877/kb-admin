/**
 * DataGrid 스타일 정의
 */
export const dataGridStyles = {
  '& .MuiDataGrid-cell': {
    whiteSpace: 'normal',
    lineHeight: '1.3',
    py: 0.25,
    px: 0.75,
  },
  // 서비스명 ~ 연령대까지 셀 간격 더 줄이기
  '& .MuiDataGrid-cell[data-field="service_nm"], & .MuiDataGrid-cell[data-field="display_ctnt"], & .MuiDataGrid-cell[data-field="qst_ctgr"], & .MuiDataGrid-cell[data-field="qst_style"], & .MuiDataGrid-cell[data-field="parent_id"], & .MuiDataGrid-cell[data-field="parent_nm"], & .MuiDataGrid-cell[data-field="age_grp"]':
    {
      px: 0.5,
    },
  '& .MuiDataGrid-columnHeader[data-field="service_nm"], & .MuiDataGrid-columnHeader[data-field="display_ctnt"], & .MuiDataGrid-columnHeader[data-field="qst_ctgr"], & .MuiDataGrid-columnHeader[data-field="qst_style"], & .MuiDataGrid-columnHeader[data-field="parent_id"], & .MuiDataGrid-columnHeader[data-field="parent_nm"], & .MuiDataGrid-columnHeader[data-field="age_grp"]':
    {
      px: 0.5,
    },
  // 노출 시작일시 ~ 반영일시까지 셀 간격 더 줄이기
  '& .MuiDataGrid-cell[data-field="imp_start_date"], & .MuiDataGrid-cell[data-field="imp_end_date"], & .MuiDataGrid-cell[data-field="updatedAt"], & .MuiDataGrid-cell[data-field="createdAt"], & .MuiDataGrid-cell[data-field="start_date"], & .MuiDataGrid-cell[data-field="end_date"]':
    {
      px: 0.5,
    },
  '& .MuiDataGrid-columnHeader[data-field="imp_start_date"], & .MuiDataGrid-columnHeader[data-field="imp_end_date"], & .MuiDataGrid-columnHeader[data-field="updatedAt"], & .MuiDataGrid-columnHeader[data-field="createdAt"], & .MuiDataGrid-columnHeader[data-field="start_date"], & .MuiDataGrid-columnHeader[data-field="end_date"]':
    {
      px: 0.5,
    },
  '& .MuiDataGrid-columnHeader': {
    py: 0.5,
    px: 0.75,
  },
  '& .MuiDataGrid-columnHeaders': {
    minHeight: '36px !important',
    maxHeight: '36px !important',
  },
  '& .MuiDataGrid-row': {
    minHeight: '32px !important',
    maxHeight: 'none !important',
  },
  // 셀렉트 박스 UI 깨짐 방지
  '& .MuiInputBase-root, & .MuiSelect-root': {
    minWidth: 120,
    boxSizing: 'border-box',
    width: '100%',
    maxWidth: '100%',
  },
  '& .MuiSelect-select': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};
