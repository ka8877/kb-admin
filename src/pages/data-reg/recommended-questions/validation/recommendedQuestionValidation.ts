// frontend/src/pages/data-reg/recommended-questions/validation/recommendedQuestionValidation.ts

/**
 * 추천질문 공통 Validation 규칙
 * 폼 validation과 엑셀 validation에서 공통으로 사용
 */

import { useCommonCodeOptions } from '@/hooks';
import { useCallback } from 'react';
import { useQuestionCategoriesCache } from '@/pages/data-reg/recommended-questions/hooks';
import {
  CODE_GROUP_ID_QST_CTGR,
  CODE_GRUOP_ID_SERVICE_NM,
  CODE_GROUP_ID_AGE,
  IN_SERVICE,
  OUT_OF_SERVICE,
} from '@/constants/options';
import { isValidDate, toISOString } from '@/utils/dateUtils';
import type { ValidationResult } from '@/types/types';
import { COMMON_CODE } from '@/constants/commonCode';
// 공통 validation 규칙 인터페이스
export interface RecommendedQuestionData {
  serviceNm?: string | null;
  qstCtgr?: string | null;
  displayCtnt?: string | null;
  promptCtnt?: string | null;
  qstStyle?: string | null;
  parentId?: string | null;
  parentNm?: string | null;
  ageGrp?: string | null;
  showU17?: boolean | null;
  impStartDate?: string | Date | null;
  impEndDate?: string | Date | null;
  status?: string | null;
}

/**
 * 공통 Validation 규칙 클래스 (Deprecated: Use useRecommendedQuestionValidator hook instead)
 * This class is kept for backward compatibility but will be removed.
 * Please migrate to useRecommendedQuestionValidator.
 */
// Helper functions
export const validateQuestionContent = (value: string | null | undefined): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: '질문 내용은 필수입니다' };
  }

  const content = value.trim();
  if (content.length < 5) {
    return { isValid: false, message: '질문 내용은 최소 5자 이상 입력해주세요' };
  }

  if (content.length > 500) {
    return { isValid: false, message: '질문 내용은 500자를 초과할 수 없습니다' };
  }

  return { isValid: true };
};

export const validatePromptContent = (value: string | null | undefined): ValidationResult => {
  if (value && value.length > 1000) {
    return { isValid: false, message: 'AI input 쿼리는 1000자를 초과할 수 없습니다' };
  }

  return { isValid: true };
};

export const validateQuestionStyle = (value: string | null | undefined): ValidationResult => {
  if (value && value.length > 200) {
    return { isValid: false, message: '질문 태그는 200자를 초과할 수 없습니다' };
  }

  return { isValid: true };
};

export const validateParentId = (
  value: string | null | undefined,
  data?: RecommendedQuestionData,
): ValidationResult => {
  const qstCtgr = data?.qstCtgr;
  const isRequired =
    qstCtgr === COMMON_CODE.QST_CTGR.AI_SEARCH_MID ||
    qstCtgr === COMMON_CODE.QST_CTGR.AI_SEARCH_STORY;

  if (isRequired && (!value || value.trim() === '')) {
    return { isValid: false, message: '부모 ID는 필수입니다' };
  }

  if (value && value.length > 20) {
    return { isValid: false, message: '부모 ID는 20자를 초과할 수 없습니다' };
  }

  return { isValid: true };
};

export const validateParentIdName = (
  value: string | null | undefined,
  data?: RecommendedQuestionData,
): ValidationResult => {
  const qstCtgr = data?.qstCtgr;
  const isRequired =
    qstCtgr === COMMON_CODE.QST_CTGR.AI_SEARCH_MID ||
    qstCtgr === COMMON_CODE.QST_CTGR.AI_SEARCH_STORY;

  if (isRequired && (!value || value.trim() === '')) {
    return { isValid: false, message: '부모 ID명은 필수입니다' };
  }

  if (value && value.length > 100) {
    return { isValid: false, message: '부모 ID명은 100자를 초과할 수 없습니다' };
  }

  return { isValid: true };
};

export const validateShowU17 = (value: boolean | null | undefined): ValidationResult => {
  if (value === null || value === undefined) {
    return { isValid: false, message: '17세 미만 노출 여부는 필수입니다' };
  }

  return { isValid: true };
};

export const validateDate = (
  value: string | Date | null | undefined,
  fieldName: string,
): ValidationResult => {
  if (!isValidDate(value as string | Date | null)) {
    return {
      isValid: false,
      message: `${fieldName} 형식이 올바르지 않습니다. (예: 2025-12-12 15:00:00 또는 20251212150000)`,
    };
  }

  return { isValid: true };
};

export const validateImpStartDate = (
  value: string | Date | null | undefined,
  _data?: RecommendedQuestionData,
): ValidationResult => {
  if (!value || value === null || value === undefined) {
    return { isValid: false, message: '노출 시작일시는 필수입니다' };
  }

  const dateValidation = validateDate(value, '노출 시작일시');
  if (!dateValidation.isValid) {
    return dateValidation;
  }

  return { isValid: true };
};

export const validateImpStartDateForCreate = (
  value: string | Date | null | undefined,
  _data?: RecommendedQuestionData,
): ValidationResult => {
  if (!value || value === null || value === undefined) {
    return { isValid: false, message: '노출 시작일시는 필수입니다' };
  }

  const dateValidation = validateDate(value, '노출 시작일시');
  if (!dateValidation.isValid) {
    return dateValidation;
  }

  const startDate = toISOString(value as string | Date | null);
  if (startDate) {
    const now = new Date();
    const startDateTime = new Date(startDate);

    if (startDateTime < now) {
      return {
        isValid: false,
        message: '노출 시작일시는 현재 일시 이후여야 합니다',
      };
    }
  }

  return { isValid: true };
};

