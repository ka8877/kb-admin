/**
 * 전역 옵션 상수 정의
 * 애플리케이션 전역에서 사용되는 옵션 값들을 중앙에서 관리
 */

import type { SearchField } from '@/types/types';

/**
 * 결재양식 값 상수 requestKind
 */
export const DATA_REGISTRATION = 'CREATE' as const;
export const DATA_MODIFICATION = 'UPDATE' as const;
export const DATA_DELETION = 'DELETE' as const;

/**
 * 결재 대상 타입 상수
 */
export const TARGET_TYPE_RECOMMEND = 'RECOMMEND' as const;
export const TARGET_TYPE_APP = 'APP' as const;

/**
 * 결재양식 옵션 requestKind
 */
export const APPROVAL_FORM_OPTIONS = [
  { label: '데이터 등록', value: DATA_REGISTRATION },
  { label: '데이터 수정', value: DATA_MODIFICATION },
  { label: '데이터 삭제', value: DATA_DELETION },
];

/**
 * 결재 상태 값 상수
 */
export const CREATE_REQUESTED = 'create_requested' as const;
export const UPDATE_REQUESTED = 'update_requested' as const;
export const DELETE_REQUESTED = 'delete_requested' as const;
export const IN_REVIEW = 'in_review' as const;
export const DONE_REVIEW = 'done_review' as const;

/**
 * 결재 상태 옵션
 */
export const APPROVAL_STATUS_OPTIONS = [
  { label: '등록요청', value: CREATE_REQUESTED },
  { label: '수정요청', value: UPDATE_REQUESTED },
  { label: '삭제요청', value: DELETE_REQUESTED },
  { label: '검토중', value: IN_REVIEW },
  { label: '승인완료', value: DONE_REVIEW },
];

// **************결재 검색 페이지**************
export const APPROVAL_SEARCH_FIELDS: SearchField[] = [
  {
    type: 'textGroup',
    fields: [
      { field: 'payloadBefore', label: '변경 전 내용' },
      { field: 'payloadAfter', label: '변경 후 내용' },
    ],
  },
  {
    field: 'requestKind',
    label: '결재양식',
    type: 'select',
    options: [...APPROVAL_FORM_OPTIONS],
  },
  {
    field: 'approvalStatus',
    label: '결재상태',
    type: 'select',
    options: [...APPROVAL_STATUS_OPTIONS],
  },

  {
    field: 'createdAt_start',
    dataField: 'createdAt',
    label: '요청일시 시작',
    type: 'dateRange',
    position: 'start',
  },
  {
    field: 'createdAt_end',
    dataField: 'createdAt',
    label: '요청일시 종료',
    type: 'dateRange',
    position: 'end',
  },
];

/**
 * SessionStorage key for preserving approval page navigation state
 */
export const APPROVAL_PAGE_STATE = 'approval_page_state' as const;
export const APPROVAL_RETURN_URL = 'approval_return_url' as const;

export const IN_SERVICE = 'in_service' as const;
export const OUT_OF_SERVICE = 'out_of_service' as const;

// 데이터 등록 반영 상태 옵션 데이터
export const statusOptions = [
  { label: '서비스 중', value: IN_SERVICE },
  { label: '서비스 종료', value: OUT_OF_SERVICE },
];

// 예 아니오 옵션 데이터
export const yesNoOptions = [
  { label: '예', value: 'Y' },
  { label: '아니오', value: 'N' },
];

// 권한 종류
export const ROLE_ADMIN = 'admin' as const;
export const ROLE_CRUD = 'crud' as const;
export const ROLE_VIEWER = 'viewer' as const;
export const ROLE_NONE = 'none' as const;

// code_group_id (파이어 베이스 임시용)
export const CODE_GRUOP_ID_SERVICE_NM = 1765259941522;
export const CODE_GROUP_ID_SERVICE_CD = 1765260502337;
export const CODE_GROUP_ID_QST_CTGR = 1765416760082;
export const CODE_GROUP_ID_AGE = 1765432508332;

// 경로 상수
export const PAGE_TYPE = {
  DATA_REG: {
    RECOMMENDED_QUESTIONS: 'recommended-questions',
    APP_SCHEME: 'app-scheme',
  },
} as const;
