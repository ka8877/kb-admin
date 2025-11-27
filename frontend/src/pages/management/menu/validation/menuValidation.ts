// frontend/src/pages/management/menu/validation/menuValidation.ts

/**
 * 메뉴 관리 Validation 모듈
 */

import type { MenuScreenItem } from '../types';

export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

export type MenuFormData = Partial<MenuScreenItem>;

export class MenuValidator {
  /**
   * 메뉴 폼 데이터 유효성 검증
   */
  static validateMenuForm(data: MenuFormData, isNew: boolean): ValidationResult {
    const errors: Record<string, string> = {};

    // 화면 ID 검증
    if (!data.screen_id || data.screen_id.trim() === '') {
      errors.screen_id = '화면 ID는 필수 입력입니다.';
    } else if (!/^[A-Z_]+$/.test(data.screen_id)) {
      errors.screen_id = '화면 ID는 대문자와 언더스코어(_)만 사용 가능합니다.';
    } else if (data.screen_id.length > 50) {
      errors.screen_id = '화면 ID는 50자를 초과할 수 없습니다.';
    }

    // 화면명 검증
    if (!data.screen_name || data.screen_name.trim() === '') {
      errors.screen_name = '화면명은 필수 입력입니다.';
    } else if (data.screen_name.length > 100) {
      errors.screen_name = '화면명은 100자를 초과할 수 없습니다.';
    }

    // PATH 검증
    if (!data.path || data.path.trim() === '') {
      errors.path = 'PATH는 필수 입력입니다.';
    } else if (!data.path.startsWith('/')) {
      errors.path = 'PATH는 "/"로 시작해야 합니다.';
    } else if (!/^\/[a-z0-9\-\/]*$/.test(data.path)) {
      errors.path = 'PATH는 소문자, 숫자, 하이픈(-), 슬래시(/)만 사용 가능합니다.';
    } else if (data.path.length > 200) {
      errors.path = 'PATH는 200자를 초과할 수 없습니다.';
    }

    // DEPTH 검증
    if (data.depth === undefined || data.depth === null) {
      errors.depth = 'DEPTH는 필수 입력입니다.';
    } else if (data.depth < 0 || data.depth > 5) {
      errors.depth = 'DEPTH는 0~5 사이의 값이어야 합니다.';
    }

    // 순서 검증
    if (data.order === undefined || data.order === null) {
      errors.order = '순서는 필수 입력입니다.';
    } else if (data.order < 1 || data.order > 999) {
      errors.order = '순서는 1~999 사이의 값이어야 합니다.';
    }

    // 화면타입 검증
    if (!data.screen_type) {
      errors.screen_type = '화면타입은 필수 입력입니다.';
    } else if (!['메뉴', '페이지', '기능'].includes(data.screen_type)) {
      errors.screen_type = '유효하지 않은 화면타입입니다.';
    }

    // 표시여부 검증
    if (!data.display_yn) {
      errors.display_yn = '표시여부는 필수 입력입니다.';
    } else if (!['Y', 'N'].includes(data.display_yn)) {
      errors.display_yn = '유효하지 않은 표시여부 값입니다.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * 화면 ID 중복 체크 (비동기)
   */
  static async checkDuplicateScreenId(
    screenId: string,
    existingMenus: MenuScreenItem[],
    currentMenuId?: string | number,
  ): Promise<boolean> {
    const isDuplicate = existingMenus.some(
      (menu) => menu.screen_id === screenId && menu.id !== currentMenuId,
    );
    return isDuplicate;
  }

  /**
   * 순환 참조 체크 (부모가 자식이 되는 경우)
   */
  static checkCircularReference(
    menuId: string | number,
    parentScreenId: string | undefined,
    allMenus: MenuScreenItem[],
  ): boolean {
    if (!parentScreenId) return false;

    const visited = new Set<string | number>();
    let currentParentId: string | undefined = parentScreenId;

    while (currentParentId) {
      const parentMenu = allMenus.find((m) => m.screen_id === currentParentId);
      if (!parentMenu) break;

      if (parentMenu.id === menuId) {
        return true; // 순환 참조 발견
      }

      if (visited.has(parentMenu.id)) {
        break; // 무한 루프 방지
      }

      visited.add(parentMenu.id);
      currentParentId = parentMenu.parent_screen_id;
    }

    return false;
  }
}
