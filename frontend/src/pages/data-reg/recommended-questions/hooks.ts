// frontend/src/pages/data-reg/recommended-questions/hooks.ts
import { useMemo } from 'react';
import { questionCategoryGroupedOptions } from './data';

/**
 * 선택된 서비스에 따라 필터링된 질문 카테고리 옵션을 반환하는 커스텀 훅
 *
 * @param serviceCode - 선택된 서비스 코드 (예: 'ai_search', 'ai_calc')
 * @returns 필터링된 질문 카테고리 그룹 옵션 배열
 *
 * @example
 * const filteredOptions = useFilteredQuestionCategories('ai_search');
 * // AI 검색 관련 카테고리만 반환
 */
export const useFilteredQuestionCategories = (serviceCode: string | undefined) => {
  return useMemo(() => {
    if (!serviceCode) {
      return []; // 서비스 코드 미선택 시 빈 배열
    }
    // 선택된 서비스 코드와 groupValue가 일치하는 그룹만 필터링
    return questionCategoryGroupedOptions.filter((group) => group.groupValue === serviceCode);
  }, [serviceCode]);
};
