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
 * 결재 상태 옵션
 */
export const APPROVAL_STATUS_OPTIONS = [
  { label: '등록요청', value: 'create_requested' },
  { label: '수정요청', value: 'update_requested' },
  { label: '삭제요청', value: 'delete_requested' },
  { label: '검토중', value: 'in_review' },
  { label: '승인완료', value: 'done_review' },
];

