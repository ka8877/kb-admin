// frontend/src/pages/data-reg/recommended-questions/validation/adapters/yupAdapter.ts

import * as yup from 'yup';
import { RecommendedQuestionValidator } from '../recommendedQuestionValidation';

/**
 * 공통 validation을 Yup 스키마로 변환하는 어댑터
 */
export const createRecommendedQuestionYupSchema = () => {
  return yup.object({
    service_nm: yup.string().test('service_nm', function (value) {
      const result = RecommendedQuestionValidator.validateServiceName(value);
      return result.isValid || this.createError({ message: result.message });
    }),

    qst_ctgr: yup.string().test('qst_ctgr', function (value) {
      const result = RecommendedQuestionValidator.validateQuestionCategory(value);
      return result.isValid || this.createError({ message: result.message });
    }),

    display_ctnt: yup.string().test('display_ctnt', function (value) {
      const result = RecommendedQuestionValidator.validateQuestionContent(value);
      return result.isValid || this.createError({ message: result.message });
    }),

    prompt_ctnt: yup
      .string()
      .nullable()
      .test('prompt_ctnt', function (value) {
        const result = RecommendedQuestionValidator.validatePromptContent(value);
        return result.isValid || this.createError({ message: result.message });
      }),

    qst_style: yup.string().test('qst_style', function (value) {
      const result = RecommendedQuestionValidator.validateQuestionStyle(value);
      return result.isValid || this.createError({ message: result.message });
    }),

    parentId: yup.string().test('parentId', function (value) {
      // 전체 폼 데이터 가져오기
      const formData = this.parent;
      const result = RecommendedQuestionValidator.validateParentId(value, formData);
      return result.isValid || this.createError({ message: result.message });
    }),

    parentIdName: yup.string().test('parentIdName', function (value) {
      // 전체 폼 데이터 가져오기
      const formData = this.parent;
      const result = RecommendedQuestionValidator.validateParentIdName(value, formData);
      return result.isValid || this.createError({ message: result.message });
    }),

    age_grp: yup.string().test('age_grp', function (value) {
      // 전체 폼 데이터 가져오기
      const formData = this.parent;
      const result = RecommendedQuestionValidator.validateAgeGroup(value, formData);
      return result.isValid || this.createError({ message: result.message });
    }),

    under_17_yn: yup.string().test('under_17_yn', function (value) {
      const result = RecommendedQuestionValidator.validateUnder17Yn(value);
      return result.isValid || this.createError({ message: result.message });
    }),

    imp_start_date: yup
      .mixed()
      .nullable()
      .test('imp_start_date', function (value) {
        const formData = this.parent;
        // 등록용이므로 현재 일시 체크 포함
        const result = RecommendedQuestionValidator.validateImpStartDateForCreate(value, formData);
        return result.isValid || this.createError({ message: result.message });
      }),

    imp_end_date: yup
      .mixed()
      .nullable()
      .test('imp_end_date', function (value) {
        const formData = this.parent;
        const result = RecommendedQuestionValidator.validateImpEndDate(value, formData);
        return result.isValid || this.createError({ message: result.message });
      }),
  });
};
