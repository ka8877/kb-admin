// frontend/src/pages/data-reg/recommended-questions/validation/recommendedQuestionValidation.ts

/**
 * 추천질문 공통 Validation 규칙
 * 폼 validation과 엑셀 validation에서 공통으로 사용
 */

import { serviceOptions, ageGroupOptions, under17Options, questionCategoryOptions } from '../data';
import { isValidDate, toISOString } from '../../../../utils/dateUtils';

// 공통 validation 결과 타입
export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

// 공통 validation 규칙 인터페이스
export interface RecommendedQuestionData {
  service_nm?: string;
  qst_ctgr?: string;
  qst_ctnt?: string;
  qst_style?: string;
  parentId?: string; // 폼에서 사용
  parent_id?: string; // 엑셀에서 사용
  parentIdName?: string; // 폼에서 사용
  parent_nm?: string; // 엑셀에서 사용
  age_grp?: string;
  under_17_yn?: string;
  imp_start_date?: any; // string | Date | Dayjs
  imp_end_date?: any; // string | Date | Dayjs
  status?: string;
}

/**
 * 공통 Validation 규칙 클래스
 */
export class RecommendedQuestionValidator {
  // 서비스명 validation
  static validateServiceName(value: any): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '서비스명은 필수입니다' };
    }

    const validServices = serviceOptions.map((option) => option.value);
    if (!validServices.includes(String(value))) {
      return { isValid: false, message: '없는 서비스명입니다' };
    }

    if (String(value).length > 50) {
      return { isValid: false, message: '서비스명은 50자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 질문 카테고리 validation
  static validateQuestionCategory(value: any): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '질문 카테고리는 필수입니다' };
    }

    // 유효한 카테고리인지 확인 (questionCategoryOptions는 이미 평탄화된 배열)
    const validCategories = questionCategoryOptions.map((option) => option.value);

    if (!validCategories.includes(String(value))) {
      return { isValid: false, message: '없는 질문 카테고리입니다' };
    }

    if (String(value).length > 100) {
      return { isValid: false, message: '질문 카테고리는 100자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 질문 내용 validation
  static validateQuestionContent(value: any): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '질문 내용은 필수입니다' };
    }

    const content = String(value).trim();
    if (content.length < 5) {
      return { isValid: false, message: '질문 내용은 최소 5자 이상 입력해주세요' };
    }

    if (content.length > 500) {
      return { isValid: false, message: '질문 내용은 500자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 질문 태그 validation
  static validateQuestionStyle(value: any): ValidationResult {
    if (value && String(value).length > 200) {
      return { isValid: false, message: '질문 태그는 200자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 부모 ID validation
  static validateParentId(value: any, data?: RecommendedQuestionData): ValidationResult {
    const qstCtgr = data?.qst_ctgr;
    const isRequired = qstCtgr === 'ai_search_mid' || qstCtgr === 'ai_search_story';

    if (isRequired && (!value || String(value).trim() === '')) {
      return { isValid: false, message: '부모 ID는 필수입니다' };
    }

    if (value && String(value).length > 20) {
      return { isValid: false, message: '부모 ID는 20자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 부모 ID명 validation
  static validateParentIdName(value: any, data?: RecommendedQuestionData): ValidationResult {
    const qstCtgr = data?.qst_ctgr;
    const isRequired = qstCtgr === 'ai_search_mid' || qstCtgr === 'ai_search_story';

    if (isRequired && (!value || String(value).trim() === '')) {
      return { isValid: false, message: '부모 ID명은 필수입니다' };
    }

    if (value && String(value).length > 100) {
      return { isValid: false, message: '부모 ID명은 100자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 연령대 validation
  static validateAgeGroup(value: any, data?: RecommendedQuestionData): ValidationResult {
    const serviceNm = data?.service_nm;
    const isRequired = serviceNm === 'ai_calc';

    if (isRequired && (!value || String(value).trim() === '')) {
      return { isValid: false, message: '연령대는 필수입니다' };
    }

    if (value) {
      const validAgeGroups = ageGroupOptions.map((option) => option.value);
      if (!validAgeGroups.includes(String(value))) {
        return { isValid: false, message: '없는 연령대입니다' };
      }
    }

    return { isValid: true };
  }

  // 17세 미만 노출 여부 validation
  static validateUnder17Yn(value: any): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '17세 미만 노출 여부는 필수입니다' };
    }

    const validOptions = under17Options.map((option) => option.value);
    if (!validOptions.includes(String(value))) {
      return { isValid: false, message: '17세 미만 노출 여부는 Y 또는 N만 입력 가능합니다' };
    }

    return { isValid: true };
  }

  // 날짜 validation (공통)
  static validateDate(value: any, fieldName: string): ValidationResult {
    // 값이 비어있는 경우는 개별 메서드에서 처리하므로 여기서는 형식만 검증
    if (!isValidDate(value)) {
      return {
        isValid: false,
        message: `${fieldName} 형식이 올바르지 않습니다. (예: 2025-12-12 15:00:00 또는 20251212150000)`,
      };
    }

    return { isValid: true };
  }

  // 노출 시작 일시 validation (수정용 - 현재 일시 체크 없음)
  static validateImpStartDate(value: any, data?: RecommendedQuestionData): ValidationResult {
    if (!value || value === null || value === undefined) {
      return { isValid: false, message: '노출 시작 일시는 필수입니다' };
    }

    const dateValidation = this.validateDate(value, '노출 시작 일시');
    if (!dateValidation.isValid) {
      return dateValidation;
    }

    return { isValid: true };
  }

  // 노출 시작 일시 validation (등록용 - 현재 일시 체크 포함)
  static validateImpStartDateForCreate(
    value: any,
    data?: RecommendedQuestionData,
  ): ValidationResult {
    if (!value || value === null || value === undefined) {
      return { isValid: false, message: '노출 시작 일시는 필수입니다' };
    }

    const dateValidation = this.validateDate(value, '노출 시작 일시');
    if (!dateValidation.isValid) {
      return dateValidation;
    }

    // 현재 일자 <= 노출 시작일시 체크 (등록 시에만)
    const startDate = toISOString(value);
    if (startDate) {
      const now = new Date();
      const startDateTime = new Date(startDate);

      if (startDateTime < now) {
        return {
          isValid: false,
          message: '노출 시작 일시는 현재 일시 이후여야 합니다',
        };
      }
    }

    return { isValid: true };
  }

  // 노출 종료 일시 validation
  static validateImpEndDate(value: any, data?: RecommendedQuestionData): ValidationResult {
    if (!value || value === null || value === undefined) {
      return { isValid: false, message: '노출 종료 일시는 필수입니다' };
    }

    const dateValidation = this.validateDate(value, '노출 종료 일시');
    if (!dateValidation.isValid) {
      return dateValidation;
    }

    // 노출 시작일시 < 노출 종료일시 체크
    if (data?.imp_start_date) {
      const startDate = toISOString(data.imp_start_date);
      const endDate = toISOString(value);

      if (startDate && endDate) {
        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);

        if (endDateTime <= startDateTime) {
          return {
            isValid: false,
            message: '노출 종료 일시는 노출 시작 일시보다 커야 합니다',
          };
        }
      }
    }

    return { isValid: true };
  }

  // 상태 validation
  static validateStatus(value: any): ValidationResult {
    if (value && !['in_service', 'out_of_service'].includes(String(value))) {
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

    results.service_nm = this.validateServiceName(data.service_nm);
    results.qst_ctgr = this.validateQuestionCategory(data.qst_ctgr);
    results.qst_ctnt = this.validateQuestionContent(data.qst_ctnt);
    results.qst_style = this.validateQuestionStyle(data.qst_style);

    // 부모 ID (폼과 엑셀 필드명 통합)
    const parentId = data.parentId || data.parent_id;
    const parentIdName = data.parentIdName || data.parent_nm;
    results.parent_id = this.validateParentId(parentId, data);
    results.parent_nm = this.validateParentIdName(parentIdName, data);

    results.age_grp = this.validateAgeGroup(data.age_grp, data);
    results.under_17_yn = this.validateUnder17Yn(data.under_17_yn);
    results.imp_start_date = this.validateImpStartDate(data.imp_start_date, data);
    results.imp_end_date = this.validateImpEndDate(data.imp_end_date, data);
    results.status = this.validateStatus(data.status);

    return results;
  }

  // 유효성 검사 통과 여부 확인
  static isValid(results: Record<string, ValidationResult>): boolean {
    return Object.values(results).every((result) => result.isValid);
  }
}
