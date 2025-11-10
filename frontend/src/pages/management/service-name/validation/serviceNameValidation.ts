// frontend/src/pages/management/service-name/validation/serviceNameValidation.ts

/**
 * 서비스명 카테고리 공통 Validation 규칙
 */

// 공통 validation 결과 타입
export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

// 공통 validation 규칙 인터페이스
export interface ServiceNameData {
  category_nm?: string;
  service_cd?: string;
  status_code?: 'Y' | 'N';
}

/**
 * 공통 Validation 규칙 클래스
 */
export class ServiceNameValidator {
  // 제어 문자 검증
  private static hasControlCharacters(value: string): boolean {
    // eslint-disable-next-line no-control-regex
    return /[\x00-\x1F\x7F-\x9F]/.test(value);
  }

  // 카테고리명 validation
  static validateCategoryName(value: any): ValidationResult {
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

  // 서비스코드 validation
  static validateServiceCode(value: any): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '서비스코드는 필수입니다' };
    }

    const serviceCode = String(value).trim();

    // 영문, 숫자, 언더바만 허용 (공백, 한글 등 불허)
    if (!/^[a-zA-Z0-9_]+$/.test(serviceCode)) {
      return {
        isValid: false,
        message: '서비스코드는 영문, 숫자, 언더바(_)만 사용 가능합니다',
      };
    }

    if (this.hasControlCharacters(serviceCode)) {
      return {
        isValid: false,
        message: '알 수 없는 제어 문자가 포함되어 있습니다. 입력 문자 점검 후 다시 시도해주세요.',
      };
    }

    if (serviceCode.length > 50) {
      return { isValid: false, message: '서비스코드는 50자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 활성상태 validation
  static validateStatusCode(value: any): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '활성상태는 필수입니다' };
    }

    const validStatus = ['Y', 'N'];
    if (!validStatus.includes(String(value))) {
      return { isValid: false, message: '올바른 활성상태를 선택해주세요 (Y, N)' };
    }

    return { isValid: true };
  }

  // 전체 데이터 validation
  static validateAll(data: ServiceNameData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const categoryNameResult = this.validateCategoryName(data.category_nm);
    if (!categoryNameResult.isValid) errors.push(categoryNameResult.message!);

    const serviceCodeResult = this.validateServiceCode(data.service_cd);
    if (!serviceCodeResult.isValid) errors.push(serviceCodeResult.message!);

    const statusCodeResult = this.validateStatusCode(data.status_code);
    if (!statusCodeResult.isValid) errors.push(statusCodeResult.message!);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
