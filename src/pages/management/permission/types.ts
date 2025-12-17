// 권한 관리 타입 정의
export type PermissionItem = {
  id: string | number;
  permission_id: string; // 권한 ID
  permission_name: string; // 권한명
  status: '활성' | '비활성'; // 등록상태
  created_at?: string;
  updated_at?: string;
};

export type RowItem = PermissionItem & {
  no: number; // 화면 표시용 번호
};
