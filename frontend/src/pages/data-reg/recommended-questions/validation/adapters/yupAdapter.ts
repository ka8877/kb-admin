// frontend/src/pages/data-reg/recommended-questions/validation/adapters/yupAdapter.ts

import * as yup from 'yup';
import { RecommendedQuestionValidator } from '../recommendedQuestionValidation';

/**
 * 공통 validation을 Yup 스키마로 변환하는 어댑터
 */
export const createRecommendedQuestionYupSchema = () => {
  return yup.object({
    serviceNm: yup.string().test('serviceNm', function (value) {
      const result = RecommendedQuestionValidator.validateServiceName(value);
      return result.isValid || this.createError({ message: result.message });
    }),

    qstCtgr: yup.string().test('qstCtgr', function (value) {
      const result = RecommendedQuestionValidator.validateQuestionCategory(value);
      return result.isValid || this.createError({ message: result.message });
    }),

    displayCtnt: yup.string().test('displayCtnt', function (value) {
      const result = RecommendedQuestionValidator.validateQuestionContent(value);
      return result.isValid || this.createError({ message: result.message });
    }),

    promptCtnt: yup
      .string()
      .nullable()
      .test('promptCtnt', function (value) {
        const result = RecommendedQuestionValidator.validatePromptContent(value);
        return result.isValid || this.createError({ message: result.message });
      }),

    qstStyle: yup.string().test('qstStyle', function (value) {
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

    ageGrp: yup.string().test('ageGrp', function (value) {
      // 전체 폼 데이터 가져오기
      const formData = this.parent;
      const result = RecommendedQuestionValidator.validateAgeGroup(value, formData);
      return result.isValid || this.createError({ message: result.message });
    }),

    showU17: yup.string().test('showU17', function (value) {
      const result = RecommendedQuestionValidator.validateShowU17(value);
      return result.isValid || this.createError({ message: result.message });
    }),

    impStartDate: yup
      .mixed()
      .nullable()
      .test('impStartDate', function (value) {
        const formData = this.parent;
        // 등록용이므로 현재 일시 체크 포함
        const result = RecommendedQuestionValidator.validateImpStartDateForCreate(
          value as string | Date | null | undefined,
          formData,
        );
        return result.isValid || this.createError({ message: result.message });
      }),

    impEndDate: yup
      .mixed()
      .nullable()
      .test('impEndDate', function (value) {
        const formData = this.parent;
        const result = RecommendedQuestionValidator.validateImpEndDate(
          value as string | Date | null | undefined,
          formData,
        );
        return result.isValid || this.createError({ message: result.message });
      }),
  });
};
