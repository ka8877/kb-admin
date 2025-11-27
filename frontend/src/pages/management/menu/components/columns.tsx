// frontend/src/pages/management/menu/components/columns.tsx
import type { GridColDef } from '@mui/x-data-grid';
import type { RowItem } from '../types';

export const menuColumns: GridColDef<RowItem>[] = [
  {
    field: 'no',
    headerName: 'No',
    width: 70,
    sortable: false,
  },
  {
    field: 'screen_id',
    headerName: '화면 ID',
    width: 180,
  },
  {
    field: 'screen_name',
    headerName: '화면명',
    width: 200,
  },
  {
    field: 'path',
    headerName: 'PATH',
    width: 300,
    flex: 1,
  },
  {
    field: 'depth',
    headerName: 'DEPTH',
    width: 80,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'order',
    headerName: '순서',
    width: 80,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'parent_screen_id',
    headerName: '상위화면 ID',
    width: 150,
    valueGetter: (value, row) => row?.parent_screen_id || '-',
  },
  {
    field: 'screen_type',
    headerName: '화면타입',
    width: 100,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'display_yn',
    headerName: '표시여부',
    width: 100,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (params.value === 'Y' ? '표시' : '숨김'),
  },
];
