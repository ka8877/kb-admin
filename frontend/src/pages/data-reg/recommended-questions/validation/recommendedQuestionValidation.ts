// frontend/src/pages/data-reg/recommended-questions/validation/recommendedQuestionValidation.ts

/**
 * 추천질문 공통 Validation 규칙
 * 폼 validation과 엑셀 validation에서 공통으로 사용
 */

import { serviceOptions, ageGroupOptions, questionCategoryOptions } from '../data';
import { yesNoOptions } from '@/constants/options';
import { isValidDate, toISOString } from '@/utils/dateUtils';
import type { ValidationResult } from '@/types/types';
// 공통 validation 규칙 인터페이스
export interface RecommendedQuestionData {
  serviceNm?: string | null;
  qstCtgr?: string | null;
  displayCtnt?: string | null;
  promptCtnt?: string | null;
  qstStyle?: string | null;
  parentId?: string | null;
  parentNm?: string | null;
  ageGrp?: string | null;
  showU17?: string | null;
  impStartDate?: string | Date | null;
  impEndDate?: string | Date | null;
  status?: string | null;
}

/**
 * 공통 Validation 규칙 클래스
 */
export class RecommendedQuestionValidator {
  // 서비스명 validation
  static validateServiceName(value: string | null | undefined): ValidationResult {
    if (!value || value.trim() === '') {
      return { isValid: false, message: '서비스명은 필수입니다' };
    }

    const validServices = serviceOptions.map((option) => option.value);
    if (!validServices.includes(value)) {
      return { isValid: false, message: '없는 서비스명입니다' };
    }

    if (value.length > 50) {
      return { isValid: false, message: '서비스명은 50자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 질문 카테고리 validation
  static validateQuestionCategory(value: string | null | undefined): ValidationResult {
    if (!value || value.trim() === '') {
      return { isValid: false, message: '질문 카테고리는 필수입니다' };
    }

    // 유효한 카테고리인지 확인 (questionCategoryOptions는 이미 평탄화된 배열)
    const validCategories = questionCategoryOptions.map((option) => option.value);

    if (!validCategories.includes(value)) {
      return { isValid: false, message: '없는 질문 카테고리입니다' };
    }

    if (value.length > 100) {
      return { isValid: false, message: '질문 카테고리는 100자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 질문 내용 validation
  static validateQuestionContent(value: string | null | undefined): ValidationResult {
    if (!value || value.trim() === '') {
      return { isValid: false, message: '질문 내용은 필수입니다' };
    }

    const content = value.trim();
    if (content.length < 5) {
      return { isValid: false, message: '질문 내용은 최소 5자 이상 입력해주세요' };
    }

    if (content.length > 500) {
      return { isValid: false, message: '질문 내용은 500자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // AI input 쿼리 validation (필수 아님, 글자 수 제한만)
  static validatePromptContent(value: string | null | undefined): ValidationResult {
    if (value && value.length > 1000) {
      return { isValid: false, message: 'AI input 쿼리는 1000자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 질문 태그 validation
  static validateQuestionStyle(value: string | null | undefined): ValidationResult {
    if (value && value.length > 200) {
      return { isValid: false, message: '질문 태그는 200자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 부모 ID validation
  static validateParentId(
    value: string | null | undefined,
    data?: RecommendedQuestionData,
  ): ValidationResult {
    const qstCtgr = data?.qstCtgr;
    const isRequired = qstCtgr === 'ai_search_mid' || qstCtgr === 'ai_search_story';

    if (isRequired && (!value || value.trim() === '')) {
      return { isValid: false, message: '부모 ID는 필수입니다' };
    }

    if (value && value.length > 20) {
      return { isValid: false, message: '부모 ID는 20자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 부모 ID명 validation
  static validateParentIdName(
    value: string | null | undefined,
    data?: RecommendedQuestionData,
  ): ValidationResult {
    const qstCtgr = data?.qstCtgr;
    const isRequired = qstCtgr === 'ai_search_mid' || qstCtgr === 'ai_search_story';

    if (isRequired && (!value || value.trim() === '')) {
      return { isValid: false, message: '부모 ID명은 필수입니다' };
    }

    if (value && value.length > 100) {
      return { isValid: false, message: '부모 ID명은 100자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 연령대 validation
  static validateAgeGroup(
    value: string | null | undefined,
    data?: RecommendedQuestionData,
  ): ValidationResult {
    const serviceNm = data?.serviceNm;
    const isRequired = serviceNm === 'ai_calc';

    if (isRequired && (!value || value.trim() === '')) {
      return { isValid: false, message: '연령대는 필수입니다' };
    }

    if (value) {
      const validAgeGroups = ageGroupOptions.map((option) => option.value);
      if (!validAgeGroups.includes(value)) {
        return { isValid: false, message: '없는 연령대입니다' };
      }
    }

    return { isValid: true };
  }

  // 17세 미만 노출 여부 validation
  static validateShowU17(value: string | null | undefined): ValidationResult {
    if (!value || value.trim() === '') {
      return { isValid: false, message: '17세 미만 노출 여부는 필수입니다' };
    }

    const validOptions = yesNoOptions.map((option) => option.value);
    if (!validOptions.includes(value)) {
      return { isValid: false, message: '17세 미만 노출 여부는 Y 또는 N만 입력 가능합니다' };
    }

    return { isValid: true };
  }

  // 날짜 validation (공통)
  static validateDate(
    value: string | Date | null | undefined,
    fieldName: string,
  ): ValidationResult {
    // 값이 비어있는 경우는 개별 메서드에서 처리하므로 여기서는 형식만 검증
    if (!isValidDate(value as string | Date | null)) {
      return {
        isValid: false,
        message: `${fieldName} 형식이 올바르지 않습니다. (예: 2025-12-12 15:00:00 또는 20251212150000)`,
      };
    }

    return { isValid: true };
  }

  // 노출 시작일시 validation (수정용 - 현재 일시 체크 없음)
  static validateImpStartDate(
    value: string | Date | null | undefined,
    data?: RecommendedQuestionData,
  ): ValidationResult {
    if (!value || value === null || value === undefined) {
      return { isValid: false, message: '노출 시작일시는 필수입니다' };
    }

    const dateValidation = this.validateDate(value, '노출 시작일시');
    if (!dateValidation.isValid) {
      return dateValidation;
    }

    return { isValid: true };
  }

  // 노출 시작일시 validation (등록용 - 현재 일시 체크 포함)
  static validateImpStartDateForCreate(
    value: string | Date | null | undefined,
    data?: RecommendedQuestionData,
  ): ValidationResult {
    if (!value || value === null || value === undefined) {
      return { isValid: false, message: '노출 시작일시는 필수입니다' };
    }

    const dateValidation = this.validateDate(value, '노출 시작일시');
    if (!dateValidation.isValid) {
      return dateValidation;
    }

    // 현재 일자 <= 노출 시작일시 체크 (등록 시에만)
    const startDate = toISOString(value as string | Date | null);
    if (startDate) {
      const now = new Date();
      const startDateTime = new Date(startDate);

      if (startDateTime < now) {
        return {
          isValid: false,
          message: '노출 시작일시는 현재 일시 이후여야 합니다',
        };
      }
    }

    return { isValid: true };
  }

  // 노출 종료일시 validation
  static validateImpEndDate(
    value: string | Date | null | undefined,
    data?: RecommendedQuestionData,
  ): ValidationResult {
    if (!value || value === null || value === undefined) {
      return { isValid: false, message: '노출 종료일시는 필수입니다' };
    }

    const dateValidation = this.validateDate(value, '노출 종료일시');
    if (!dateValidation.isValid) {
      return dateValidation;
    }

    // 노출 시작일시 < 노출 종료일시 체크
    if (data?.impStartDate) {
      const startDate = toISOString(data.impStartDate as string | Date | null);
      const endDate = toISOString(value as string | Date | null);

      if (startDate && endDate) {
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);

        if (endDateTime <= startDateTime) {
          return {
            isValid: false,
            message: '노출 종료일시는 노출 시작일시보다 커야 합니다',
          };
        }
      }
    }

    return { isValid: true };
  }

  // 상태 validation
  static validateStatus(value: string | null | undefined): ValidationResult {
    if (value && !['in_service', 'out_of_service'].includes(value)) {
      return {
        isValid: false,
        message: 'status는 in_service 또는 out_of_service만 입력 가능합니다',
      };
    }

    return { isValid: true };
  }

  // 전체 데이터 validation
  static validateAll(data: RecommendedQuestionData): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};

    results.serviceNm = this.validateServiceName(data.serviceNm);
    results.qstCtgr = this.validateQuestionCategory(data.qstCtgr);
    results.displayCtnt = this.validateQuestionContent(data.displayCtnt);
    results.promptCtnt = this.validatePromptContent(data.promptCtnt);
    results.qstStyle = this.validateQuestionStyle(data.qstStyle);

    // 부모 ID (폼과 엑셀 필드명 통합)
    const parentId = data.parentId;
    const parentNm = data.parentNm;
    results.parentId = this.validateParentId(parentId, data);
    results.parentNm = this.validateParentIdName(parentNm, data);

    results.ageGrp = this.validateAgeGroup(data.ageGrp, data);
    results.showU17 = this.validateShowU17(data.showU17);
    results.impStartDate = this.validateImpStartDate(data.impStartDate, data);
    results.impEndDate = this.validateImpEndDate(data.impEndDate, data);
    results.status = this.validateStatus(data.status);

    return results;
  }

  // 유효성 검사 통과 여부 확인
  static isValid(results: Record<string, ValidationResult>): boolean {
    return Object.values(results).every((result) => result.isValid);
  }
}
