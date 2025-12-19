import type { GridColDef } from '@mui/x-data-grid';
import { UserLoginItem } from '@/pages/history/login/type';
import {
  NO,
  LOGIN_HISTORY_ID,
  KC_USER_ID,
  LOGIN_AT,
  LOGOUT_AT,
  LOGIN_IP,
  LOGOUT_IP,
  USER_AGENT,
  RESULT,
  FAIL_REASON,
} from '../../data';

export const userLoginColumns: GridColDef<UserLoginItem>[] = [
  { field: NO, headerName: 'No', width: 60 },
  { field: LOGIN_HISTORY_ID, headerName: '로그인 아이디', width: 120 },
  { field: LOGIN_AT, headerName: '로그인 시각', width: 160 },
  { field: LOGOUT_AT, headerName: '로그아웃 시각', width: 160 },
  { field: KC_USER_ID, headerName: '사용자 아이디', width: 120 },
  { field: LOGIN_IP, headerName: '로그인 IP', width: 120 },
  { field: LOGOUT_IP, headerName: '로그아웃 IP', width: 120 },
  { field: USER_AGENT, headerName: '브라우저 정보', flex: 1, minWidth: 200 },
  { field: RESULT, headerName: '결과', width: 80 },
  { field: FAIL_REASON, headerName: '실패 사유', width: 150 },
];