export const validateImpEndDate = (
  value: string | Date | null | undefined,
  data?: RecommendedQuestionData,
): ValidationResult => {
  if (!value || value === null || value === undefined) {
    return { isValid: false, message: '노출 종료일시는 필수입니다' };
  }

  const dateValidation = validateDate(value, '노출 종료일시');
  if (!dateValidation.isValid) {
    return dateValidation;
  }

  if (data?.impStartDate) {
    const startDate = toISOString(data.impStartDate as string | Date | null);
    const endDate = toISOString(value as string | Date | null);

    if (startDate && endDate) {
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);

      if (endDateTime <= startDateTime) {
        return {
          isValid: false,
          message: '노출 종료일시는 노출 시작일시보다 커야 합니다',
        };
      }
    }
  }

  return { isValid: true };
};

export const validateStatus = (value: string | null | undefined): ValidationResult => {
  if (value && !([IN_SERVICE, OUT_OF_SERVICE] as string[]).includes(value)) {
    return {
      isValid: false,
      message: `status는 ${IN_SERVICE} 또는 ${OUT_OF_SERVICE}만 입력 가능합니다`,
    };
  }

  return { isValid: true };
};

/**
 * 추천질문 Validation Hook
 */
export const useRecommendedQuestionValidator = () => {
  const { data: serviceOptions = [] } = useCommonCodeOptions(CODE_GRUOP_ID_SERVICE_NM);
  const { data: ageGroupOptions = [] } = useCommonCodeOptions(CODE_GROUP_ID_AGE);
  const { data: questionCategoryOptions = [] } = useCommonCodeOptions(CODE_GROUP_ID_QST_CTGR);

  // 질문 카테고리 캐시 생성 (서비스별 카테고리 매핑)
  const questionCategoriesCache = useQuestionCategoriesCache(serviceOptions);

  const validateServiceName = useCallback((value: string | null | undefined): ValidationResult => {
    if (!value || value.trim() === '') {
      return { isValid: false, message: '서비스명은 필수입니다' };
    }

    /*
      const validServices = serviceOptions.map((option) => option.value);
      if (!validServices.includes(value)) {
        return { isValid: false, message: '없는 서비스명입니다' };
      }
         */

    if (value.length > 50) {
      return { isValid: false, message: '서비스명은 50자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }, []);

  const validateQuestionCategory = useCallback(
    (value: string | null | undefined, data?: RecommendedQuestionData): ValidationResult => {
      if (!value || value.trim() === '') {
        return { isValid: false, message: '질문 카테고리는 필수입니다' };
      }

      // 서비스명이 있는 경우 해당 서비스의 카테고리만 검증 (캐시 사용)
      if (data?.serviceNm) {
        const validCategories = questionCategoriesCache[data.serviceNm] || [];
        const validCategoryValues = validCategories.map((c) => c.value);

        if (validCategories.length > 0 && !validCategoryValues.includes(value)) {
          return {
            isValid: false,
            message: '해당 서비스에 존재하지 않는 질문 카테고리입니다',
          };
        }

        return { isValid: true };
      }

      // 서비스명이 없는 경우 전체 목록에서 검증
      const validCategories = questionCategoryOptions.map((option) => option.value);

      if (!validCategories.includes(value)) {
        return { isValid: false, message: '없는 질문 카테고리입니다' };
      }

      if (value.length > 100) {
        return { isValid: false, message: '질문 카테고리는 100자를 초과할 수 없습니다' };
      }

      return { isValid: true };
    },
    [questionCategoryOptions, questionCategoriesCache],
  );

  const validateAgeGroup = useCallback(
    (value: string | null | undefined, data?: RecommendedQuestionData): ValidationResult => {
      const serviceNm = data?.serviceNm;
      const isRequired = serviceNm === 'ai_calc';

      if (isRequired && (!value || value.trim() === '')) {
        return { isValid: false, message: '연령대는 필수입니다' };
      }

      if (value) {
        const validAgeGroups = ageGroupOptions.map((option) => option.value);
        if (!validAgeGroups.includes(value)) {
          return { isValid: false, message: '없는 연령대입니다' };
        }
      }

      return { isValid: true };
    },
    [ageGroupOptions],
  );

  const validateAll = useCallback(
    (data: RecommendedQuestionData): Record<string, ValidationResult> => {
      const results: Record<string, ValidationResult> = {};

      results.serviceNm = validateServiceName(data.serviceNm);
      results.qstCtgr = validateQuestionCategory(data.qstCtgr, data);
      results.displayCtnt = validateQuestionContent(data.displayCtnt);
      results.promptCtnt = validatePromptContent(data.promptCtnt);
      results.qstStyle = validateQuestionStyle(data.qstStyle);

      const parentId = data.parentId;
      const parentNm = data.parentNm;
      results.parentId = validateParentId(parentId, data);
      results.parentNm = validateParentIdName(parentNm, data);

      results.ageGrp = validateAgeGroup(data.ageGrp, data);
      results.showU17 = validateShowU17(data.showU17);
      results.impStartDate = validateImpStartDate(data.impStartDate, data);
      results.impEndDate = validateImpEndDate(data.impEndDate, data);
      results.status = validateStatus(data.status);

      return results;
    },
    [validateServiceName, validateQuestionCategory, validateAgeGroup],
  );

  return {
    validateAll,
    validateServiceName,
    validateQuestionCategory,
    validateAgeGroup,
  };
};
