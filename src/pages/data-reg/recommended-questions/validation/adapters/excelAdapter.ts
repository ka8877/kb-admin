// frontend/src/pages/data-reg/recommended-questions/validation/adapters/excelAdapter.ts

import {
  RecommendedQuestionData,
  validateQuestionContent,
  validatePromptContent,
  validateQuestionStyle,
  validateParentId,
  validateParentIdName,
} from '../recommendedQuestionValidation';
import { isValidDate, toISOString } from '@/utils/dateUtils';
import type { ValidationResult } from '@/types/types';

// 엑셀 validation 함수 타입 정의
export type ValidationFunction = (
  value: string | number | Date | null | undefined,
  row?: RecommendedQuestionData,
) => ValidationResult;

/**
 * 엑셀 전용 validation 규칙
 */
export const createExcelValidationRules = (): Record<string, ValidationFunction> => {
  return {
    // serviceCd: 필수, 20자 이하
    serviceCd: (value, row) => {
      if (!value || String(value).trim() === '') {
        return { isValid: false, message: '서비스코드는 필수입니다' };
      }
      if (String(value).length > 20) {
        return { isValid: false, message: '서비스코드는 20자를 초과할 수 없습니다' };
      }
      return { isValid: true };
    },

    // displayCtnt: 공통과 같음
    displayCtnt: (value, row) => {
      const stringValue = value != null ? String(value) : null;
      const result = validateQuestionContent(stringValue);
      return {
        isValid: result.isValid,
        message: result.message,
      };
    },

    // promptCtnt: 공통과 같음 (필수 아님, 글자 수 제한만)
    promptCtnt: (value, row) => {
      const stringValue = value != null ? String(value) : null;
      const result = validatePromptContent(stringValue);
      return {
        isValid: result.isValid,
        message: result.message,
      };
    },

    // qstCtgr: 필수, 20자 이하
    qstCtgr: (value, row) => {
      if (!value || String(value).trim() === '') {
        return { isValid: false, message: '질문 카테고리는 필수입니다' };
      }
      if (String(value).length > 20) {
        return { isValid: false, message: '질문 카테고리는 20자를 초과할 수 없습니다' };
      }
      return { isValid: true };
    },

    // qstStyle: 공통과 같음
    qstStyle: (value, row) => {
      const stringValue = value != null ? String(value) : null;
      const result = validateQuestionStyle(stringValue);
      return {
        isValid: result.isValid,
        message: result.message,
      };
    },

    // parentId: 공통과 같음
    parentId: (value, row) => {
      const stringValue = value != null ? String(value) : null;
      const result = validateParentId(stringValue, row);
      return {
        isValid: result.isValid,
        message: result.message,
      };
    },

    // parentNm: 공통과 같음
    parentNm: (value, row) => {
      const stringValue = value != null ? String(value) : null;
      const result = validateParentIdName(stringValue, row);
      return {
        isValid: result.isValid,
        message: result.message,
      };
    },

    // ageGrp: 조건부 필수, 숫자형태
    ageGrp: (value, row) => {
      // serviceCd가 ai_calc인 경우 필수
      const rowData = row as Record<string, unknown>;
      const serviceCode = rowData?.serviceCd;
      const isRequired = serviceCode === 'ai_calc';

      if (isRequired) {
        if (!value || String(value).trim() === '') {
          return {
            isValid: false,
            message: 'AI 금융계산기 서비스는 연령대가 필수입니다',
          };
        }
      }

      // 값이 있으면 숫자 형태인지 확인
      if (value && String(value).trim() !== '') {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return { isValid: false, message: '연령대는 숫자 형태여야 합니다' };
        }
      }

      return { isValid: true };
    },

    // showU17: 필수, Y 또는 N
    showU17: (value, row) => {
      if (!value || String(value).trim() === '') {
        return { isValid: false, message: '17세 미만 노출 여부는 필수입니다' };
      }
      const strValue = String(value).toUpperCase();
      if (strValue !== 'Y' && strValue !== 'N') {
        return {
          isValid: false,
          message: '17세 미만 노출 여부는 Y 또는 N만 입력 가능합니다',
        };
      }
      return { isValid: true };
    },

    // impStartDate: 필수, 14자리 숫자 형식 (YYYYMMDDHHmmss)
    impStartDate: (value, row) => {
      if (!value) {
        return { isValid: false, message: '노출 시작일시는 필수입니다' };
      }

      const strValue = String(value).trim();

      // 14자리 숫자 형식 검증 (YYYYMMDDHHmmss)
      if (!/^\d{14}$/.test(strValue)) {
        return {
          isValid: false,
          message:
            '날짜 형식이 아닙니다. 14자리 숫자 형식(YYYYMMDDHHmmss)으로 입력해주세요. 예: 20251125000000',
        };
      }

      // 날짜 유효성 검증 (변환 가능한지 확인)
      if (!isValidDate(strValue as string | Date | null)) {
        return {
          isValid: false,
          message: '날짜 형식이 아닙니다. 올바른 날짜 값으로 입력해주세요.',
        };
      }

      // 현재 일시 체크
      const startDate = toISOString(value as string | Date | null);
      const now = new Date().toISOString();

      if (startDate && startDate < now) {
        return {
          isValid: false,
          message: '노출 시작일시는 현재 일시 이후여야 합니다',
        };
      }

      return { isValid: true };
    },

    // impEndDate: 필수, 14자리 숫자 형식 (YYYYMMDDHHmmss)
    impEndDate: (value, row) => {
      if (!value) {
        return { isValid: false, message: '노출 종료일시는 필수입니다' };
      }

      const strValue = String(value).trim();

      // 14자리 숫자 형식 검증 (YYYYMMDDHHmmss)
      if (!/^\d{14}$/.test(strValue)) {
        return {
          isValid: false,
          message:
            '날짜 형식이 아닙니다. 14자리 숫자 형식(YYYYMMDDHHmmss)으로 입력해주세요. 예: 20251125000000',
        };
      }

      // 날짜 유효성 검증 (변환 가능한지 확인)
      if (!isValidDate(strValue as string | Date | null)) {
        return {
          isValid: false,
          message: '날짜 형식이 아닙니다. 올바른 날짜 값으로 입력해주세요.',
        };
      }

      // 시작일과 비교
      const rowData = row as Record<string, unknown>;
      if (rowData?.impStartDate) {
        const startDate = toISOString(rowData.impStartDate as string | Date | null);
        const endDate = toISOString(value as string | Date | null);

        if (startDate && endDate && endDate <= startDate) {
          return {
            isValid: false,
            message: '노출 종료일시는 시작일시보다 이후여야 합니다',
          };
        }
      }

      return { isValid: true };
    },

    status: (value, row) => {
      if (value && !['in_service', 'out_of_service'].includes(String(value))) {
        return {
          isValid: false,
          message: 'status는 in_service 또는 out_of_service를 입력 가능합니다',
        };
      }
      return { isValid: true };
    },
  };
};

