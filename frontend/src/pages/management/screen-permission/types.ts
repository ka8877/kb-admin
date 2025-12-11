// 화면 권한 관리 타입 정의

export interface Permission {
  permission_id: number;
  permission_code: string;
  permission_name: string;
  description?: string;
  is_active: number;
  created_at: string;
  updated_at: string | null;
  firebaseKey?: string;
}

export interface PermissionDisplay extends Permission {
  no: number;
}

export interface MenuTreeItem {
  id: string | number;
  label: string;
  path: string;
  children?: MenuTreeItem[];
}

export interface ScreenPermission {
  id: number;
  permission_id: number;
  menu_id: string | number;
  created_at: string;
  updated_at: string;
}

export interface ScreenPermissionInput {
  menu_id: string | number;
}
