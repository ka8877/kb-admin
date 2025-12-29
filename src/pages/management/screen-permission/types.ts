// 화면 권한 관리 타입 정의

/**
 * 권한(Role) 타입
 * API spec: GET /api/v1/roles
 */
export interface Permission {
  permission_id: number; // roleId
  permission_code: string; // roleCode
  permission_name: string; // roleName
  description?: string;
  is_active: number; // isActive (boolean -> number 변환)
  created_at?: string;
  updated_at?: string | null;
}

export interface PermissionDisplay extends Permission {
  no: number;
}

/**
 * 메뉴 API 응답 타입
 * API spec: GET /api/v1/menus
 */
export interface MenuApiItem {
  menuId: number;
  menuCode: string;
  menuName: string;
  menuPath: string;
  parentMenuCode: string | null;
  depth: number;
  sortOrder: number;
  isVisible: boolean;
  isActive: boolean;
}

/**
 * 화면 표시용 메뉴 트리 아이템
 */
export interface MenuTreeItem {
  id: string | number; // menuId
  label: string; // menuName
  path: string; // menuPath
  code: string; // menuCode
  depth?: number;
  sort_order?: number;
  children?: MenuTreeItem[];
}

/**
 * 권한별 메뉴 접근 정보 (단일 메뉴)
 * API spec: GET /api/v1/roles/{roleCode}/menu-access -> data.menus[]
 */
export interface MenuAccessItem {
  menuCode: string;
  menuName: string;
  parentMenuCode: string | null;
  depth: number;
  sortOrder: number;
  isVisible: boolean;
  granted: boolean; // 접근 권한 여부
  accessMode: 'READ' | 'WRITE' | null;
}

/**
 * 권한별 메뉴 접근 API 응답
 */
export interface RoleMenuAccessResponse {
  roleId: number;
  roleCode: string;
  roleName: string;
  menus: MenuAccessItem[];
}

/**
 * 화면 권한 (레거시 호환용)
 */
export interface ScreenPermission {
  id: string | number;
  permission_id: number;
  menu_id: string | number;
  created_at?: string;
  updated_at?: string;
}

/**
 * 화면 권한 저장 입력
 */
export interface ScreenPermissionInput {
  menu_id: string | number;
}
