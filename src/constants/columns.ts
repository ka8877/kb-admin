// 공통 컬럼 정의
import type { GridColDef } from '@mui/x-data-grid';
import type { ApprovalRequestItem } from '../types/types';
import { TABLE_LABELS } from './label';

const {
  NO,
  APPROVAL_REQUEST_ID,
  TARGET_TYPE,
  TARGET_ID,
  ITSVC_NO,
  REQUEST_KIND,
  APPROVAL_STATUS,
  PAYLOAD_BEFORE,
  PAYLOAD_AFTER,
  REQUESTER_NAME,
  REQUESTER_DEPT_NAME,
  LAST_ACTOR_NAME,
  REQUESTED_AT,
  LAST_UPDATED_AT,
  IS_RETRACTED,
  IS_APPLIED,
  APPLIED_AT,
} = TABLE_LABELS.APPROVAL_REQUEST;

export const approvalRequestColumns: GridColDef<ApprovalRequestItem>[] = [
  { field: NO, headerName: 'no', width: 80 }, // No
  // id 필드는 숨김 처리 (행 구분용)
  { field: APPROVAL_REQUEST_ID, headerName: '아이디', width: 120 }, // PK 결재요청 PK
  { field: TARGET_TYPE, headerName: '대상 타입', flex: 1, minWidth: 150 }, // 대상 타입 IX(복합)
  { field: TARGET_ID, headerName: '대상 식별자', flex: 1, minWidth: 150 }, // 대상 식별자 IX(복합)
  { field: ITSVC_NO, headerName: 'ITSVC/JIRA 번호', width: 150 }, // ITSVC/JIRA 번호 IX
  { field: REQUEST_KIND, headerName: '결재양식', width: 120 }, // 요청 유형
  { field: APPROVAL_STATUS, headerName: '처리상태', width: 120 }, // 진행 상태
  { field: PAYLOAD_BEFORE, headerName: '변경 전 데이터', flex: 2, minWidth: 200 }, // 변경 전 데이터
  { field: PAYLOAD_AFTER, headerName: '변경 후 데이터', flex: 2, minWidth: 200 }, // 승인 후 DB 반영용 after 값
  { field: REQUESTER_NAME, headerName: '요청자', width: 120 }, // 요청자 이름
  { field: REQUESTER_DEPT_NAME, headerName: '요청부서', width: 150 }, // 요청부서
  { field: LAST_ACTOR_NAME, headerName: '최근 처리자', width: 120 }, // 최근 처리자 이름
  { field: REQUESTED_AT, headerName: '요청일', width: 160 }, // 요청 생성 시각
  { field: LAST_UPDATED_AT, headerName: '최근 변경 시각', width: 160 }, // 최근 변경 시각
  { field: IS_RETRACTED, headerName: '회수 여부', width: 100, type: 'boolean' }, // 회수 여부
  { field: IS_APPLIED, headerName: '반영 여부', width: 100, type: 'boolean' }, // DB 반영 완료 여부
  { field: APPLIED_AT, headerName: '반영 시각', width: 160 }, // DB 반영 시각
];
