// frontend/src/pages/data-reg/recommended-questions/validation/adapters/excelAdapter.ts

import {
  RecommendedQuestionValidator,
  RecommendedQuestionData,
} from '../recommendedQuestionValidation';
import { isValidDate, toISOString } from '@/utils/dateUtils';

// 엑셀 validation 함수 타입 정의
export type ValidationResult = {
  isValid: boolean;
  errorMessage?: string;
};

export type ValidationFunction = (
  value: string | number | Date | null | undefined,
  row?: RecommendedQuestionData,
) => ValidationResult;

/**
 * 엑셀 전용 validation 규칙
 */
export const createExcelValidationRules = (): Record<string, ValidationFunction> => {
  return {
    // service_cd: 필수, 20자 이하
    service_cd: (value, row) => {
      if (!value || String(value).trim() === '') {
        return { isValid: false, errorMessage: '서비스코드는 필수입니다' };
      }
      if (String(value).length > 20) {
        return { isValid: false, errorMessage: '서비스코드는 20자를 초과할 수 없습니다' };
      }
      return { isValid: true };
    },

    // qst_ctnt: 공통과 같음
    qst_ctnt: (value, row) => {
      const stringValue = value != null ? String(value) : null;
      const result = RecommendedQuestionValidator.validateQuestionContent(stringValue);
      return {
        isValid: result.isValid,
        errorMessage: result.message,
      };
    },

    // qst_ctgr: 필수, 20자 이하
    qst_ctgr: (value, row) => {
      if (!value || String(value).trim() === '') {
        return { isValid: false, errorMessage: '질문 카테고리는 필수입니다' };
      }
      if (String(value).length > 20) {
        return { isValid: false, errorMessage: '질문 카테고리는 20자를 초과할 수 없습니다' };
      }
      return { isValid: true };
    },

    // qst_style: 공통과 같음
    qst_style: (value, row) => {
      const stringValue = value != null ? String(value) : null;
      const result = RecommendedQuestionValidator.validateQuestionStyle(stringValue);
      return {
        isValid: result.isValid,
        errorMessage: result.message,
      };
    },

    // parent_id: 공통과 같음
    parent_id: (value, row) => {
      const stringValue = value != null ? String(value) : null;
      const result = RecommendedQuestionValidator.validateParentId(stringValue, row);
      return {
        isValid: result.isValid,
        errorMessage: result.message,
      };
    },

    // parent_nm: 공통과 같음
    parent_nm: (value, row) => {
      const stringValue = value != null ? String(value) : null;
      const result = RecommendedQuestionValidator.validateParentIdName(stringValue, row);
      return {
        isValid: result.isValid,
        errorMessage: result.message,
      };
    },

    // age_grp: 조건부 필수, 숫자형태
    age_grp: (value, row) => {
      // service_cd가 ai_calc인 경우 필수
      const rowData = row as Record<string, unknown>;
      const serviceCode = rowData?.service_cd;
      const isRequired = serviceCode === 'ai_calc';

      if (isRequired) {
        if (!value || String(value).trim() === '') {
          return {
            isValid: false,
            errorMessage: 'AI 금융계산기 서비스는 연령대가 필수입니다',
          };
        }
      }

      // 값이 있으면 숫자 형태인지 확인
      if (value && String(value).trim() !== '') {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return { isValid: false, errorMessage: '연령대는 숫자 형태여야 합니다' };
        }
      }

      return { isValid: true };
    },

    // under_17_yn: 필수, Y 또는 N
    under_17_yn: (value, row) => {
      if (!value || String(value).trim() === '') {
        return { isValid: false, errorMessage: '17세 미만 노출 여부는 필수입니다' };
      }
      const strValue = String(value).toUpperCase();
      if (strValue !== 'Y' && strValue !== 'N') {
        return { isValid: false, errorMessage: '17세 미만 노출 여부는 Y 또는 N만 입력 가능합니다' };
      }
      return { isValid: true };
    },

    // imp_start_date: 필수, 날짜형태, 현재일 <= 노출시작일자
    imp_start_date: (value, row) => {
      if (!value) {
        return { isValid: false, errorMessage: '노출 시작 일시는 필수입니다' };
      }

      // 날짜 형태 검증
      if (!isValidDate(value as string | Date | null)) {
        return {
          isValid: false,
          errorMessage: '노출 시작 일시가 올바른 날짜 형식이 아닙니다',
        };
      }

      // 현재 일시 체크
      const startDate = toISOString(value as string | Date | null);
      const now = new Date().toISOString();

      if (startDate && startDate < now) {
        return {
          isValid: false,
          errorMessage: '노출 시작 일시는 현재 일시 이후여야 합니다',
        };
      }

      return { isValid: true };
    },

    // imp_end_date: 필수, 날짜형태, 노출시작일자 < 노출종료일자
    imp_end_date: (value, row) => {
      if (!value) {
        return { isValid: false, errorMessage: '노출 종료 일시는 필수입니다' };
      }

      // 날짜 형태 검증
      if (!isValidDate(value as string | Date | null)) {
        return {
          isValid: false,
          errorMessage: '노출 종료 일시가 올바른 날짜 형식이 아닙니다',
        };
      }

      // 시작일과 비교
      const rowData = row as Record<string, unknown>;
      if (rowData?.imp_start_date) {
        const startDate = toISOString(rowData.imp_start_date as string | Date | null);
        const endDate = toISOString(value as string | Date | null);

        if (startDate && endDate && endDate <= startDate) {
          return {
            isValid: false,
            errorMessage: '노출 종료 일시는 시작 일시보다 이후여야 합니다',
          };
        }
      }

      return { isValid: true };
    },

    status: (value, row) => {
      if (value && !['in_service', 'out_of_service'].includes(String(value))) {
        return {
          isValid: false,
          errorMessage: 'status는 in_service 또는 out_of_service를 입력 가능합니다',
        };
      }
      return { isValid: true };
    },
  };
};
