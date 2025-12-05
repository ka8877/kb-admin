import type { GridColDef } from '@mui/x-data-grid';
import { UserRoleChangeItem } from '@/pages/history/user-role-change/type';

export const userRoleChangeColumns: GridColDef<UserRoleChangeItem>[] = [
  { field: 'no', headerName: 'No', width: 50 },
  { field: 'historyId', headerName: '이력 ID', width: 70 },
  { field: 'kcUserId', headerName: '사용자 ID', width: 100 },
  { field: 'roleId', headerName: '역할 ID', width: 100 },
  { field: 'changeType', headerName: '변경 유형', width: 90 },
  { field: 'itsvcNo', headerName: 'ITSVC 번호', width: 140 },
  {
    field: 'beforeState',
    headerName: '변경전 스냅샷',
    width: 140,
  },
  {
    field: 'afterState',
    headerName: '변경후 스냅샷',
    width: 140,
  },
  { field: 'reason', headerName: '변경 사유', flex: 1, minWidth: 100 },
  { field: 'changedBy', headerName: '작업자', width: 90 },
  { field: 'changedAt', headerName: '변경일시', width: 180 },
];
