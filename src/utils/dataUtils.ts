import { ROLE_ADMIN, ROLE_NONE, ROLE_CRUD, ROLE_VIEWER } from '@/constants/options';
import { UserRole } from '@/types/types';

/**
 * 데이터 변경사항 체크 유틸리티
 */

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
