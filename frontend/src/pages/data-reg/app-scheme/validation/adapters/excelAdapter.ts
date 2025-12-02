// frontend/src/pages/data-reg/app-scheme/validation/adapters/excelAdapter.ts

import { isValidDate, toISOString } from '@/utils/dateUtils';
import type { ValidationResult } from '@/types/types';
import type { AppSchemeData } from '@/pages/data-reg/app-scheme/types';

export type ValidationFunction = (
  value: string | number | Date | null | undefined,
  row?: AppSchemeData,
) => ValidationResult;

/**
 * 앱스킴 엑셀 전용 validation 규칙
 */
export const createExcelValidationRules = (): Record<string, ValidationFunction> => {
  return {
    // productMenuName: 필수, 200자 이하
    productMenuName: (value, row) => {
      if (!value || String(value).trim() === '') {
        return { isValid: false, message: 'AI검색 노출버튼명은 필수입니다' };
      }
      const strValue = String(value);
      if (strValue.length > 200) {
        return {
          isValid: false,
          message: 'AI검색 노출버튼명은 200자(공백 포함)를 초과할 수 없습니다',
        };
      }
      return { isValid: true };
    },

    // description: 필수, 2000자 이하
    description: (value, row) => {
      if (!value || String(value).trim() === '') {
        return { isValid: false, message: '앱스킴 설명은 필수입니다' };
      }
      const strValue = String(value);
      if (strValue.length > 2000) {
        return {
          isValid: false,
          message: '앱스킴 설명은 2000자(공백 포함)를 초과할 수 없습니다',
        };
      }
      return { isValid: true };
    },

    // appSchemeLink: 필수, URL 형식, 500자 이하
    appSchemeLink: (value, row) => {
      if (!value || String(value).trim() === '') {
        return { isValid: false, message: '앱스킴 주소는 필수입니다' };
      }
      const strValue = String(value).trim();
      if (strValue.length > 500) {
        return {
          isValid: false,
          message: '앱스킴 주소는 500자(공백 포함)를 초과할 수 없습니다',
        };
      }
      // URL 형식 검증 (http/https 없어도 허용)
      try {
        let urlToTest = strValue;
        // http:// 또는 https://가 없으면 임시로 추가해서 검증
        if (!/^https?:\/\//i.test(strValue)) {
          urlToTest = `https://${strValue}`;
        }
        new URL(urlToTest);
      } catch {
        return {
          isValid: false,
          message: '앱스킴 주소는 올바른 URL 형식이어야 합니다',
        };
      }
      return { isValid: true };
    },

    // oneLink: 필수, URL 형식, 500자 이하
    oneLink: (value, row) => {
      if (!value || String(value).trim() === '') {
        return { isValid: false, message: '원링크 주소는 필수입니다' };
      }
      const strValue = String(value).trim();
      if (strValue.length > 500) {
        return {
          isValid: false,
          message: '원링크 주소는 500자(공백 포함)를 초과할 수 없습니다',
        };
      }
      // URL 형식 검증 (http/https 없어도 허용)
      try {
        let urlToTest = strValue;
        // http:// 또는 https://가 없으면 임시로 추가해서 검증
        if (!/^https?:\/\//i.test(strValue)) {
          urlToTest = `https://${strValue}`;
        }
        new URL(urlToTest);
      } catch {
        return {
          isValid: false,
          message: '원링크 주소는 올바른 URL 형식이어야 합니다',
        };
      }
      return { isValid: true };
    },

    // goodsNameList: 선택, 200자 이하
    goodsNameList: (value, row) => {
      if (value && String(value).length > 200) {
        return {
          isValid: false,
          message: '연관 상품/서비스 리스트는 200자(공백 포함)를 초과할 수 없습니다',
        };
      }
      return { isValid: true };
    },

    // parentId: 선택, 50자 이하
    parentId: (value, row) => {
      if (value && String(value).length > 50) {
        return {
          isValid: false,
          message: 'MID는 50자(공백 포함)를 초과할 수 없습니다',
        };
      }
      return { isValid: true };
    },

    // parentTitle: 선택, 200자 이하
    parentTitle: (value, row) => {
      if (value && String(value).length > 200) {
        return {
          isValid: false,
          message: 'MID 상품/서비스명은 200자(공백 포함)를 초과할 수 없습니다',
        };
      }
      return { isValid: true };
    },

    // startDate: 필수, 14자리 숫자 형식 (YYYYMMDDHHmmss)
    startDate: (value, row) => {
      if (!value) {
        return { isValid: false, message: '노출 시작 일시는 필수입니다' };
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

      return { isValid: true };
    },

    // endDate: 필수, 14자리 숫자 형식 (YYYYMMDDHHmmss)
    endDate: (value, row) => {
      if (!value) {
        return { isValid: false, message: '노출 종료 일시는 필수입니다' };
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
      if (rowData?.startDate) {
        const startDate = toISOString(rowData.startDate as string | Date | null);
        const endDate = toISOString(value as string | Date | null);

        if (startDate && endDate && endDate <= startDate) {
          return {
            isValid: false,
            message: '노출 종료 일시는 시작 일시보다 이후여야 합니다',
          };
        }
      }

      return { isValid: true };
    },
  };
};
