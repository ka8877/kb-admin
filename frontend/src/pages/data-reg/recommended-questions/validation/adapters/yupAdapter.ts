// frontend/src/pages/data-reg/recommended-questions/validation/adapters/yupAdapter.ts

import * as yup from 'yup';
import { useMemo } from 'react';
import {
  useRecommendedQuestionValidator,
  validateQuestionContent,
  validatePromptContent,
  validateQuestionStyle,
  validateParentId,
  validateParentIdName,
  validateShowU17,
  validateImpStartDateForCreate,
  validateImpEndDate,
} from '../recommendedQuestionValidation';

/**
 * 공통 validation을 Yup 스키마로 변환하는 어댑터 (Hook)
 */
export const useRecommendedQuestionYupSchema = () => {
  const { validateServiceName, validateQuestionCategory, validateAgeGroup } =
    useRecommendedQuestionValidator();

  return useMemo(
    () =>
      yup.object({
        serviceNm: yup
          .string()
          .nullable()
          .test('serviceNm', function (value) {
            const result = validateServiceName(value);
            return result.isValid || this.createError({ message: result.message });
          }),

        qstCtgr: yup
          .string()
          .nullable()
          .test('qstCtgr', function (value) {
            const result = validateQuestionCategory(value);
            return result.isValid || this.createError({ message: result.message });
          }),

        displayCtnt: yup
          .string()
          .nullable()
          .test('displayCtnt', function (value) {
            const result = validateQuestionContent(value);
            return result.isValid || this.createError({ message: result.message });
          }),

        promptCtnt: yup
          .string()
          .nullable()
          .test('promptCtnt', function (value) {
            const result = validatePromptContent(value);
            return result.isValid || this.createError({ message: result.message });
          }),

        qstStyle: yup
          .string()
          .nullable()
          .test('qstStyle', function (value) {
            const result = validateQuestionStyle(value);
            return result.isValid || this.createError({ message: result.message });
          }),

        parentId: yup
          .string()
          .nullable()
          .test('parentId', function (value) {
            // 전체 폼 데이터 가져오기
            const formData = this.parent;
            const result = validateParentId(value, formData);
            return result.isValid || this.createError({ message: result.message });
          }),

        parentNm: yup
          .string()
          .nullable()
          .test('parentNm', function (value) {
            // 전체 폼 데이터 가져오기
            const formData = this.parent;
            const result = validateParentIdName(value, formData);
            return result.isValid || this.createError({ message: result.message });
          }),

        ageGrp: yup
          .string()
          .nullable()
          .test('ageGrp', function (value) {
            // 전체 폼 데이터 가져오기
            const formData = this.parent;
            const result = validateAgeGroup(value, formData);
            return result.isValid || this.createError({ message: result.message });
          }),

        showU17: yup
          .string()
          .nullable()
          .test('showU17', function (value) {
            const result = validateShowU17(value);
            return result.isValid || this.createError({ message: result.message });
          }),

        impStartDate: yup
          .mixed()
          .nullable()
          .test('impStartDate', function (value) {
            const formData = this.parent;
            // 등록용이므로 현재 일시 체크 포함
            const result = validateImpStartDateForCreate(
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
            const result = validateImpEndDate(value as string | Date | null | undefined, formData);
            return result.isValid || this.createError({ message: result.message });
          }),
      }),
    [validateServiceName, validateQuestionCategory, validateAgeGroup],
  );
};
