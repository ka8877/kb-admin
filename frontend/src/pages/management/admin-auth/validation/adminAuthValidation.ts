// frontend/src/pages/management/admin-auth/validation/adminAuthValidation.ts

/**
 * 어드민 권한관리 공통 Validation 규칙
 */

// 공통 validation 결과 타입
export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

// 필드별 validation 결과 타입
export type FieldValidationResult = {
  [key: string]: ValidationResult;
};

// 공통 validation 규칙 인터페이스
export interface AdminAuthData {
  user_name?: string;
  position?: string;
  team_1st?: string;
  team_2nd?: string;
  use_permission?: 'ADMIN' | 'OPERATOR' | 'VIEWER';
  approval_permission?: '요청자' | '결재자';
  status?: '활성' | '비활성';
}

/**
 * 공통 Validation 규칙 클래스
 */
export class AdminAuthValidator {
  // 제어 문자 검증
  private static hasControlCharacters(value: string): boolean {
    // eslint-disable-next-line no-control-regex
    return /[\x00-\x1F\x7F-\x9F]/.test(value);
  }

  // 사용자명 validation
  static validateUserName(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '사용자명은 필수입니다' };
    }

    const userName = String(value).trim();

    if (this.hasControlCharacters(userName)) {
      return {
        isValid: false,
        message: '알 수 없는 제어 문자가 포함되어 있습니다. 입력 문자 점검 후 다시 시도해주세요.',
      };
    }

    if (userName.length > 50) {
      return { isValid: false, message: '사용자명은 50자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 직책 validation
  static validatePosition(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '직책은 필수입니다' };
    }

    const position = String(value).trim();

    if (this.hasControlCharacters(position)) {
      return {
        isValid: false,
        message: '알 수 없는 제어 문자가 포함되어 있습니다. 입력 문자 점검 후 다시 시도해주세요.',
      };
    }

    if (position.length > 50) {
      return { isValid: false, message: '직책은 50자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 1차팀 validation
  static validateTeam1st(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '1차팀은 필수입니다' };
    }

    const team = String(value).trim();

    if (this.hasControlCharacters(team)) {
      return {
        isValid: false,
        message: '알 수 없는 제어 문자가 포함되어 있습니다. 입력 문자 점검 후 다시 시도해주세요.',
      };
    }

    if (team.length > 100) {
      return { isValid: false, message: '1차팀은 100자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 2차팀 validation
  static validateTeam2nd(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '2차팀은 필수입니다' };
    }

    const team = String(value).trim();

    if (this.hasControlCharacters(team)) {
      return {
        isValid: false,
        message: '알 수 없는 제어 문자가 포함되어 있습니다. 입력 문자 점검 후 다시 시도해주세요.',
      };
    }

    if (team.length > 100) {
      return { isValid: false, message: '2차팀은 100자를 초과할 수 없습니다' };
    }

    return { isValid: true };
  }

  // 이용권한 validation
  static validateUsePermission(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '이용권한은 필수입니다' };
    }

    const validPermissions = ['ADMIN', 'OPERATOR', 'VIEWER'];
    if (!validPermissions.includes(String(value))) {
      return {
        isValid: false,
        message: '올바른 이용권한을 선택해주세요 (ADMIN, OPERATOR, VIEWER)',
      };
    }

    return { isValid: true };
  }

  // 결재권한 validation
  static validateApprovalPermission(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '결재권한은 필수입니다' };
    }

    const validPermissions = ['요청자', '결재자'];
    if (!validPermissions.includes(String(value))) {
      return { isValid: false, message: '올바른 결재권한을 선택해주세요 (요청자, 결재자)' };
    }

    return { isValid: true };
  }

  // 활성여부 validation
  static validateStatus(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '활성여부는 필수입니다' };
    }

    const validStatus = ['활성', '비활성'];
    if (!validStatus.includes(String(value))) {
      return { isValid: false, message: '올바른 활성여부를 선택해주세요 (활성, 비활성)' };
    }

    return { isValid: true };
  }

  // 전체 데이터 validation
  static validateAll(data: AdminAuthData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const userNameResult = this.validateUserName(data.user_name);
    if (!userNameResult.isValid) errors.push(userNameResult.message!);

    const positionResult = this.validatePosition(data.position);
    if (!positionResult.isValid) errors.push(positionResult.message!);

    const team1stResult = this.validateTeam1st(data.team_1st);
    if (!team1stResult.isValid) errors.push(team1stResult.message!);

    const team2ndResult = this.validateTeam2nd(data.team_2nd);
    if (!team2ndResult.isValid) errors.push(team2ndResult.message!);

    const usePermissionResult = this.validateUsePermission(data.use_permission);
    if (!usePermissionResult.isValid) errors.push(usePermissionResult.message!);

    const approvalPermissionResult = this.validateApprovalPermission(data.approval_permission);
    if (!approvalPermissionResult.isValid) errors.push(approvalPermissionResult.message!);

    const statusResult = this.validateStatus(data.status);
    if (!statusResult.isValid) errors.push(statusResult.message!);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // 필드별 validation 결과 반환
  static validateByField(data: AdminAuthData): FieldValidationResult {
    return {
      user_name: this.validateUserName(data.user_name),
      position: this.validatePosition(data.position),
      team_1st: this.validateTeam1st(data.team_1st),
      team_2nd: this.validateTeam2nd(data.team_2nd),
      use_permission: this.validateUsePermission(data.use_permission),
      approval_permission: this.validateApprovalPermission(data.approval_permission),
      status: this.validateStatus(data.status),
    };
  }
}
