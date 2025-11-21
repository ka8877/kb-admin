import type { GridColDef } from '@mui/x-data-grid';
import { UserLoginItem } from '@/pages/history/login/type';

export const userLoginColumns: GridColDef<UserLoginItem>[] = [
  { field: 'no', headerName: 'No', width: 80 },
  { field: 'kor_name', headerName: '한글명', width: 150 },
  { field: 'eng_name', headerName: '영문명', width: 180 },
  { field: 'ip_address', headerName: 'IP주소', width: 180 },
  { field: 'type', headerName: '타입', width: 180 },
  { field: 'last_login_date', headerName: '마지막로그인일시', width: 180 },
];
