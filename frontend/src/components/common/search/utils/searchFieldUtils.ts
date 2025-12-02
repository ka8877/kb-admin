import type { SearchField } from '@/types/types';

/**
 * 원본 인덱스 찾기 함수
 */
export const getOriginalIndex = (
  searchField: SearchField,
  searchFields: SearchField[],
): number => {
  return searchFields.findIndex((f) => {
    if (searchField.type === 'dateRange' && f.type === 'dateRange') {
      return searchField.field === f.field;
    }
    if (searchField.type === 'textGroup' && f.type === 'textGroup') {
      return JSON.stringify(searchField.fields) === JSON.stringify(f.fields);
    }
    if ('field' in searchField && 'field' in f) {
      return searchField.field === f.field;
    }
    return false;
  });
};

/**
 * dateRange 필드의 baseField 추출
 */
export const extractBaseField = (dateField: string): string => {
  // 1. 접두사 패턴 제거: start_, end_, imp_start_, imp_end_ 등
  let baseField = dateField.replace(/^(start_|end_|imp_start_|imp_end_)/, '');
  // 2. 접미사 패턴 제거: _start_date, _end_date, _start, _end, _date
  baseField = baseField.replace(/_start_date$|_end_date$|_start$|_end$|_date$/, '');
  // 3. 빈 문자열이면 'date'로 설정 (fallback)
  return baseField || 'date';
};

/**
 * dateRange 필드들을 그룹화
 */
export const groupDateRangeFields = (
  searchFields: SearchField[],
): Record<string, { start?: Extract<SearchField, { type: 'dateRange' }>; end?: Extract<SearchField, { type: 'dateRange' }> }> => {
  const groups: Record<string, { start?: Extract<SearchField, { type: 'dateRange' }>; end?: Extract<SearchField, { type: 'dateRange' }> }> = {};

  searchFields.forEach((sf) => {
    if (sf.type === 'dateRange') {
      const dateField = 'dataField' in sf && sf.dataField ? sf.dataField : sf.field;
      const baseField = extractBaseField(dateField);

      if (!groups[baseField]) {
        groups[baseField] = {};
      }

      if (sf.position === 'start') {
        groups[baseField].start = sf;
      } else if (sf.position === 'end') {
        groups[baseField].end = sf;
      }
    }
  });

  return groups;
};

/**
 * dateRange 필드의 실제 필드명 추출
 */
export const getDateFieldName = (sf: Extract<SearchField, { type: 'dateRange' }>): string => {
  return 'dataField' in sf && sf.dataField ? sf.dataField : sf.field;
};

