import type { GridColDef } from '@mui/x-data-grid';
import { UserLoginItem } from '@/pages/history/login/type';

export const userLoginColumns: GridColDef<UserLoginItem>[] = [
  { field: 'no', headerName: 'No', width: 60 },
  { field: 'loginHistoryId', headerName: '로그인 아이디', width: 120 },
  { field: 'loginAt', headerName: '로그인 시각', width: 160 },
  { field: 'logoutAt', headerName: '로그아웃 시각', width: 160 },
  { field: 'loginIp', headerName: '로그인 IP', width: 120 },
  { field: 'logoutIp', headerName: '로그아웃 IP', width: 120 },
  { field: 'userAgent', headerName: '브라우저 정보', flex: 1, minWidth: 200 },
  { field: 'result', headerName: '결과', width: 80 },
  { field: 'failReason', headerName: '실패 사유', width: 150 },
];