/**
 * 엑셀 데이터 중복 체크
 * 서비스코드, 질문카테고리, 연령대, 17세미만노출여부가 동일한 행이 있는지 검사
 */
export const validateExcelDuplicates = (data: Record<string, unknown>[]): string | null => {
  const duplicateMap = new Map<string, number[]>();

  data.forEach((row, index) => {
    const serviceCd = String(row.serviceCd || '').trim();
    const qstCtgr = String(row.qstCtgr || '').trim();

    let ageGrp = row.ageGrp;
    if (ageGrp !== null && ageGrp !== undefined && String(ageGrp).trim() !== '') {
      ageGrp = String(Number(ageGrp));
    } else {
      ageGrp = '';
    }

    let showU17 = row.showU17;
    if (showU17) {
      showU17 = String(showU17).toUpperCase();
    } else {
      showU17 = '';
    }

    const key = `${serviceCd}|${qstCtgr}|${ageGrp}|${showU17}`;

    if (!duplicateMap.has(key)) {
      duplicateMap.set(key, []);
    }
    duplicateMap.get(key)?.push(index + 1);
  });

  // 2. 중복 확인 (하나라도 발견되면 즉시 반환)
  for (const [key, indices] of duplicateMap) {
    if (indices.length > 1) {
      const rowsStr =
        indices.length === 2
          ? `${indices[0]}행과 ${indices[1]}행`
          : indices.map((i) => `${i}행`).join(', ');

      return `${rowsStr}의 데이터가 중복 됩니다.`;
    }
  }

  return null;
};
