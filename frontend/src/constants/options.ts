/**
 * 전역 옵션 상수 정의
 * 애플리케이션 전역에서 사용되는 옵션 값들을 중앙에서 관리
 */

/**
 * 결재양식 옵션
 */
export const APPROVAL_FORM_OPTIONS = [
  { label: '데이터 등록', value: 'data_registration' },
  { label: '데이터 수정', value: 'data_modification' },
  { label: '데이터 삭제', value: 'data_deletion' },
];

/**
 * 결재 상태 값 상수
 */
export const CREATE_REQUESTED = 'create_requested';
export const UPDATE_REQUESTED = 'update_requested';
export const DELETE_REQUESTED = 'delete_requested';
export const IN_REVIEW = 'in_review';
export const DONE_REVIEW = 'done_review';

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

