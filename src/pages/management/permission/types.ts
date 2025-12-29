// 권한 관리 타입 정의

/**
 * API 응답 타입 (백엔드 응답 구조)
 * API spec: GET /api/v1/roles
 */
export type RoleApiItem = {
  roleId: number;
  roleCode: string;
  roleName: string;
  isActive: boolean;
};

/**
 * 화면 표시용 타입
 */
export type PermissionItem = {
  id: number; // roleId
  permission_id: string; // roleCode
  permission_name: string; // roleName
  status: '활성' | '비활성'; // isActive 변환
  created_at?: string;
  updated_at?: string;
};

export type RowItem = PermissionItem & {
  no: number; // 화면 표시용 번호
};
