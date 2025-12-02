// frontend/src/pages/data-reg/app-scheme/validation/appSchemeValidation.ts

/**
 * 앱스킴 Validation 규칙
 */

import * as yup from 'yup';
import { isValidDate, toISOString } from '@/utils/dateUtils';

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
    productMenuName: yup
      .string()
      .required('AI검색 노출버튼명은 필수입니다')
      .trim()
      .min(1, 'AI검색 노출버튼명은 필수입니다')
      .max(200, 'AI검색 노출버튼명은 200자(공백 포함)를 초과할 수 없습니다'),

    description: yup
      .string()
      .required('앱스킴 설명은 필수입니다')
      .trim()
      .min(1, '앱스킴 설명은 필수입니다')
      .max(2000, '앱스킴 설명은 2000자(공백 포함)를 초과할 수 없습니다'),

    appSchemeLink: yup
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

    oneLink: yup
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

    goodsNameList: yup
      .string()
      .nullable()
      .max(200, '연관 상품/서비스 리스트는 200자(공백 포함)를 초과할 수 없습니다')
      .transform((value) => (value === '' ? null : value)),

    parentId: yup
      .string()
      .nullable()
      .max(50, 'MID는 50자(공백 포함)를 초과할 수 없습니다')
      .transform((value) => (value === '' ? null : value)),

    parentTitle: yup
      .string()
      .nullable()
      .max(200, 'MID 상품/서비스명은 200자(공백 포함)를 초과할 수 없습니다')
      .transform((value) => (value === '' ? null : value)),

    startDate: yup
      .mixed()
      .nullable()
      .required('노출 시작 일시는 필수입니다')
      .test('startDate', '노출 시작 일시 형식이 올바르지 않습니다', function (value) {
        if (!value) {
          return false;
        }
        try {
          return isValidDate(value as any);
        } catch (error) {
          return this.createError({
            message: '노출 시작 일시를 확인할 수 없습니다',
          });
        }
      }),

    endDate: yup
      .mixed()
      .nullable()
      .required('노출 종료 일시는 필수입니다')
      .test('endDate', '노출 종료 일시 형식이 올바르지 않습니다', function (value) {
        if (!value) {
          return false;
        }

        try {
          if (!isValidDate(value as any)) {
            return false;
          }

          // 노출 시작일시 < 노출 종료일시 체크
          const formData = this.parent;
          if (formData?.startDate) {
            const startDate = toISOString(formData.startDate as any);
            const endDate = toISOString(value as any);

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
                  message: '노출 종료 일시는 노출 시작 일시보다 커야 합니다',
                });
              }
            }
          }

          return true;
        } catch (error) {
          return this.createError({
            message: '노출 종료 일시를 확인할 수 없습니다',
          });
        }
      }),
  });
};
