import type { GridColDef } from '@mui/x-data-grid';
import { TransactionItem } from '@/pages/history/transaction/type';

export const transactionColumns: GridColDef<TransactionItem>[] = [
  { field: 'no', headerName: 'No', width: 80 },
  { field: 'user_id', headerName: '사용자', width: 150 },
  { field: 'control_date', headerName: '제어일시', width: 180 },
  { field: 'lookup_key', headerName: '조회키', width: 180 },
  { field: 'division1', headerName: '구분1', width: 180 },
  { field: 'division2', headerName: '구분2', width: 180 },
  { field: 'detail_content', headerName: '상세내용', width: 180 },
];
