// frontend/src/pages/management/common-code/validation.ts
export class CommonCodeValidator {
  static validateCategoryName(value: string): string | null {
    if (!value || value.trim() === '') {
      return '카테고리명은 필수입니다.';
    }
    // 제어 문자 검증
    if (/[\x00-\x1F\x7F]/.test(value)) {
      return '알 수 없는 제어 문자가 포함되어 있습니다.';
    }
    return null;
  }

  static validateServiceCode(value: string): string | null {
    if (!value || value.trim() === '') {
      return '코드는 필수입니다.';
    }
    if (/[\x00-\x1F\x7F]/.test(value)) {
      return '알 수 없는 제어 문자가 포함되어 있습니다.';
    }
    return null;
  }

  static validateStatusCode(value: string): string | null {
    if (!value || value.trim() === '') {
      return '활성여부는 필수입니다.';
    }
    return null;
  }

  static validateCodeType(value: string): string | null {
    if (!value || value.trim() === '') {
      return '코드 타입은 필수입니다.';
    }
    return null;
  }

  static validateAll(data: {
    code_type: string;
    category_nm: string;
    service_cd: string;
    status_code: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const codeTypeError = this.validateCodeType(data.code_type);
    if (codeTypeError) errors.push(codeTypeError);

    const categoryError = this.validateCategoryName(data.category_nm);
    if (categoryError) errors.push(categoryError);

    const serviceCodeError = this.validateServiceCode(data.service_cd);
    if (serviceCodeError) errors.push(serviceCodeError);

    const statusError = this.validateStatusCode(data.status_code);
    if (statusError) errors.push(statusError);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validate(data: {
    code_type: string;
    category_nm: string;
    service_cd: string;
    status_code: string;
  }): string[] {
    const result = CommonCodeValidator.validateAll(data);
    return result.errors;
  }
}
