// frontend/src/pages/management/admin-auth/types.ts

export type AdminAuthItem = {
  id: number | string;
  user_name: string; // 사용자명
  position: string; // 직책
  team_1st: string; // 1차팀
  team_2nd: string; // 2차팀
  use_permission: string; // 이용권한 (권한관리 데이터 기준, 동적 코드 허용)
  approval_permission: '요청자' | '결재자'; // 결재권한
  status: '활성' | '비활성'; // 활성여부
};

export type RowItem = AdminAuthItem & {
  no: number;
};
