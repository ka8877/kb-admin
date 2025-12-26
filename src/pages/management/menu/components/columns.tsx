// frontend/src/pages/management/menu/components/columns.tsx
import type { GridColDef } from '@mui/x-data-grid';
import type { MenuItemDisplay } from '../types';

export const menuColumns: GridColDef<MenuItemDisplay>[] = [
  {
    field: 'no',
    headerName: 'No',
    width: 70,
    sortable: false,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'menuCode',
    headerName: '메뉴 코드',
    width: 180,
  },
  {
    field: 'menuName',
    headerName: '메뉴명',
    width: 200,
  },
  {
    field: 'menuPath',
    headerName: '라우트 경로',
    width: 250,
    flex: 1,
  },
  {
    field: 'sortOrder',
    headerName: '정렬 순서',
    width: 80,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'parentMenuCode',
    headerName: '상위메뉴 코드',
    width: 150,
    valueGetter: (params) => params.row?.parentMenuCode || '-',
  },
  {
    field: 'isActive',
    headerName: '표시여부',
    width: 100,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (params.value ? '표시' : '숨김'),
  },
];
