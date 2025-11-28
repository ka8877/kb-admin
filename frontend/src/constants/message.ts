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
  APPROVAL_REQUEST: '결재 요청',
  FINAL_APPROVAL: '최종 결재 요청',
} as const;

// ========== 확인 다이얼로그 메시지 ==========
export const CONFIRM_MESSAGES = {
  SAVE: '저장 하시겠습니까?',
  SAVE_CHANGES: '변경사항을 저장하시겠습니까?',
  DELETE: '삭제 하시겠습니까?',
  APPROVAL_REQUEST: '저장 및 반영하기 결재를 요청하시겠습니까?',
  FINAL_APPROVAL: '최종 결재를 넘기시겠습니까?',
} as const;

// ========== 토스트 메시지 ==========
export const TOAST_MESSAGES = {
  // 성공 메시지
  FINAL_APPROVAL_REQUESTED: '최종 결재를 요청하였습니다.',
  UPDATE_REQUESTED: '수정을 요청하였습니다.',
  REGISTRATION_REQUESTED: '등록을 요청하였습니다.',
  DELETE_APPROVAL_REQUESTED: '결재를 요청하였습니다.',
  SAVE_SUCCESS: '저장되었습니다.',
  DELETE_SUCCESS: '삭제를 요청하였습니다.',
  FINAL_APPROVAL_SUCCESS: '최종 결재가 완료되었습니다.',

  // 실패 메시지
  UPDATE_FAILED: '수정을 실패하였습니다.',
  SAVE_FAILED: '저장에 실패했습니다.',
  DELETE_FAILED: '삭제에 실패했습니다.',
} as const;

// ========== 알림 다이얼로그 제목 ==========
export const ALERT_TITLES = {
  VALIDATION_CHECK: '입력값 확인',
} as const;

// ========== 알림 메시지 ==========
export const ALERT_MESSAGES = {
  // 경고 메시지
  NO_ITEMS_TO_DELETE: '삭제할 항목이 없습니다.',
  NO_ITEMS_TO_APPROVE: '최종 결재할 항목이 없습니다.',
  NO_ITEMS_SELECTED: '선택된 항목이 없습니다.',
  APPROVED_ITEMS_CANNOT_SELECT: '승인완료된 항목은 선택할 수 없습니다.',

  // Validation 관련
  VALIDATION_MISSING_REQUIRED: '필수 정보가 누락되었습니다. 확인 후 작성해주세요.',
  VALIDATION_CONTROL_CHAR:
    '알 수 없는 제어 문자가 포함되어 있습니다. 입력 문자 점검 후 다시 시도해주세요.',

  // 에러 메시지
  ERROR_OCCURRED: '에러가 발생하였습니다. 다시 시도해주세요.',

  // 파일 업로드 관련
  FILE_VALIDATION_COMPLETE: '파일 검증 완료',
  FILE_UPLOAD_SUCCESS: '등록이 완료되었습니다',
  UPLOAD_SUCCESS: '등록을 성공하였습니다',
  FILE_SELECT_REQUIRED: '파일 선택 필요',
  PLEASE_SELECT_FILE: '파일을 선택해주세요.',
  FILE_FORMAT_ERROR: '파일 포맷 오류',
  TEMPLATE_GENERATION_ERROR: '템플릿 생성 불가',
  TEMPLATE_GENERATION_FAILED: '템플릿 양식을 생성할 수 없습니다.',
  DOWNLOAD_FAILED: '다운로드 실패',
  UPLOAD_FAILED: '등록 실패',
  UPLOAD_ERROR_RETRY: '등록 중 오류가 발생했습니다. 다시 시도해주세요.',

  // Validation 오류
  VALIDATION_ERROR: 'Validation 오류',
  WORKSHEET_NOT_FOUND: '워크시트를 찾을 수 없습니다.',
  FILE_READ_ERROR: '파일을 읽는 중 오류가 발생했습니다.',
  CSV_TEMPLATE_DOWNLOAD_ERROR: 'CSV 템플릿 다운로드 중 오류가 발생했습니다.',
  TEMPLATE_DOWNLOAD_ERROR: '템플릿 다운로드 중 오류가 발생했습니다.',
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

/**
 * 파일 포맷 오류 메시지 생성
 * @param formats - 허용되는 파일 포맷 배열
 * @returns 파일 포맷 오류 메시지
 * @example
 * getFileFormatErrorMessage(['.xlsx', '.csv']) // "파일 포맷을 확인해주세요\n(가능포맷: xlsx, csv)"
 */
export const getFileFormatErrorMessage = (formats: string[]): string => {
  const formatList = formats.map((f) => f.replace('.', '')).join(', ');
  return `파일 포맷을 확인해주세요\n(가능포맷: ${formatList})`;
};
