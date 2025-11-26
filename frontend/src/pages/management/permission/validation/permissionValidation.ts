// frontend/src/pages/management/permission/validation/permissionValidation.ts

/**
 * 권한 관리 Validation 규칙
 */

// 공통 validation 결과 타입
export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

// 공통 validation 규칙 인터페이스
export interface PermissionData {
  permission_id?: string;
  permission_name?: string;
  status?: '활성' | '비활성';
}

/**
 * 공통 Validation 규칙 클래스
 */
export class PermissionValidator {
  // 제어 문자 검증
  private static hasControlCharacters(value: string): boolean {
    // eslint-disable-next-line no-control-regex
    return /[\x00-\x1F\x7F-\x9F]/.test(value);
  }

  // 권한 ID validation
  static validatePermissionId(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '권한 ID는 필수입니다' };
    }

    const permissionId = String(value).trim();

    if (this.hasControlCharacters(permissionId)) {
      return {
        isValid: false,
        message: '알 수 없는 제어 문자가 포함되어 있습니다. 입력 문자 점검 후 다시 시도해주세요.',
      };
    }

    if (permissionId.length > 50) {
      return { isValid: false, message: '권한 ID는 50자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 권한명 validation
  static validatePermissionName(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '권한명은 필수입니다' };
    }

    const permissionName = String(value).trim();

    if (this.hasControlCharacters(permissionName)) {
      return {
        isValid: false,
        message: '알 수 없는 제어 문자가 포함되어 있습니다. 입력 문자 점검 후 다시 시도해주세요.',
      };
    }

    if (permissionName.length > 100) {
      return { isValid: false, message: '권한명은 100자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 등록상태 validation
  static validateStatus(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '등록상태는 필수입니다' };
    }

    const validStatus = ['활성', '비활성'];
    if (!validStatus.includes(String(value))) {
      return { isValid: false, message: '올바른 등록상태를 선택해주세요 (활성, 비활성)' };
    }

    return { isValid: true };
  }

  // 전체 데이터 validation
  static validateAll(data: PermissionData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const permissionIdResult = this.validatePermissionId(data.permission_id);
    if (!permissionIdResult.isValid) errors.push(permissionIdResult.message!);

    const permissionNameResult = this.validatePermissionName(data.permission_name);
    if (!permissionNameResult.isValid) errors.push(permissionNameResult.message!);

    const statusResult = this.validateStatus(data.status);
    if (!statusResult.isValid) errors.push(statusResult.message!);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
