// frontend/src/pages/data-reg/app-scheme/validation/appSchemeValidation.ts

/**
 * 앱스킴 Validation 규칙
 */

import * as yup from 'yup';
import { isValidDate, toISOString } from '@/utils/dateUtils';

/**
 * 앱스킴 Yup 스키마 생성
 */
export const createAppSchemeYupSchema = () => {
  return yup.object({
    product_menu_name: yup
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

    app_scheme_link: yup
      .string()
      .required('앱스킴 주소는 필수입니다')
      .trim()
      .min(1, '앱스킴 주소는 필수입니다')
      .max(500, '앱스킴 주소는 500자(공백 포함)를 초과할 수 없습니다')
      .url('앱스킴 주소는 올바른 URL 형식이어야 합니다'),

    one_link: yup
      .string()
      .required('원링크 주소는 필수입니다')
      .trim()
      .min(1, '원링크 주소는 필수입니다')
      .max(500, '원링크 주소는 500자(공백 포함)를 초과할 수 없습니다')
      .url('원링크 주소는 올바른 URL 형식이어야 합니다'),

    goods_name_list: yup
      .string()
      .nullable()
      .max(200, '연관 상품/서비스 리스트는 200자(공백 포함)를 초과할 수 없습니다')
      .transform((value) => (value === '' ? null : value)),

    parent_id: yup
      .string()
      .nullable()
      .max(50, 'MID는 50자(공백 포함)를 초과할 수 없습니다')
      .transform((value) => (value === '' ? null : value)),

    parent_title: yup
      .string()
      .nullable()
      .max(200, 'MID 상품/서비스명은 200자(공백 포함)를 초과할 수 없습니다')
      .transform((value) => (value === '' ? null : value)),

    start_date: yup
      .mixed()
      .nullable()
      .required('노출 시작 일시는 필수입니다')
      .test('start_date', '노출 시작 일시 형식이 올바르지 않습니다', function (value) {
        if (!value) return false;
        return isValidDate(value as any);
      }),

    end_date: yup
      .mixed()
      .nullable()
      .required('노출 종료 일시는 필수입니다')
      .test('end_date', '노출 종료 일시 형식이 올바르지 않습니다', function (value) {
        if (!value) return false;
        if (!isValidDate(value as any)) return false;

        // 노출 시작일시 < 노출 종료일시 체크
        const formData = this.parent;
        if (formData?.start_date) {
          const startDate = toISOString(formData.start_date);
          const endDate = toISOString(value);

          if (startDate && endDate) {
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate);

            if (endDateTime <= startDateTime) {
              return this.createError({
                message: '노출 종료 일시는 노출 시작 일시보다 커야 합니다',
              });
            }
          }
        }

        return true;
      }),
  });
};

