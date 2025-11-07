import type { GridColDef } from '@mui/x-data-grid';
import type { RowItem } from '../types';

// Display columns: show human-friendly status based on status_code ('Y'|'N').
export const listColumns: GridColDef<RowItem>[] = [
  { field: 'no', headerName: 'No', width: 80 },
  { field: 'category_nm', headerName: '카테고리명', flex: 1 },
  { field: 'service_cd', headerName: '서비스코드', width: 200 }, // Corrected header name
  {
    field: 'status_code',
    headerName: '활성상태',
    width: 140,
    valueGetter: (params) => (params.row.status_code === 'Y' ? '활성' : '비활성'),
  },
];
