/**
 * 전역 옵션 상수 정의
 * 애플리케이션 전역에서 사용되는 옵션 값들을 중앙에서 관리
 */

import type { SearchField } from '@/types/types';

/**
 * 결재양식 값 상수
 */
export const DATA_REGISTRATION = 'data_registration' as const;
export const DATA_MODIFICATION = 'data_modification' as const;
export const DATA_DELETION = 'data_deletion' as const;

/**
 * 결재양식 옵션
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
      { field: 'title', label: '제목' },
      { field: 'content', label: '내용' },
    ],
  },
  {
    field: 'approval_form',
    label: '결재양식',
    type: 'select',
    options: [...APPROVAL_FORM_OPTIONS],
  },
  {
    field: 'status',
    label: '결재상태',
    type: 'select',
    options: [...APPROVAL_STATUS_OPTIONS],
  },

  {
    field: 'request_date_start',
    dataField: 'request_date',
    label: '요청일시 시작',
    type: 'dateRange',
    position: 'start',
  },
  {
    field: 'request_date_end',
    dataField: 'request_date',
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
