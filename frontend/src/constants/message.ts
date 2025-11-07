/**
 * 메시지 상수 정의
 *
 * 이 파일은 애플리케이션에서 사용되는 각종 메시지 상수들을 정의합니다.
 * - 확인 다이얼로그 메시지 (저장, 삭제, 취소 등)
 * - 알림 메시지 (성공, 실패, 경고 등)
 * - 검증 메시지 (필수값, 형식 오류 등)
 * - 시스템 메시지 (로딩, 네트워크 오류 등)
 */

// ========== 확인 다이얼로그 제목 ==========
export const CONFIRM_TITLES = {
  SAVE: '저장 확인',
  DELETE: '삭제 확인',
  APPROVAL_REQUEST: '결재 요청 확인',
} as const;

// ========== 확인 다이얼로그 메시지 ==========
export const CONFIRM_MESSAGES = {
  SAVE: '저장 하시겠습니까?',
  DELETE: '삭제 하시겠습니까?',
  APPROVAL_REQUEST: '저장 및 반영하기 결재를 요청하시겠습니까?',
} as const;

// ========== 알림 메시지 ==========
export const ALERT_MESSAGES = {
  // 성공 메시지
  SAVE_SUCCESS: '저장되었습니다.',
  DELETE_SUCCESS: '삭제되었습니다.',

  // 실패 메시지
  SAVE_FAILED: '저장에 실패했습니다.',
  DELETE_FAILED: '삭제에 실패했습니다.',

  // 경고 메시지
  NO_ITEMS_TO_DELETE: '삭제할 항목이 없습니다.',
} as const;

// ========== 동적 메시지 생성 함수 ==========
/**
 * 선택된 항목들의 번호와 개수를 포함한 삭제 확인 메시지 생성
 * @param rowNumbers - 삭제할 행 번호 배열
 * @returns 삭제 확인 메시지
 * @example
 * getDeleteConfirmMessage([1, 2, 3]) // "1행, 2행, 3행의 3개의 데이터를 삭제하시겠습니까?"
 */
export const getDeleteConfirmMessage = (rowNumbers: number[]): string => {
  const count = rowNumbers.length;
  const rowsText = rowNumbers.map((num) => `${num}행`).join(', ');
  return `${rowsText}의 ${count}개의 데이터를 삭제하시겠습니까?`;
};
