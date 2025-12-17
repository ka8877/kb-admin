import type { GridColDef } from '@mui/x-data-grid';
import type { RowItem } from '../types';

export const listColumns: GridColDef<RowItem>[] = [
  {
    field: 'no',
    headerName: 'NO',
    width: 80,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'permission_id',
    headerName: '권한 ID',
    width: 200,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'permission_name',
    headerName: '권한명',
    flex: 1,
    minWidth: 150,
  },
  {
    field: 'status',
    headerName: '등록상태',
    width: 120,
    align: 'center',
    headerAlign: 'center',
  },
];
