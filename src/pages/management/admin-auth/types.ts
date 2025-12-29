// frontend/src/pages/management/admin-auth/types.ts

/**
 * API 응답 사용자 타입 (kc_user_account)
 * API spec 문서의 1) 사용자 섹션 참조
 */
export type UserAccountApiItem = {
  kcUserId: number;
  oidcSub: string;
  username: string;
  email: string;
  hrEmployeeId: number | null;
  empNo: string | null;
  empName: string | null;
  deptCode: string | null;
  deptName1: string | null;
  deptName2: string | null;
  jobTitleCode: string | null;
  jobTitleName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roleCodes: string[];
};

/**
 * 그리드에서 사용하는 Row 타입
 */
export type RowItem = {
  no: number;
  kcUserId: number | null; // 신규 생성 시 null
  username: string;
  email: string;
  empNo: string;
  empName: string;
  deptName: string; // deptName1 + deptName2 조합
  roleCodes: string[]; // 권한 코드 배열
  isActive: boolean;
};

/**
 * 기존 타입 호환을 위한 AdminAuthItem (deprecated)
 */
export type AdminAuthItem = {
  id: number | string;
  user_name: string;
  position: string;
  team_1st: string;
  team_2nd: string;
  use_permission: string;
  approval_permission: '요청자' | '결재자';
  status: '활성' | '비활성';
};
