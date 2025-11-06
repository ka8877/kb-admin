import type { GridColDef } from '@mui/x-data-grid';
import type { RowItem } from '../types';

export const listColumns: GridColDef<RowItem>[] = [
  { field: 'no', headerName: 'No', width: 80 },
  { field: 'category_nm', headerName: '연령대', flex: 1 },
  { field: 'service_cd', headerName: '코드', width: 200 },
  {
    field: 'status_code',
    headerName: '활성상태',
    width: 140,
    valueGetter: (params) => (params.row.status_code === 'Y' ? '활성' : '비활성'),
  },
];
