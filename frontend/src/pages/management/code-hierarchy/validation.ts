// frontend/src/pages/management/code-hierarchy/validation.ts

/**
 * 계층 구조 코드 관리 Validation 규칙
 */

export type ValidationResult = {
  isValid: boolean;
  message?: string;
};

export type FieldValidationResult = {
  [key: string]: ValidationResult;
};

export interface HierarchyFormData {
  parentType?: string;
  parentLabel?: string;
  childType?: string;
  childLabel?: string;
  relationField?: string;
}

export class HierarchyValidator {
  // 부모 타입 validation
  static validateParentType(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '부모 코드 타입을 선택하세요.' };
    }
    return { isValid: true };
  }

  // 부모 레이블 validation
  static validateParentLabel(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '부모 레이블을 입력하세요.' };
    }
    return { isValid: true };
  }

  // 자식 타입 validation
  static validateChildType(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '자식 코드 타입을 선택하세요.' };
    }
    return { isValid: true };
  }

  // 자식 레이블 validation
  static validateChildLabel(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '자식 레이블을 입력하세요.' };
    }
    return { isValid: true };
  }

  // 관계 필드명 validation
  static validateRelationField(value: string | null | undefined): ValidationResult {
    if (!value || String(value).trim() === '') {
      return { isValid: false, message: '관계 필드명을 입력하세요.' };
    }

    const fieldPattern = /^[a-z][a-z0-9_]*$/;
    if (!fieldPattern.test(String(value))) {
      return {
        isValid: false,
        message: '관계 필드명은 소문자, 숫자, 언더스코어(_)만 사용하며 소문자로 시작해야 합니다.',
      };
    }

    return { isValid: true };
  }

  // 부모와 자식 타입 일치 검증
  static validateTypesDifferent(
    parentType: string | null | undefined,
    childType: string | null | undefined,
  ): ValidationResult {
    if (parentType && childType && parentType === childType) {
      return {
        isValid: false,
        message: '부모와 자식 코드 타입은 달라야 합니다.',
      };
    }
    return { isValid: true };
  }

  // 전체 데이터 validation
  static validateAll(data: HierarchyFormData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const parentTypeResult = this.validateParentType(data.parentType);
    if (!parentTypeResult.isValid) errors.push(parentTypeResult.message!);

    const parentLabelResult = this.validateParentLabel(data.parentLabel);
    if (!parentLabelResult.isValid) errors.push(parentLabelResult.message!);

    const childTypeResult = this.validateChildType(data.childType);
    if (!childTypeResult.isValid) errors.push(childTypeResult.message!);

    const childLabelResult = this.validateChildLabel(data.childLabel);
    if (!childLabelResult.isValid) errors.push(childLabelResult.message!);

    const relationFieldResult = this.validateRelationField(data.relationField);
    if (!relationFieldResult.isValid) errors.push(relationFieldResult.message!);

    const typesDifferentResult = this.validateTypesDifferent(data.parentType, data.childType);
    if (!typesDifferentResult.isValid) errors.push(typesDifferentResult.message!);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // 필드별 validation 결과 반환
  static validateByField(data: HierarchyFormData): FieldValidationResult {
    return {
      parentType: this.validateParentType(data.parentType),
      parentLabel: this.validateParentLabel(data.parentLabel),
      childType: this.validateChildType(data.childType),
      childLabel: this.validateChildLabel(data.childLabel),
      relationField: this.validateRelationField(data.relationField),
      typesDifferent: this.validateTypesDifferent(data.parentType, data.childType),
    };
  }
}
