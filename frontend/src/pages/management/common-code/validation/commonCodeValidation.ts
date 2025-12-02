// frontend/src/pages/management/common-code/validation/commonCodeValidation.ts

/**
 * 공통 코드 관리 Validation 규칙
 */

// 필드별 validation 결과 타입
export type FieldValidationResult = {
  [key: string]: ValidationResult;
};

// 공통 validation 결과 타입
export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

// 공통 validation 규칙 인터페이스
export interface CommonCodeData {
  code_type?: string;
  category_nm?: string;
  service_cd?: string;
  status_code?: string;
  parent_service_cd?: string;
}

/**
 * 공통 Validation 규칙 클래스
 */
export class CommonCodeValidator {
  // 제어 문자 검증
  private static hasControlCharacters(value: string): boolean {
    // eslint-disable-next-line no-control-regex
    return /[\x00-\x1F\x7F-\x9F]/.test(value);
  }

  // 코드 타입 validation
  static validateCodeType(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '코드 타입은 필수입니다' };
    }

    return { isValid: true };
  }

  // 카테고리명 validation
  static validateCategoryName(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '카테고리명은 필수입니다' };
    }

    const categoryName = String(value).trim();

    if (this.hasControlCharacters(categoryName)) {
      return {
        isValid: false,
        message: '알 수 없는 제어 문자가 포함되어 있습니다. 입력 문자 점검 후 다시 시도해주세요.',
      };
    }

    if (categoryName.length > 100) {
      return { isValid: false, message: '카테고리명은 100자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 서비스 코드 validation
  static validateServiceCode(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '코드는 필수입니다' };
    }

    const serviceCode = String(value).trim();

    if (this.hasControlCharacters(serviceCode)) {
      return {
        isValid: false,
        message: '알 수 없는 제어 문자가 포함되어 있습니다. 입력 문자 점검 후 다시 시도해주세요.',
      };
    }

    if (serviceCode.length > 50) {
      return { isValid: false, message: '코드는 50자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 활성여부 validation
  static validateStatusCode(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '활성여부는 필수입니다' };
    }

    const validStatus = ['Y', 'N'];
    if (!validStatus.includes(String(value))) {
      return { isValid: false, message: '올바른 활성여부를 선택해주세요 (Y, N)' };
    }

    return { isValid: true };
  }

  // 서비스 그룹 코드 validation (질문 카테고리일 때만)
  static validateParentServiceCode(
    value: string | null | undefined,
    codeType: string | null | undefined,
  ): ValidationResult {
    // 질문 카테고리가 아니면 검증 skip
    if (codeType !== 'QUESTION_CATEGORY') {
      return { isValid: true };
    }

    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '서비스 그룹 코드는 필수입니다' };
    }

    const parentCode = String(value).trim();

    if (this.hasControlCharacters(parentCode)) {
      return {
        isValid: false,
        message: '알 수 없는 제어 문자가 포함되어 있습니다. 입력 문자 점검 후 다시 시도해주세요.',
      };
    }

    return { isValid: true };
  }

  // 전체 데이터 validation
  static validateAll(data: CommonCodeData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const codeTypeResult = this.validateCodeType(data.code_type);
    if (!codeTypeResult.isValid) errors.push(codeTypeResult.message!);

    const categoryNameResult = this.validateCategoryName(data.category_nm);
    if (!categoryNameResult.isValid) errors.push(categoryNameResult.message!);

    const serviceCodeResult = this.validateServiceCode(data.service_cd);
    if (!serviceCodeResult.isValid) errors.push(serviceCodeResult.message!);

    const statusCodeResult = this.validateStatusCode(data.status_code);
    if (!statusCodeResult.isValid) errors.push(statusCodeResult.message!);

    const parentServiceCodeResult = this.validateParentServiceCode(
      data.parent_service_cd,
      data.code_type,
    );
    if (!parentServiceCodeResult.isValid) errors.push(parentServiceCodeResult.message!);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // 필드별 validation 결과 반환
  static validateByField(data: CommonCodeData): FieldValidationResult {
    return {
      code_type: this.validateCodeType(data.code_type),
      category_nm: this.validateCategoryName(data.category_nm),
      service_cd: this.validateServiceCode(data.service_cd),
      status_code: this.validateStatusCode(data.status_code),
      parent_service_cd: this.validateParentServiceCode(data.parent_service_cd, data.code_type),
    };
  }
}
