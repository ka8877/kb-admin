// frontend/src/pages/data-reg/app-scheme/validation/appSchemeValidation.ts

/**
 * 앱스킴 Validation 규칙
 */

import * as yup from 'yup';
import { isValidDate, toISOString } from '@/utils/dateUtils';
import {
  PRODUCT_MENU_NAME,
  DESCRIPTION,
  APP_SCHEME_LINK,
  ONE_LINK,
  GOODS_NAME_LIST,
  PARENT_ID,
  PARENT_TITLE,
  START_DATE,
  END_DATE,
} from '@/pages/data-reg/app-scheme/data';

/**
 * URL 유효성 검증 (http/https 없어도 허용)
 */
const isValidUrlFormat = (value: string): boolean => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  const trimmedValue = value.trim();

  // 빈 문자열 체크
  if (trimmedValue === '') {
    return false;
  }

  // http:// 또는 https://가 없으면 임시로 추가해서 검증
  let urlToTest = trimmedValue;
  if (!/^https?:\/\//i.test(trimmedValue)) {
    urlToTest = `https://${trimmedValue}`;
  }

  try {
    new URL(urlToTest);
    return true;
  } catch {
    return false;
  }
};

/**
 * 앱스킴 Yup 스키마 생성
 */
export const createAppSchemeYupSchema = () => {
  return yup.object({
    [PRODUCT_MENU_NAME]: yup
      .string()
      .required('AI 검색 노출 버튼명은 필수입니다')
      .trim()
      .min(1, 'AI 검색 노출 버튼명은 필수입니다')
      .max(200, 'AI 검색 노출 버튼명은 200자(공백 포함)를 초과할 수 없습니다'),

    [DESCRIPTION]: yup
      .string()
      .required('앱스킴 설명은 필수입니다')
      .trim()
      .min(1, '앱스킴 설명은 필수입니다')
      .max(2000, '앱스킴 설명은 2000자(공백 포함)를 초과할 수 없습니다'),

    [APP_SCHEME_LINK]: yup
      .string()
      .required('앱스킴 주소는 필수입니다')
      .trim()
      .min(1, '앱스킴 주소는 필수입니다')
      .max(500, '앱스킴 주소는 500자(공백 포함)를 초과할 수 없습니다')
      .test('url-format', '앱스킴 주소는 올바른 URL 형식이어야 합니다', function (value) {
        if (!value) return false;
        try {
          const isValid = isValidUrlFormat(value);
          if (!isValid) {
            return this.createError({
              message: '앱스킴 주소는 올바른 URL 형식이어야 합니다',
            });
          }
          return true;
        } catch (error) {
          return this.createError({
            message: '앱스킴 주소 형식을 확인할 수 없습니다',
          });
        }
      }),

    [ONE_LINK]: yup
      .string()
      .required('원링크 주소는 필수입니다')
      .trim()
      .min(1, '원링크 주소는 필수입니다')
      .max(500, '원링크 주소는 500자(공백 포함)를 초과할 수 없습니다')
      .test('url-format', '원링크 주소는 올바른 URL 형식이어야 합니다', function (value) {
        if (!value) return false;
        try {
          const isValid = isValidUrlFormat(value);
          if (!isValid) {
            return this.createError({
              message: '원링크 주소는 올바른 URL 형식이어야 합니다',
            });
          }
          return true;
        } catch (error) {
          return this.createError({
            message: '원링크 주소 형식을 확인할 수 없습니다',
          });
        }
      }),

    [GOODS_NAME_LIST]: yup
      .string()
      .nullable()
      .max(200, '연관 상품/서비스 리스트는 200자(공백 포함)를 초과할 수 없습니다')
      .transform((value) => (value === '' ? null : value)),

    [PARENT_ID]: yup
      .string()
      .nullable()
      .max(50, 'MID는 50자(공백 포함)를 초과할 수 없습니다')
      .transform((value) => (value === '' ? null : value)),

    [PARENT_TITLE]: yup
      .string()
      .nullable()
      .max(200, 'MID 상품/서비스명은 200자(공백 포함)를 초과할 수 없습니다')
      .transform((value) => (value === '' ? null : value)),

    [START_DATE]: yup
      .mixed()
      .nullable()
      .required('노출 시작일시는 필수입니다')
      .test('startDate', '노출 시작일시 형식이 올바르지 않습니다', function (value) {
        if (!value) {
          return false;
        }
        try {
          return isValidDate(value as string | Date | null);
        } catch {
          return this.createError({
            message: '노출 시작일시를 확인할 수 없습니다',
          });
        }
      }),

    [END_DATE]: yup
      .mixed()
      .nullable()
      .required('노출 종료일시는 필수입니다')
      .test('endDate', '노출 종료일시 형식이 올바르지 않습니다', function (value) {
        if (!value) {
          return false;
        }

        try {
          if (!isValidDate(value as string | Date | null)) {
            return false;
          }

          // 노출 시작일시 < 노출 종료일시 체크
          const formData = this.parent;
          if (formData?.[START_DATE]) {
            const startDate = toISOString(formData[START_DATE] as string | Date | null);
            const endDate = toISOString(value as string | Date | null);

            if (startDate && endDate) {
              const startDateTime = new Date(startDate);
              const endDateTime = new Date(endDate);

              if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
                return this.createError({
                  message: '날짜 변환 중 오류가 발생했습니다',
                });
              }

              if (endDateTime <= startDateTime) {
                return this.createError({
                  message: '노출 종료일시는 노출 시작일시보다 커야 합니다',
                });
              }
            }
          }

          return true;
        } catch {
          return this.createError({
            message: '노출 종료일시를 확인할 수 없습니다',
          });
        }
      }),
  });
};
