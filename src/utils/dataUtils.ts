import { ROLE_ADMIN, ROLE_NONE, ROLE_CRUD, ROLE_VIEWER } from '@/constants/options';
import { UserRole, CommonCodeItem } from '@/types/types';

/**
 * 데이터 변경사항 체크 유틸리티
 */

/**
 * 공통코드 배열을 { label, value } 형태의 옵션 배열로 변환
 * @param codeItems - 공통코드 아이템 배열
 * @param useCodeNameAsValue - value에 codeName을 사용할지 여부 (기본값: false, code 사용)
 * @returns { label: codeName, value: code | codeName } 형태의 옵션 배열
 */
export const convertCommonCodeToOptions = (
  codeItems: CommonCodeItem[],
  useCodeNameAsValue: boolean = false,
): { label: string; value: string }[] => {
  if (!Array.isArray(codeItems)) {
    return [];
  }

  return codeItems
    .filter((item) => item.isActive) // 활성화된 항목만 포함
    .sort((a, b) => a.sortOrder - b.sortOrder) // sortOrder 기준 정렬
    .map((item) => ({
      label: item.codeName,
      value: useCodeNameAsValue ? item.codeName : item.code,
    }));
};

/**
 * 시작일과 종료일을 비교하여 유효성을 검사하는 함수
 * 시작일이 종료일보다 이후이면 에러 메시지를 띄우고 false를 반환합니다.
 *
 * @param startDate 시작일 (string | Date)
 * @param endDate 종료일 (string | Date)
 * @param showAlert alert 함수
 * @param message 에러 메시지 (기본값: '시작일은 종료일보다 클 수 없습니다.')
 * @returns 유효하면 true, 유효하지 않으면 false
 */
export const validateDateRange = (
  startDate: string | number,
  endDate: string | number,
  showAlert: (props: {
    message: string;
    severity?: 'error' | 'warning' | 'info' | 'success';
  }) => void,
  message: string = '시작일은 종료일보다 클 수 없습니다.',
): boolean => {
  // 둘 중 하나라도 값이 없으면 비교하지 않고 통과 (필수 입력 체크는 별도로 수행한다고 가정)
  if (!startDate || !endDate) {
    return true;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  // 날짜 형식이 유효하지 않은 경우 통과 (혹은 false 처리)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return true;
  }

  // 시작일이 종료일보다 큰 경우 (같거나 작은 경우는 통과)
  if (start > end) {
    showAlert({ message, severity: 'error' });
    return false;
  }

  return true;
};

/**
 * 두 객체를 비교하여 변경사항이 있는지 확인
 * @param originalData - 원본 데이터
 * @param editedData - 편집된 데이터
 * @param excludeFields - 비교에서 제외할 필드 목록 (예: updatedAt, createdAt 등)
 * @returns 변경사항이 있으면 true, 없으면 false
 */
export const hasDataChanges = <T extends Record<string, unknown>>(
  originalData: T | undefined,
  editedData: T | undefined,
  excludeFields: string[] = ['updatedAt', 'createdAt', 'no'],
): boolean => {
  // 둘 다 undefined이면 변경사항 없음
  if (!originalData && !editedData) {
    return false;
  }

  // 하나만 undefined이면 변경사항 있음
  if (!originalData || !editedData) {
    return true;
  }

  // 모든 필드를 순회하며 변경사항 확인
  const allKeys = new Set([...Object.keys(originalData), ...Object.keys(editedData)]);

  for (const key of allKeys) {
    // 제외할 필드는 스킵
    if (excludeFields.includes(key)) {
      continue;
    }

    const originalValue = originalData[key];
    const editedValue = editedData[key];

    // 값이 다르면 변경사항 있음
    if (originalValue !== editedValue) {
      // null과 undefined는 같은 것으로 처리
      if (
        (originalValue === null || originalValue === undefined) &&
        (editedValue === null || editedValue === undefined)
      ) {
        continue;
      }

      // 빈 문자열과 null/undefined를 같은 것으로 처리할 수도 있지만,
      // 일반적으로는 다른 값으로 처리하는 것이 맞음
      return true;
    }
  }

  return false;
};

/**
 * Keycloak 역할을 앱 내부 역할로 매핑
 * @param roles - Keycloak 역할 배열
 * @returns 앱 내부 역할 (admin | crud | viewer | none)
 */
export const mapRolesToAppRole = (roles: string[]): UserRole => {
  if (roles.includes(ROLE_ADMIN)) return ROLE_ADMIN;
  if (roles.includes(ROLE_CRUD)) return ROLE_CRUD;
  if (roles.includes(ROLE_VIEWER)) return ROLE_VIEWER;
  return ROLE_NONE;
};

/**
 * 데이터 리스트에 No(순번)를 추가하는 함수
 * @param data 데이터 배열
 * @param totalCount 전체 데이터 개수
 * @param page 현재 페이지 (0부터 시작)
 * @param size 페이지 크기
 * @param order 정렬 순서 ('desc' | 'asc') - 기본값 'desc'
 * @returns No가 추가된 데이터 배열
 */
export const addRowNumber = <T>(
  data: T[],
  totalCount: number,
  page: number,
  size: number,
  order: 'asc' | 'desc' = 'desc',
): (T & { no: number })[] => {
  if (!Array.isArray(data)) return [];

  return data.map((item, index) => {
    // 전체 데이터 기준 인덱스 계산
    const globalIndex = page * size + index;
    let no: number;

    if (order === 'asc') {
      no = globalIndex + 1;
    } else {
      no = totalCount - globalIndex;
    }

    // 기존 item의 속성을 유지하면서 no 속성을 덮어씀
    return { ...item, no };
  });
};
