import type { GridColDef } from '@mui/x-data-grid';
import { DataChangeItem } from '../../type';
import {
  NO,
  ACTED_AT,
  TABLE_NAME,
  PK_VALUE,
  OPERATION,
  DB_USER,
  BEFORE_DATA,
  AFTER_DATA,
} from '../../data';

export const dataChangeColumns: GridColDef<DataChangeItem>[] = [
  { field: NO, headerName: 'No', width: 50 },
  { field: ACTED_AT, headerName: '발생 일시', width: 180 },
  { field: TABLE_NAME, headerName: '대상 업무', width: 150 },
  { field: PK_VALUE, headerName: '대상 ID', width: 100 },
  { field: OPERATION, headerName: '작업 유형', width: 100 },
  { field: DB_USER, headerName: '작업자', width: 100 },
  {
    field: BEFORE_DATA,
    headerName: '변경전 데이터',
    width: 200,
    flex: 1,
  },
  {
    field: AFTER_DATA,
    headerName: '변경후 데이터',
    width: 200,
    flex: 1,
  },
];
