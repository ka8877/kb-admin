// frontend/src/pages/data-reg/recommended-questions/validation/adapters/excelAdapter.ts

import { RecommendedQuestionValidator } from '../recommendedQuestionValidation';

// 엑셀 validation 함수 타입 정의
export type ValidationResult = {
  isValid: boolean;
  errorMessage?: string;
};

export type ValidationFunction = (value: any, row?: any) => ValidationResult;

/**
 * 공통 validation을 엑셀 ValidationFunction으로 변환하는 어댑터
 */
export const createExcelValidationRules = (): Record<string, ValidationFunction> => {
  return {
    service_nm: (value, row) => {
      const result = RecommendedQuestionValidator.validateServiceName(value);
      return {
        isValid: result.isValid,
        errorMessage: result.message,
      };
    },

    qst_ctgr: (value, row) => {
      const result = RecommendedQuestionValidator.validateQuestionCategory(value);
      return {
        isValid: result.isValid,
        errorMessage: result.message,
      };
    },

    qst_ctnt: (value, row) => {
      const result = RecommendedQuestionValidator.validateQuestionContent(value);
      return {
        isValid: result.isValid,
        errorMessage: result.message,
      };
    },

    qst_style: (value, row) => {
      const result = RecommendedQuestionValidator.validateQuestionStyle(value);
      return {
        isValid: result.isValid,
        errorMessage: result.message,
      };
    },

    parent_id: (value, row) => {
      const result = RecommendedQuestionValidator.validateParentId(value, row);
      return {
        isValid: result.isValid,
        errorMessage: result.message,
      };
    },

    parent_nm: (value, row) => {
      const result = RecommendedQuestionValidator.validateParentIdName(value, row);
      return {
        isValid: result.isValid,
        errorMessage: result.message,
      };
    },

    age_grp: (value, row) => {
      const result = RecommendedQuestionValidator.validateAgeGroup(value, row);
      return {
        isValid: result.isValid,
        errorMessage: result.message,
      };
    },

    under_17_yn: (value, row) => {
      const result = RecommendedQuestionValidator.validateUnder17Yn(value);
      return {
        isValid: result.isValid,
        errorMessage: result.message,
      };
    },

    imp_start_date: (value, row) => {
      // 엑셀 등록용이므로 현재 일시 체크 포함
      const result = RecommendedQuestionValidator.validateImpStartDateForCreate(value, row);
      return {
        isValid: result.isValid,
        errorMessage: result.message,
      };
    },

    imp_end_date: (value, row) => {
      const result = RecommendedQuestionValidator.validateImpEndDate(value, row);
      return {
        isValid: result.isValid,
        errorMessage: result.message,
      };
    },

    status: (value, row) => {
      const result = RecommendedQuestionValidator.validateStatus(value);
      return {
        isValid: result.isValid,
        errorMessage: result.message,
      };
    },
  };
};
