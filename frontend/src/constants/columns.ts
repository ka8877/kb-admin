// 공통 컬럼 정의
import type { GridColDef } from '@mui/x-data-grid';
import type { ApprovalRequestItem } from '../types/types';

export const approvalRequestColumns: GridColDef<ApprovalRequestItem>[] = [
  // id 필드는 숨김 처리 (행 구분용)
  { field: 'approvalRequestId', headerName: '아이디', width: 120 }, // PK 결재요청 PK
  { field: 'targetType', headerName: '대상 타입', flex: 2, minWidth: 200 }, // 대상 타입 IX(복합)
  { field: 'targetId', headerName: '대상 식별자', flex: 3, minWidth: 300 }, // 대상 식별자 IX(복합)
  { field: 'itsvcNo', headerName: 'ITSVC/JIRA 번호', width: 120 }, // ITSVC/JIRA 번호 IX
  { field: 'requestKind', headerName: '결재양식', flex: 1, minWidth: 150 }, // 요청 유형
  { field: 'approvalStatus', headerName: '처리상태', width: 160 }, // 진행 상태
  { field: 'title', headerName: '제목', width: 100 }, // 결재 제목
  { field: 'content', headerName: '내용', flex: 3, minWidth: 300 }, // 결재 내용
  { field: 'createdBy', headerName: '요청자', width: 120 }, // 요청자 ID IX(복합)
  { field: 'department', headerName: '요청부서', flex: 1, minWidth: 150 }, // 요청부서
  { field: 'updatedBy', headerName: '최근 처리자', width: 120 }, // 최근 처리자 ID
  { field: 'createdAt', headerName: '요청일', width: 160 }, // 요청 생성 시각 IX(복합)
  { field: 'updatedAt', headerName: '최근 변경 시각', width: 160 }, // 최근 변경 시각IX(복합)
  { field: 'isRetracted', headerName: '회수 여부', width: 160 }, // 회수 여부
];
