import type { GridColDef } from '@mui/x-data-grid';
import { UserRoleChangeItem } from '@/pages/history/user-role-change/type';
import {
  NO,
  HISTORY_ID,
  KC_USER_ID,
  ROLE_ID,
  CHANGE_TYPE,
  ITSVC_NO,
  REASON,
  BEFORE_STATE,
  AFTER_STATE,
  CHANGED_BY,
  CHANGED_AT,
} from '../../data';

export const userRoleChangeColumns: GridColDef<UserRoleChangeItem>[] = [
  { field: NO, headerName: 'No', width: 50 },
  { field: HISTORY_ID, headerName: '이력 ID', width: 70 },
  { field: KC_USER_ID, headerName: '사용자 ID', width: 100 },
  { field: ROLE_ID, headerName: '역할 ID', width: 100 },
  { field: CHANGE_TYPE, headerName: '변경 유형', width: 90 },
  { field: ITSVC_NO, headerName: 'ITSVC 번호', width: 140 },
  {
    field: BEFORE_STATE,
    headerName: '변경전 스냅샷',
    width: 140,
  },
  {
    field: AFTER_STATE,
    headerName: '변경후 스냅샷',
    width: 140,
  },
  { field: REASON, headerName: '변경 사유', flex: 1, minWidth: 100 },
  { field: CHANGED_BY, headerName: '작업자', width: 90 },
  { field: CHANGED_AT, headerName: '변경일시', width: 180 },
];
