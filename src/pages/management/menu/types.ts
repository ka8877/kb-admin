// 메뉴 관리 타입 정의 (ui_menu 테이블 기반)
// API spec 3) 메뉴 섹션 참조

/**
 * 메뉴 API 응답 타입
 */
export interface MenuItem {
  menuId?: number; // PK (생성 시에는 없음)
  menuCode: string; // UK
  menuName: string;
  menuPath: string | null;
  parentMenuCode: string | null;
  depth: number; // 계층 깊이
  sortOrder: number;
  isVisible: boolean; // 표시 여부
  isActive: boolean; // 사용 여부
}

/**
 * 화면 표시용 메뉴 아이템
 */
export interface MenuItemDisplay extends MenuItem {
  no: number; // 화면 표시용 번호
}

// 하위 호환성을 위한 타입 별칭
export type RowItem = MenuItemDisplay;
