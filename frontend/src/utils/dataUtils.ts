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
export function hasDataChanges<T extends Record<string, any>>(
  originalData: T | undefined,
  editedData: T | undefined,
  excludeFields: string[] = ['updatedAt', 'createdAt', 'no'],
): boolean {
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
}
