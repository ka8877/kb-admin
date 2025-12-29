// frontend/src/pages/management/menu/validation/menuValidation.ts

/**
 * 메뉴 관리 Validation 모듈
 */

import type { MenuItem } from '../types';

export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

export type MenuFormData = Partial<MenuItem>;

export class MenuValidator {
  /**
   * 메뉴 폼 데이터 유효성 검증
   */
  static validateMenuForm(data: MenuFormData): ValidationResult {
    const errors: Record<string, string> = {};

    // 메뉴 코드 검증
    if (!data.menuCode || data.menuCode.trim() === '') {
      errors.menuCode = '메뉴 코드는 필수 입력입니다.';
    } else if (!/^[A-Z_]+$/.test(data.menuCode)) {
      errors.menuCode = '메뉴 코드는 대문자와 언더스코어(_)만 사용 가능합니다.';
    } else if (data.menuCode.length > 50) {
      errors.menuCode = '메뉴 코드는 50자를 초과할 수 없습니다.';
    }

    // 메뉴명 검증
    if (!data.menuName || data.menuName.trim() === '') {
      errors.menuName = '메뉴명은 필수 입력입니다.';
    } else if (data.menuName.length > 100) {
      errors.menuName = '메뉴명은 100자를 초과할 수 없습니다.';
    }

    // 메뉴 경로 검증 (선택)
    if (data.menuPath) {
      if (!data.menuPath.startsWith('/')) {
        errors.menuPath = '메뉴 경로는 "/"로 시작해야 합니다.';
      } else if (!/^[/a-z0-9-]*$/.test(data.menuPath)) {
        errors.menuPath = '메뉴 경로는 소문자, 숫자, 하이픈(-), 슬래시(/)만 사용 가능합니다.';
      } else if (data.menuPath.length > 200) {
        errors.menuPath = '메뉴 경로는 200자를 초과할 수 없습니다.';
      }
    }

    // 깊이 검증
    if (data.depth !== undefined && data.depth !== null) {
      if (data.depth < 1 || data.depth > 5) {
        errors.depth = '깊이는 1~5 사이의 값이어야 합니다.';
      }
    }

    // 정렬 순서 검증
    if (data.sortOrder !== undefined && data.sortOrder !== null) {
      if (data.sortOrder < 1 || data.sortOrder > 999) {
        errors.sortOrder = '정렬 순서는 1~999 사이의 값이어야 합니다.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * 메뉴 코드 중복 체크
   */
  static checkDuplicateMenuCode(
    menuCode: string,
    existingMenus: MenuItem[],
    currentMenuId?: number
  ): boolean {
    return existingMenus.some(
      (menu) => menu.menuCode === menuCode && menu.menuId !== currentMenuId
    );
  }

  /**
   * 순환 참조 체크 (부모가 자식이 되는 경우)
   */
  static checkCircularReference(
    menuCode: string,
    parentMenuCode: string | null | undefined,
    allMenus: MenuItem[]
  ): boolean {
    if (!parentMenuCode) return false;

    const visited = new Set<string>();
    let currentParentCode: string | null | undefined = parentMenuCode;

    while (currentParentCode) {
      const parentMenu = allMenus.find((m) => m.menuCode === currentParentCode);
      if (!parentMenu) break;

      if (parentMenu.menuCode === menuCode) {
        return true; // 순환 참조 발견
      }

      if (visited.has(parentMenu.menuCode)) {
        break; // 무한 루프 방지
      }

      visited.add(parentMenu.menuCode);
      currentParentCode = parentMenu.parentMenuCode;
    }

    return false;
  }
}
