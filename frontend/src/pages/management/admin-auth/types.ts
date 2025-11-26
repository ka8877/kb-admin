// frontend/src/pages/management/admin-auth/types.ts

export type AdminAuthItem = {
  id: number;
  user_name: string; // 사용자명
  position: string; // 직책
  team_1st: string; // 1차팀
  team_2nd: string; // 2차팀
  use_permission: 'ADMIN' | 'OPERATOR' | 'VIEWER'; // 이용권한
  approval_permission: '요청자' | '결재자'; // 결재권한
  status: '활성' | '비활성'; // 활성여부
};

export type RowItem = AdminAuthItem & {
  no: number;
};
