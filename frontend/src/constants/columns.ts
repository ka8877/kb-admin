// 공통 컬럼 정의
import type { GridColDef } from '@mui/x-data-grid';
import type { ApprovalRequestItem } from '../types/types';

export const approvalRequestColumns: GridColDef<ApprovalRequestItem>[] = [
  { field: 'no', headerName: 'No', width: 80 },
  // id 필드는 숨김 처리 (행 구분용)
  { field: 'approval_form', headerName: '결재양식', width: 120 },
  { field: 'title', headerName: '제목', flex: 2, minWidth: 200 },
  { field: 'content', headerName: '내용', flex: 3, minWidth: 300 },
  { field: 'requester', headerName: '요청자', width: 120 },
  { field: 'department', headerName: '요청부서', flex: 1, minWidth: 150 },
  { field: 'request_date', headerName: '요청일', width: 160 },
  { field: 'status', headerName: '처리상태', width: 100 },
  { field: 'process_date', headerName: '처리일', width: 160 },
];
