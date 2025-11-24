// frontend/src/pages/data-reg/app-scheme/validation/adapters/excelAdapter.ts

import { isValidDate, toISOString } from '@/utils/dateUtils';
import type { ValidationResult } from '@/types/types';

// 엑셀 validation 함수 타입 정의
export type AppSchemeData = {
  product_menu_name?: string | null;
  description?: string | null;
  app_scheme_link?: string | null;
  one_link?: string | null;
  goods_name_list?: string | null;
  parent_id?: string | null;
  parent_title?: string | null;
  start_date?: string | Date | null;
  end_date?: string | Date | null;
};

export type ValidationFunction = (
  value: string | number | Date | null | undefined,
  row?: AppSchemeData,
) => ValidationResult;

/**
 * 앱스킴 엑셀 전용 validation 규칙
 */
export const createExcelValidationRules = (): Record<string, ValidationFunction> => {
  return {
    // product_menu_name: 필수, 200자 이하
    product_menu_name: (value, row) => {
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

    // app_scheme_link: 필수, URL 형식, 500자 이하
    app_scheme_link: (value, row) => {
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
      // URL 형식 검증
      try {
        new URL(strValue);
      } catch {
        return {
          isValid: false,
          message: '앱스킴 주소는 올바른 URL 형식이어야 합니다',
        };
      }
      return { isValid: true };
    },

    // one_link: 필수, URL 형식, 500자 이하
    one_link: (value, row) => {
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
      // URL 형식 검증
      try {
        new URL(strValue);
      } catch {
        return {
          isValid: false,
          message: '원링크 주소는 올바른 URL 형식이어야 합니다',
        };
      }
      return { isValid: true };
    },

    // goods_name_list: 선택, 200자 이하
    goods_name_list: (value, row) => {
      if (value && String(value).length > 200) {
        return {
          isValid: false,
          message: '연관 상품/서비스 리스트는 200자(공백 포함)를 초과할 수 없습니다',
        };
      }
      return { isValid: true };
    },

    // parent_id: 선택, 50자 이하
    parent_id: (value, row) => {
      if (value && String(value).length > 50) {
        return {
          isValid: false,
          message: 'MID는 50자(공백 포함)를 초과할 수 없습니다',
        };
      }
      return { isValid: true };
    },

    // parent_title: 선택, 200자 이하
    parent_title: (value, row) => {
      if (value && String(value).length > 200) {
        return {
          isValid: false,
          message: 'MID 상품/서비스명은 200자(공백 포함)를 초과할 수 없습니다',
        };
      }
      return { isValid: true };
    },

    // start_date: 필수, 날짜형태
    start_date: (value, row) => {
      if (!value) {
        return { isValid: false, message: '노출 시작 일시는 필수입니다' };
      }

      // 날짜 형태 검증
      if (!isValidDate(value as string | Date | null)) {
        return {
          isValid: false,
          message: '노출 시작 일시가 올바른 날짜 형식이 아닙니다',
        };
      }

      return { isValid: true };
    },

    // end_date: 필수, 날짜형태, start_date보다 이후
    end_date: (value, row) => {
      if (!value) {
        return { isValid: false, message: '노출 종료 일시는 필수입니다' };
      }

      // 날짜 형태 검증
      if (!isValidDate(value as string | Date | null)) {
        return {
          isValid: false,
          message: '노출 종료 일시가 올바른 날짜 형식이 아닙니다',
        };
      }

      // 시작일과 비교
      const rowData = row as Record<string, unknown>;
      if (rowData?.start_date) {
        const startDate = toISOString(rowData.start_date as string | Date | null);
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

