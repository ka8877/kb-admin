// frontend/src/pages/management/common-code/validation/commonCodeValidation.ts

/**
 * 공통 코드 관리 Validation 규칙
 */

// validation 결과 타입
export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

// 필드별 validation 결과 타입
export type FieldValidationResult = {
  [key: string]: ValidationResult;
};

/**
 * 코드그룹(대분류) Validation
 */
export class CodeGroupValidator {
  // 제어 문자 검증
  private static hasControlCharacters(value: string): boolean {
    // eslint-disable-next-line no-control-regex
    return /[\x00-\x1F\x7F-\x9F]/.test(value);
  }

  // 그룹코드 validation
  static validateGroupCode(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '그룹코드는 필수입니다' };
    }

    const groupCode = String(value).trim();

    if (this.hasControlCharacters(groupCode)) {
      return {
        isValid: false,
        message: '알 수 없는 제어 문자가 포함되어 있습니다. 입력 문자 점검 후 다시 시도해주세요.',
      };
    }

    if (groupCode.length > 50) {
      return { isValid: false, message: '그룹코드는 50자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 그룹명 validation
  static validateGroupName(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '그룹명은 필수입니다' };
    }

    const groupName = String(value).trim();

    if (this.hasControlCharacters(groupName)) {
      return {
        isValid: false,
        message: '알 수 없는 제어 문자가 포함되어 있습니다. 입력 문자 점검 후 다시 시도해주세요.',
      };
    }

    if (groupName.length > 100) {
      return { isValid: false, message: '그룹명은 100자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 필드별 validation 결과 반환
  static validateByField(data: { groupCode?: string; groupName?: string }): FieldValidationResult {
    return {
      groupCode: this.validateGroupCode(data.groupCode),
      groupName: this.validateGroupName(data.groupName),
    };
  }
}

/**
 * 코드아이템(소분류) Validation
 */
export class CodeItemValidator {
  // 제어 문자 검증
  private static hasControlCharacters(value: string): boolean {
    // eslint-disable-next-line no-control-regex
    return /[\x00-\x1F\x7F-\x9F]/.test(value);
  }

  // 코드 validation (빈 값 허용 - 백엔드 자동 채번)
  static validateCode(value: string | null | undefined): ValidationResult {
    // 빈 값인 경우 백엔드에서 자동 채번되므로 통과
    if (!value || String(value).trim() === '') {
      return { isValid: true };
    }

    const code = String(value).trim();

    if (this.hasControlCharacters(code)) {
      return {
        isValid: false,
        message: '알 수 없는 제어 문자가 포함되어 있습니다. 입력 문자 점검 후 다시 시도해주세요.',
      };
    }

    if (code.length > 50) {
      return { isValid: false, message: '코드는 50자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 코드명 validation
  static validateCodeName(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '코드명은 필수입니다' };
    }

    const codeName = String(value).trim();

    if (this.hasControlCharacters(codeName)) {
      return {
        isValid: false,
        message: '알 수 없는 제어 문자가 포함되어 있습니다. 입력 문자 점검 후 다시 시도해주세요.',
      };
    }

    if (codeName.length > 100) {
      return { isValid: false, message: '코드명은 100자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 필드별 validation 결과 반환
  static validateByField(data: { code?: string; codeName?: string }): FieldValidationResult {
    return {
      code: this.validateCode(data.code),
      codeName: this.validateCodeName(data.codeName),
    };
  }
}
