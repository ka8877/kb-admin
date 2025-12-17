// 화면 권한 관리 컬럼 정의

import { GridColDef } from '@mui/x-data-grid';
import type { PermissionDisplay } from './types';

export const permissionColumns: GridColDef<PermissionDisplay>[] = [
  {
    field: 'no',
    headerName: 'No',
    width: 60,
    align: 'center',
    headerAlign: 'center',
  },
  {
    field: 'permission_code',
    headerName: '권한코드',
    width: 150,
  },
  {
    field: 'permission_name',
    headerName: '권한명',
    flex: 1,
  },
  {
    field: 'is_active',
    headerName: '사용여부',
    width: 100,
    align: 'center',
    headerAlign: 'center',
    renderCell: (params) => (params.value === 0 ? '미사용' : '사용'),
  },
];
